/**
 * ADR-023 Phase 2: Supabase Storage Provider
 *
 * Implements StorageProvider interface using Supabase as backend.
 * Requires user to be authenticated.
 */

import { getSupabaseClient, getCurrentUser } from '../supabase'
import {
  AttemptRecord,
  SessionRecord,
  SaveAttemptInput,
  TopicStats,
  StorageProvider
} from './types'

class SupabaseStorageProvider implements StorageProvider {
  private currentSessionId: string | null = null

  private async getUserId(): Promise<string> {
    const user = await getCurrentUser()
    if (!user) throw new Error('User not authenticated')
    return user.id
  }

  private getClient() {
    const client = getSupabaseClient()
    if (!client) throw new Error('Supabase not configured')
    return client
  }

  // Attempts

  async getAttempts(): Promise<AttemptRecord[]> {
    const client = this.getClient()
    const userId = await this.getUserId()

    const { data, error } = await client
      .from('attempts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async saveAttempt(input: SaveAttemptInput): Promise<AttemptRecord> {
    const client = this.getClient()
    const userId = await this.getUserId()

    const attempt = {
      user_id: userId,
      session_id: this.currentSessionId,
      ...input,
      created_at: new Date().toISOString()
    }

    const { data, error } = await client
      .from('attempts')
      .insert(attempt)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getAttemptsForQuestion(questionId: string): Promise<AttemptRecord[]> {
    const client = this.getClient()
    const userId = await this.getUserId()

    const { data, error } = await client
      .from('attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('question_id', questionId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getAttemptsForTopic(topic: string): Promise<AttemptRecord[]> {
    const client = this.getClient()
    const userId = await this.getUserId()

    const { data, error } = await client
      .from('attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('topic', topic)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getRecentAttempts(days: number = 7): Promise<AttemptRecord[]> {
    const client = this.getClient()
    const userId = await this.getUserId()
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)

    const { data, error } = await client
      .from('attempts')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', cutoff.toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Sessions

  async getSessions(): Promise<SessionRecord[]> {
    const client = this.getClient()
    const userId = await this.getUserId()

    const { data, error } = await client
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async startSession(topic: string): Promise<string> {
    const client = this.getClient()
    const userId = await this.getUserId()

    const session = {
      user_id: userId,
      topic,
      started_at: new Date().toISOString(),
      ended_at: null,
      problems_count: 0
    }

    const { data, error } = await client
      .from('sessions')
      .insert(session)
      .select()
      .single()

    if (error) throw error

    this.currentSessionId = data.id
    return data.id
  }

  async endSession(): Promise<void> {
    if (!this.currentSessionId) return

    const client = this.getClient()

    // Count attempts in this session
    const { count } = await client
      .from('attempts')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', this.currentSessionId)

    // Update session
    await client
      .from('sessions')
      .update({
        ended_at: new Date().toISOString(),
        problems_count: count || 0
      })
      .eq('id', this.currentSessionId)

    this.currentSessionId = null
  }

  getCurrentSessionId(): string | null {
    return this.currentSessionId
  }

  // Analytics

  async getTopicStats(): Promise<TopicStats[]> {
    const client = this.getClient()
    const userId = await this.getUserId()

    // Define type for the partial attempt data we're selecting
    type AttemptStatsRow = {
      topic: string
      is_correct: boolean
      hints_used: number
      time_spent_ms: number
    }

    // Get all attempts for user
    const { data: attempts, error } = await client
      .from('attempts')
      .select('topic, is_correct, hints_used, time_spent_ms')
      .eq('user_id', userId)

    if (error) throw error
    if (!attempts || attempts.length === 0) return []

    // Group by topic and calculate stats
    const byTopic = new Map<string, AttemptStatsRow[]>()
    for (const attempt of attempts as AttemptStatsRow[]) {
      const list = byTopic.get(attempt.topic) || []
      list.push(attempt)
      byTopic.set(attempt.topic, list)
    }

    const stats: TopicStats[] = []
    for (const [topic, topicAttempts] of byTopic) {
      const correct = topicAttempts.filter((a: AttemptStatsRow) => a.is_correct).length
      stats.push({
        topic,
        total_attempts: topicAttempts.length,
        correct_count: correct,
        accuracy: topicAttempts.length > 0 ? correct / topicAttempts.length : 0,
        avg_hints: topicAttempts.reduce((sum: number, a: AttemptStatsRow) => sum + a.hints_used, 0) / topicAttempts.length || 0,
        avg_time_ms: topicAttempts.reduce((sum: number, a: AttemptStatsRow) => sum + a.time_spent_ms, 0) / topicAttempts.length || 0
      })
    }

    return stats
  }
}

// Singleton instance
export const supabaseStorageProvider = new SupabaseStorageProvider()

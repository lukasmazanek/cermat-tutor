/**
 * QuestionDisplay - ADR-028
 * Centralized component for rendering question text + diagram
 * Single source of truth - prevents forgetting diagram support in new pages
 */

import DiagramRenderer from './diagrams/DiagramRenderer'
import { getQuestionText } from '../lib/questionUtils'
import { DiagramConfig } from '../types'

interface QuestionDisplayProps {
  question: {
    question: { stem?: string | null; context?: string | null }
    diagram?: DiagramConfig
  }
  /** Container className */
  className?: string
  /** Text paragraph className */
  textClassName?: string
  /** Show monospace font (for type recognition) */
  mono?: boolean
}

/**
 * Parse markdown table to structured data
 */
function parseMarkdownTable(text: string): { before: string; table: string[][] | null; after: string } {
  const lines = text.split('\n')
  const tableStart = lines.findIndex(line => line.trim().startsWith('|'))

  if (tableStart === -1) {
    return { before: text, table: null, after: '' }
  }

  // Find table end
  let tableEnd = tableStart
  while (tableEnd < lines.length && lines[tableEnd].trim().startsWith('|')) {
    tableEnd++
  }

  const tableLines = lines.slice(tableStart, tableEnd)
  const before = lines.slice(0, tableStart).join('\n').trim()
  const after = lines.slice(tableEnd).join('\n').trim()

  // Parse table rows (skip separator row with dashes)
  const rows: string[][] = []
  for (const line of tableLines) {
    if (line.includes('---')) continue // Skip separator
    const cells = line.split('|').filter(cell => cell.trim() !== '').map(cell => cell.trim())
    if (cells.length > 0) {
      rows.push(cells)
    }
  }

  return { before, table: rows.length > 0 ? rows : null, after }
}

/**
 * Render a markdown table as HTML table
 */
function MarkdownTable({ rows }: { rows: string[][] }) {
  if (rows.length === 0) return null

  const [header, ...body] = rows

  return (
    <div className="overflow-x-auto my-3">
      <table className="min-w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-100">
            {header.map((cell, i) => (
              <th key={i} className="border border-slate-300 px-3 py-2 text-left font-semibold text-slate-700">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, rowIdx) => (
            <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="border border-slate-300 px-3 py-2 text-slate-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Renders question with optional diagram
 *
 * @example
 * <QuestionDisplay
 *   question={problem}
 *   className="bg-white rounded-2xl shadow-sm p-5"
 *   textClassName="text-lg text-center text-slate-800 font-medium"
 * />
 */
function QuestionDisplay({ question, className, textClassName, mono }: QuestionDisplayProps) {
  const text = getQuestionText(question)

  // Check for markdown table
  const { before, table, after } = parseMarkdownTable(text)

  return (
    <div className={className}>
      {question.diagram && (
        <DiagramRenderer diagram={question.diagram} />
      )}
      {table ? (
        <>
          {before && (
            <p className={`${textClassName || ''} ${mono ? 'font-mono' : ''}`}>
              {before}
            </p>
          )}
          <MarkdownTable rows={table} />
          {after && (
            <p className={`${textClassName || ''} ${mono ? 'font-mono' : ''} mt-3`}>
              {after}
            </p>
          )}
        </>
      ) : (
        <p className={`${textClassName || ''} ${mono ? 'font-mono' : ''}`}>
          {text}
        </p>
      )}
    </div>
  )
}

export default QuestionDisplay

#!/bin/bash
# Sync data from source to app
# Pipeline: source → generate → sync to app
# Run: npm run sync-data

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
GENERATED_DIR="$ROOT_DIR/data/generated"
APP_DATA_DIR="$ROOT_DIR/app/src/data"

echo "=== Data Pipeline ==="
echo ""

# Step 1: Generate formats from source
echo "1. Generating formats from unified source..."
node "$SCRIPT_DIR/generate-formats.js"
echo ""

# Step 2: Sync to app
echo "2. Syncing to app..."

# Create target directories
mkdir -p "$APP_DATA_DIR"

# Sync generated data (single unified file)
cp "$GENERATED_DIR/questions.json" "$APP_DATA_DIR/"

echo "  ✓ questions.json"

# Sync taxonomy files (direct copy, not generated)
if [ -f "$ROOT_DIR/data/taxonomy/topic_type_mapping.json" ]; then
  cp "$ROOT_DIR/data/taxonomy/topic_type_mapping.json" "$APP_DATA_DIR/"
  echo "  ✓ topic_type_mapping.json"
fi

# Sync student profiles (direct copy, not generated)
mkdir -p "$APP_DATA_DIR/profiles"
if [ -d "$ROOT_DIR/data/psychology/profiles" ]; then
  cp "$ROOT_DIR/data/psychology/profiles/"*.json "$APP_DATA_DIR/profiles/" 2>/dev/null || true
  echo "  ✓ profiles/*.json"
fi

echo ""
echo "=== Pipeline complete ==="

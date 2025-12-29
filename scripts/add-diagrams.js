/**
 * Script to add diagrams to geometry questions
 * Run: node scripts/add-diagrams.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.join(__dirname, '../data/source/content');

// Helper to parse pythagorean calculation questions
function parsePythagorean(stem, context, id) {
  const text = `${stem || ''} ${context || ''}`;

  // Skip type recognition questions (PYTH-T*)
  if (id?.startsWith('PYTH-T')) {
    return null; // These are multiple choice, no diagram needed
  }

  // Pattern: a = X, b = Y, c = ?
  let match = stem?.match(/a\s*=\s*(\d+),?\s*b\s*=\s*(\d+),?\s*c\s*=\s*\?/i);
  if (match) {
    return { type: 'right_triangle', labels: { a: match[1], b: match[2], c: '?' }, highlight: 'c' };
  }

  // Pattern: a = ?, b = X, c = Y
  match = stem?.match(/a\s*=\s*\?,?\s*b\s*=\s*(\d+),?\s*c\s*=\s*(\d+)/i);
  if (match) {
    return { type: 'right_triangle', labels: { a: '?', b: match[1], c: match[2] }, highlight: 'a' };
  }

  // Pattern: a = X, b = ?, c = Y
  match = stem?.match(/a\s*=\s*(\d+),?\s*b\s*=\s*\?,?\s*c\s*=\s*(\d+)/i);
  if (match) {
    return { type: 'right_triangle', labels: { a: match[1], b: '?', c: match[2] }, highlight: 'b' };
  }

  // Pattern: Odvěsny jsou X a Y
  match = text.match(/odvěsn[yay]\s+jsou\s*(\d+)\s*a\s*(\d+)/i);
  if (match) {
    return { type: 'right_triangle', labels: { a: match[1], b: match[2], c: '?' }, highlight: 'c' };
  }

  // Pattern: Odvěsny X a Y (without "jsou")
  match = text.match(/odvěsn[yay]\s*(\d+)\s*a\s*(\d+)/i);
  if (match) {
    return { type: 'right_triangle', labels: { a: match[1], b: match[2], c: '?' }, highlight: 'c' };
  }

  // Pattern: Přepona z odvěsen X a Y
  match = text.match(/přepona\s+z\s+odvěsen\s*(\d+)\s*a\s*(\d+)/i);
  if (match) {
    return { type: 'right_triangle', labels: { a: match[1], b: match[2], c: '?' }, highlight: 'c' };
  }

  // Pattern: odvěsna Xcm, přepona Ycm
  match = text.match(/odvěsna\s*(\d+)\s*cm,?\s*přepona\s*(\d+)\s*cm/i);
  if (match) {
    return { type: 'right_triangle', labels: { a: `${match[1]} cm`, b: '?', c: `${match[2]} cm` }, highlight: 'b' };
  }

  // Pattern: Odvěsna X, přepona Y
  match = text.match(/odvěsna\s*(\d+),?\s*přepona\s*(\d+)/i);
  if (match) {
    return { type: 'right_triangle', labels: { a: match[1], b: '?', c: match[2] }, highlight: 'b' };
  }

  // Pattern: Odvěsna, je-li b=X, c=Y
  match = text.match(/odvěsna.*b\s*=\s*(\d+),?\s*c\s*=\s*(\d+)/i);
  if (match) {
    return { type: 'right_triangle', labels: { a: '?', b: match[1], c: match[2] }, highlight: 'a' };
  }

  // Pattern: Přepona X, odvěsna Y
  match = text.match(/přepona\s*(\d+),?\s*odvěsna\s*(\d+)/i);
  if (match) {
    return { type: 'right_triangle', labels: { a: match[2], b: '?', c: match[1] }, highlight: 'b' };
  }

  // Pattern: trojúhelník se stranami X, Y, Z
  match = text.match(/trojúhelník\s+se\s+stranami\s*(\d+),?\s*(\d+),?\s*(\d+)/i);
  if (match) {
    return { type: 'right_triangle', labels: { a: match[1], b: match[2], c: match[3] }, highlight: null };
  }

  // Pattern: rovnostranný trojúhelník se stranou X
  match = text.match(/rovnostranný\s+trojúhelník.*stran[ouaý]+\s*(\d+)/i);
  if (match) {
    return { type: 'equilateral_triangle', labels: { a: `${match[1]} cm` }, highlight: 'h' };
  }

  // Pattern: výšku rovnostranného trojúhelníku se stranou X
  match = text.match(/výšk.*rovnostranného\s+trojúhelník.*stran[ouaý]+\s*(\d+)/i);
  if (match) {
    return { type: 'equilateral_triangle', labels: { a: `${match[1]} cm` }, highlight: 'h' };
  }

  // Pattern: úhlopříčka obdélníku
  if (/úhlopříčk.*obdélník/i.test(text)) {
    match = text.match(/(\d+)\s*[×x]\s*(\d+)/);
    if (match) {
      return { type: 'rectangle', labels: { a: match[1], b: match[2], d: '?' }, highlight: 'd' };
    }
  }

  // Pattern: prostorové úhlopříčky kvádru
  if (/prostorov.*úhlopříčk.*kvádr/i.test(text)) {
    match = text.match(/(\d+)\s*[×x]\s*(\d+)\s*[×x]\s*(\d+)/);
    if (match) {
      return { type: 'cube', labels: { a: match[1], b: match[2], c: match[3], d: '?' }, highlight: 'd' };
    }
  }

  // Pattern: žebřík (ladder)
  if (/žebřík/i.test(text)) {
    const lengthMatch = text.match(/délky?\s*(\d+)\s*m/i);
    const heightMatch = text.match(/výšky?\s*(\d+)\s*m/i);
    if (lengthMatch && heightMatch) {
      return {
        type: 'ladder',
        labels: { ladder: `${lengthMatch[1]} m`, wall: `${heightMatch[1]} m`, ground: '?' },
        highlight: 'ground'
      };
    }
  }

  // Pattern: trojúhelník with sides
  match = text.match(/trojúhelník.*strany?\s*(\d+),?\s*(\d+)\s*a?\s*(\d+)/i);
  if (match) {
    return { type: 'right_triangle', labels: { a: match[1], b: match[2], c: match[3] }, highlight: 'c' };
  }

  return null;
}

// Helper to parse volume questions
function parseVolume(stem, context) {
  const text = `${stem || ''} ${context || ''}`;

  // Cube/Kvádr - with dimensions
  if (/kvádr/i.test(text)) {
    const match = text.match(/(\d+)\s*[×x]\s*(\d+)\s*[×x]\s*(\d+)/);
    if (match) {
      return { type: 'cube', labels: { a: match[1], b: match[2], c: match[3] }, highlight: null };
    }
    // Generic kvádr
    return { type: 'cube', labels: {}, highlight: null };
  }

  // Krychle (cube)
  if (/krychle|krychli|krychlí/i.test(text)) {
    const sideMatch = text.match(/hranu?\s*(\d+)/i);
    if (sideMatch) {
      return { type: 'cube', labels: { a: sideMatch[1] }, highlight: null };
    }
    return { type: 'cube', labels: {}, highlight: null };
  }

  // Cylinder/Válec
  if (/válec|válce/i.test(text)) {
    const rMatch = text.match(/poloměr(?:em)?\s*(?:podstavy)?\s*(\d+)/i) || text.match(/r\s*=\s*(\d+)/i);
    const hMatch = text.match(/výšk[au]\s*(\d+)/i) || text.match(/v\s*=\s*(\d+)/i);
    return {
      type: 'cylinder',
      labels: { r: rMatch?.[1] || '?', h: hMatch?.[1] || '?' },
      highlight: null
    };
  }

  // Prism/Hranol
  if (/hranol|prism/i.test(text)) {
    return { type: 'prism', labels: {}, highlight: null };
  }

  return null;
}

// Helper to parse area/perimeter questions
function parseAreaPerimeter(stem, context) {
  const text = `${stem || ''} ${context || ''}`;

  // Rectangle
  if (/obdélník/i.test(text)) {
    const match = text.match(/(\d+)\s*[×x]\s*(\d+)/);
    if (match) {
      return { type: 'rectangle', labels: { a: match[1], b: match[2] }, highlight: null };
    }
    // Generic rectangle
    return { type: 'rectangle', labels: {}, highlight: null };
  }

  // Square
  if (/čtverec|čtverce/i.test(text)) {
    const match = text.match(/stran[au]\s*(\d+)/i) || text.match(/(\d+)\s*cm/);
    if (match) {
      return { type: 'square', labels: { a: match[1] }, highlight: null };
    }
    return { type: 'square', labels: {}, highlight: null };
  }

  // Trapezoid/Lichoběžník
  if (/lichoběžník/i.test(text)) {
    return { type: 'trapezoid', labels: {}, highlight: null };
  }

  // Triangle
  if (/trojúhelník/i.test(text)) {
    if (/rovnostranný/i.test(text)) {
      const match = text.match(/stran[ouaý]+\s*(\d+)/i);
      if (match) {
        return { type: 'equilateral_triangle', labels: { a: match[1] }, highlight: null };
      }
    }
    return { type: 'right_triangle', labels: {}, highlight: null };
  }

  return null;
}

// Process pythagorean.json
function processPythagorean() {
  const filePath = path.join(SOURCE_DIR, 'pythagorean.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let added = 0;

  data.questions.forEach(q => {
    if (q.diagram) return; // Skip if already has diagram

    const diagram = parsePythagorean(q.question.stem, q.question.context, q.id);
    if (diagram) {
      q.diagram = diagram;
      added++;
      console.log(`  + ${q.id}: ${diagram.type}`);
    } else {
      console.log(`  ? ${q.id}: Could not determine diagram (${q.question.stem?.substring(0,40)}...)`);
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  console.log(`\nPythagorean: Added ${added} diagrams\n`);
}

// Process volume.json
function processVolume() {
  const filePath = path.join(SOURCE_DIR, 'volume.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let added = 0;

  data.questions.forEach(q => {
    if (q.diagram) return;

    const diagram = parseVolume(q.question.stem, q.question.context);
    if (diagram) {
      q.diagram = diagram;
      added++;
      console.log(`  + ${q.id}: ${diagram.type}`);
    } else {
      console.log(`  ? ${q.id}: Could not determine diagram (${q.question.stem?.substring(0,40)}...)`);
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  console.log(`\nVolume: Added ${added} diagrams\n`);
}

// Process area_perimeter.json
function processAreaPerimeter() {
  const filePath = path.join(SOURCE_DIR, 'area_perimeter.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let added = 0;

  data.questions.forEach(q => {
    if (q.diagram) return;

    const diagram = parseAreaPerimeter(q.question.stem, q.question.context);
    if (diagram) {
      q.diagram = diagram;
      added++;
      console.log(`  + ${q.id}: ${diagram.type}`);
    } else {
      console.log(`  ? ${q.id}: Could not determine diagram (${q.question.stem?.substring(0,40)}...)`);
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  console.log(`\nArea/Perimeter: Added ${added} diagrams\n`);
}

// Main
console.log('=== Adding Diagrams to Geometry Questions ===\n');

console.log('Processing pythagorean.json...');
processPythagorean();

console.log('Processing volume.json...');
processVolume();

console.log('Processing area_perimeter.json...');
processAreaPerimeter();

console.log('Done! Run `node scripts/generate-formats.js` to update generated files.');

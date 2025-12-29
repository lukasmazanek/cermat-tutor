import { DiagramProps } from './types'

/**
 * Diagram showing a trapezoid (lichoběžník) with labeled sides
 * Used for area and perimeter problems
 *
 * Labels: a (top), b (bottom), c (left), d (right), h (height)
 * Highlight: which part to emphasize
 */
function TrapezoidDiagram({ labels, highlight }: DiagramProps) {
  const safeLabels = labels ?? {}

  // Colors
  const lineColor = '#475569' // slate-600
  const highlightColor = '#7c3aed' // purple-600
  const labelColor = '#334155' // slate-700
  const heightColor = '#94a3b8' // slate-400

  const getColor = (side: string) =>
    highlight === side ? highlightColor : lineColor
  const getLabelColor = (side: string) =>
    highlight === side ? highlightColor : labelColor

  // Labels with defaults
  const a = safeLabels.a ?? 'a'
  const b = safeLabels.b ?? 'b'
  const h = safeLabels.h ?? 'v'

  // Trapezoid vertices
  // A (top-left), B (top-right), C (bottom-right), D (bottom-left)
  const ax = 50, ay = 40
  const bx = 130, by = 40
  const cx = 160, cy = 120
  const dx = 20, dy = 120

  return (
    <svg
      viewBox="0 0 200 160"
      className="w-auto h-full max-w-[200px]"
    >
      {/* Trapezoid shape */}
      <polygon
        points={`${ax},${ay} ${bx},${by} ${cx},${cy} ${dx},${dy}`}
        fill="#f1f5f9"
        stroke={lineColor}
        strokeWidth="2"
      />

      {/* Top side (a) */}
      <line
        x1={ax} y1={ay}
        x2={bx} y2={by}
        stroke={getColor('a')}
        strokeWidth={highlight === 'a' ? 3 : 2}
      />

      {/* Bottom side (b) */}
      <line
        x1={dx} y1={dy}
        x2={cx} y2={cy}
        stroke={getColor('b')}
        strokeWidth={highlight === 'b' ? 3 : 2}
      />

      {/* Height indicator (dashed) */}
      <line
        x1="90"
        y1="40"
        x2="90"
        y2="120"
        stroke={heightColor}
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />

      {/* Right angle marker for height */}
      <path
        d="M 90 110 L 100 110 L 100 120"
        fill="none"
        stroke={heightColor}
        strokeWidth="1"
      />

      {/* Vertex labels */}
      <text x={ax - 10} y={ay - 5} fontSize="12" fill={labelColor}>A</text>
      <text x={bx + 5} y={by - 5} fontSize="12" fill={labelColor}>B</text>
      <text x={cx + 5} y={cy + 5} fontSize="12" fill={labelColor}>C</text>
      <text x={dx - 15} y={dy + 5} fontSize="12" fill={labelColor}>D</text>

      {/* Side labels */}
      <text
        x="90"
        y="30"
        textAnchor="middle"
        fill={getLabelColor('a')}
        fontSize="14"
        fontWeight={highlight === 'a' ? 'bold' : 'normal'}
      >
        {a}
      </text>

      <text
        x="90"
        y="145"
        textAnchor="middle"
        fill={getLabelColor('b')}
        fontSize="14"
        fontWeight={highlight === 'b' ? 'bold' : 'normal'}
      >
        {b}
      </text>

      <text
        x="105"
        y="85"
        textAnchor="start"
        fill={getLabelColor('h')}
        fontSize="14"
        fontWeight={highlight === 'h' ? 'bold' : 'normal'}
      >
        {h}
      </text>
    </svg>
  )
}

export default TrapezoidDiagram

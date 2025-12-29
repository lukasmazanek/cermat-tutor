import { DiagramProps } from './types'

/**
 * Diagram showing a rectangular prism (kvádr/hranol)
 * Used for volume problems
 *
 * Labels: a, b, c (dimensions)
 * Highlight: which dimension to emphasize
 */
function PrismDiagram({ labels, highlight }: DiagramProps) {
  const safeLabels = labels ?? {}

  // Colors
  const lineColor = '#475569' // slate-600
  const highlightColor = '#7c3aed' // purple-600
  const labelColor = '#334155' // slate-700
  const hiddenColor = '#cbd5e1' // slate-300

  const getColor = (side: string) =>
    highlight === side ? highlightColor : lineColor
  const getLabelColor = (side: string) =>
    highlight === side ? highlightColor : labelColor

  // Labels with defaults
  const a = safeLabels.a ?? 'a'
  const b = safeLabels.b ?? 'b'
  const c = safeLabels.c ?? 'c'

  // 3D box vertices (isometric-ish projection)
  // Front face: A(30,120), B(130,120), C(130,60), D(30,60)
  // Back face offset by (40, -30)
  const offset = { x: 40, y: -25 }

  return (
    <svg
      viewBox="0 0 200 160"
      className="w-auto h-full max-w-[200px]"
    >
      {/* Hidden edges (back) - dashed */}
      <line
        x1={30 + offset.x} y1={120 + offset.y}
        x2={30 + offset.x} y2={60 + offset.y}
        stroke={hiddenColor}
        strokeWidth="1"
        strokeDasharray="4 3"
      />
      <line
        x1={30 + offset.x} y1={120 + offset.y}
        x2={130 + offset.x} y2={120 + offset.y}
        stroke={hiddenColor}
        strokeWidth="1"
        strokeDasharray="4 3"
      />
      <line
        x1={30 + offset.x} y1={120 + offset.y}
        x2="30" y2="120"
        stroke={hiddenColor}
        strokeWidth="1"
        strokeDasharray="4 3"
      />

      {/* Front face */}
      <rect
        x="30" y="60"
        width="100" height="60"
        fill="#f1f5f9"
        stroke={lineColor}
        strokeWidth="2"
      />

      {/* Top face */}
      <polygon
        points={`30,60 ${30 + offset.x},${60 + offset.y} ${130 + offset.x},${60 + offset.y} 130,60`}
        fill="#e2e8f0"
        stroke={lineColor}
        strokeWidth="2"
      />

      {/* Right face */}
      <polygon
        points={`130,60 ${130 + offset.x},${60 + offset.y} ${130 + offset.x},${120 + offset.y} 130,120`}
        fill="#cbd5e1"
        stroke={lineColor}
        strokeWidth="2"
      />

      {/* Dimension lines */}
      {/* Width (a) - bottom front */}
      <line
        x1="30" y1="130"
        x2="130" y2="130"
        stroke={getColor('a')}
        strokeWidth={highlight === 'a' ? 2.5 : 1.5}
      />

      {/* Height (b) - left front */}
      <line
        x1="20" y1="60"
        x2="20" y2="120"
        stroke={getColor('b')}
        strokeWidth={highlight === 'b' ? 2.5 : 1.5}
      />

      {/* Depth (c) - top */}
      <line
        x1="130" y1="55"
        x2={130 + offset.x} y2={55 + offset.y}
        stroke={getColor('c')}
        strokeWidth={highlight === 'c' ? 2.5 : 1.5}
      />

      {/* Labels */}
      <text
        x="80"
        y="148"
        textAnchor="middle"
        fill={getLabelColor('a')}
        fontSize="14"
        fontWeight={highlight === 'a' ? 'bold' : 'normal'}
      >
        {a}
      </text>

      <text
        x="10"
        y="95"
        textAnchor="middle"
        fill={getLabelColor('b')}
        fontSize="14"
        fontWeight={highlight === 'b' ? 'bold' : 'normal'}
      >
        {b}
      </text>

      <text
        x="165"
        y="30"
        textAnchor="middle"
        fill={getLabelColor('c')}
        fontSize="14"
        fontWeight={highlight === 'c' ? 'bold' : 'normal'}
      >
        {c}
      </text>
    </svg>
  )
}

export default PrismDiagram

import { DiagramProps } from './types'

/**
 * Diagram showing a cylinder with radius and height labels
 * Used for volume and surface area problems
 *
 * Labels: r (radius), h (height), v (volume)
 * Highlight: which dimension to emphasize
 */
function CylinderDiagram({ labels, highlight }: DiagramProps) {
  const safeLabels = labels ?? {}

  // Colors
  const lineColor = '#475569' // slate-600
  const highlightColor = '#7c3aed' // purple-600
  const labelColor = '#334155' // slate-700
  const fillColor = '#e2e8f0' // slate-200

  const getColor = (part: string) =>
    highlight === part ? highlightColor : lineColor
  const getLabelColor = (part: string) =>
    highlight === part ? highlightColor : labelColor

  // Labels with defaults
  const r = safeLabels.r ?? 'r'
  const h = safeLabels.h ?? 'v'

  return (
    <svg
      viewBox="0 0 160 180"
      className="w-auto h-full max-w-[160px]"
    >
      {/* Cylinder body (side) */}
      <path
        d="M 30 40 L 30 130 A 50 15 0 0 0 130 130 L 130 40"
        fill={fillColor}
        stroke={lineColor}
        strokeWidth="2"
      />

      {/* Top ellipse */}
      <ellipse
        cx="80"
        cy="40"
        rx="50"
        ry="15"
        fill={fillColor}
        stroke={lineColor}
        strokeWidth="2"
      />

      {/* Bottom ellipse (visible part - front arc) */}
      <path
        d="M 30 130 A 50 15 0 0 0 130 130"
        fill="none"
        stroke={lineColor}
        strokeWidth="2"
      />

      {/* Bottom ellipse (hidden part - back arc, dashed) */}
      <path
        d="M 30 130 A 50 15 0 0 1 130 130"
        fill="none"
        stroke={lineColor}
        strokeWidth="1"
        strokeDasharray="4 3"
      />

      {/* Height indicator line */}
      <line
        x1="140"
        y1="40"
        x2="140"
        y2="130"
        stroke={getColor('h')}
        strokeWidth={highlight === 'h' ? 2.5 : 1.5}
        markerStart="url(#arrowUp)"
        markerEnd="url(#arrowDown)"
      />

      {/* Radius indicator line */}
      <line
        x1="80"
        y1="40"
        x2="130"
        y2="40"
        stroke={getColor('r')}
        strokeWidth={highlight === 'r' ? 2.5 : 1.5}
      />

      {/* Center dot */}
      <circle
        cx="80"
        cy="40"
        r="2"
        fill={lineColor}
      />

      {/* Arrow markers */}
      <defs>
        <marker
          id="arrowUp"
          markerWidth="6"
          markerHeight="6"
          refX="3"
          refY="3"
          orient="auto"
        >
          <path d="M 0 6 L 3 0 L 6 6" fill="none" stroke={lineColor} strokeWidth="1" />
        </marker>
        <marker
          id="arrowDown"
          markerWidth="6"
          markerHeight="6"
          refX="3"
          refY="3"
          orient="auto"
        >
          <path d="M 0 0 L 3 6 L 6 0" fill="none" stroke={lineColor} strokeWidth="1" />
        </marker>
      </defs>

      {/* Labels */}
      <text
        x="150"
        y="90"
        textAnchor="start"
        fill={getLabelColor('h')}
        fontSize="14"
        fontWeight={highlight === 'h' ? 'bold' : 'normal'}
      >
        {h}
      </text>

      <text
        x="105"
        y="32"
        textAnchor="middle"
        fill={getLabelColor('r')}
        fontSize="14"
        fontWeight={highlight === 'r' ? 'bold' : 'normal'}
      >
        {r}
      </text>
    </svg>
  )
}

export default CylinderDiagram

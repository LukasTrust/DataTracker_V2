interface DataPoint {
  value: number
  date: string
}

interface MiniSparklineProps {
  data: DataPoint[]
  color?: string
  height?: number
}

function MiniSparkline({ data, color = '#3b82f6', height = 40 }: MiniSparklineProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-10 text-xs text-neutral-400">
        Keine Daten
      </div>
    )
  }

  const values = data.map(d => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = ((max - d.value) / range) * 100
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
          vectorEffect="non-scaling-stroke"
        />
        {/* Gradient fill below line */}
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <polygon
          fill={`url(#gradient-${color})`}
          points={`0,100 ${points} 100,100`}
        />
      </svg>
    </div>
  )
}

export default MiniSparkline

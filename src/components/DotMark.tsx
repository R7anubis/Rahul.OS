/**
 * Custom dot-matrix mark. A 4×4 dot field with an asymmetric filled pattern —
 * deliberately not a copy of any existing corporate logo, and small enough to
 * sit next to the wordmark as a technical flourish.
 */
export function DotMark({ size = 18 }: { size?: number }) {
  // 4×4 grid of 2px squares on a 2px gap → 14px content box.
  const filled = new Set([
    '0,0',
    '1,0',
    '3,0',
    '0,1',
    '2,1',
    '0,2',
    '1,2',
    '3,3',
    '1,3',
  ])

  const cells: { x: number; y: number; on: boolean }[] = []
  for (let y = 0; y < 4; y += 1) {
    for (let x = 0; x < 4; x += 1) {
      cells.push({ x, y, on: filled.has(`${x},${y}`) })
    }
  }

  return (
    <svg
      className="brand__mark"
      width={size}
      height={size}
      viewBox="0 0 14 14"
      aria-hidden="true"
      focusable="false"
    >
      {cells.map((cell, index) => (
        <rect
          key={index}
          x={cell.x * 4}
          y={cell.y * 4}
          width={2}
          height={2}
          fill={cell.on ? 'currentColor' : 'var(--text-faint)'}
          opacity={cell.on ? 1 : 0.4}
        />
      ))}
    </svg>
  )
}

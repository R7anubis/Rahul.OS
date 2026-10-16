import type { ReactNode } from 'react'

interface SectionHeadingProps {
  index: string
  label: string
  title: ReactNode
  note?: ReactNode
  id?: string
}

/**
 * The recurring section masthead: mono index + label on a hairline, a large
 * editorial title, and an optional note that carries the honesty caveats.
 */
export function SectionHeading({ index, label, title, note, id }: SectionHeadingProps) {
  return (
    <header className="section__head">
      <div>
        <p className="section__eyebrow mono">
          <span className="section__index">{index}</span>
          <span>{label}</span>
        </p>
        <h2 className="section__title" id={id}>
          {title}
        </h2>
      </div>
      {note ? <div className="section__note">{note}</div> : null}
    </header>
  )
}

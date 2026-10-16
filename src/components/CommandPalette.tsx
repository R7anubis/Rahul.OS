import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowUpRight,
  Command,
  Globe,
  Link2,
  Mail,
  Moon,
  MousePointerClick,
  Search,
  Sparkles,
  Sun,
} from 'lucide-react'
import { profile, linkById } from '../data/profile'
import { projects, categoryLabel } from '../data/projects'
import { sections } from '../data/sections'

interface PaletteItem {
  id: string
  label: string
  hint: string
  kind: 'Section' | 'Project' | 'Link' | 'Action'
  keywords: string
  icon: React.ReactNode
  run: () => void
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  onNavigate: (hash: string) => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  motion: 'on' | 'off'
  onToggleMotion: () => void
}

/**
 * Command palette — Ctrl/Cmd + K.
 * Sections, project detail views, contact links and interface actions in one
 * searchable list with full keyboard support, a focus trap, Escape to close
 * and an explicit mobile entry point in the header.
 */
export function CommandPalette({
  open,
  onClose,
  onNavigate,
  theme,
  onToggleTheme,
  motion,
  onToggleMotion,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)

  const items = useMemo<PaletteItem[]>(() => {
    const sectionItems: PaletteItem[] = sections.map((section) => ({
      id: `section-${section.id}`,
      label: section.label,
      hint: section.hint,
      kind: 'Section',
      keywords: `section navigate ${section.label} ${section.hint}`,
      icon: <Globe size={14} aria-hidden="true" />,
      run: () => onNavigate(`#${section.id}`),
    }))

    const projectItems: PaletteItem[] = projects.map((project) => ({
      id: `project-${project.slug}`,
      label: project.title,
      hint: `${categoryLabel[project.category]} · ${project.subtitle}`,
      kind: 'Project',
      keywords: `project ${project.title} ${project.subtitle} ${categoryLabel[project.category]} ${project.technologies.join(' ')}`,
      icon: <Sparkles size={14} aria-hidden="true" />,
      run: () => onNavigate(`#/projects/${project.slug}`),
    }))

    const linkItems: PaletteItem[] = profile.links.map((link) => ({
      id: `link-${link.id}`,
      label: `${link.label} — ${link.handle}`,
      hint: link.id === 'email' ? 'Open your mail client' : 'Opens in a new tab',
      kind: 'Link',
      keywords: `contact link ${link.label} ${link.handle}`,
      icon: link.id === 'email' ? <Mail size={14} aria-hidden="true" /> : <Link2 size={14} aria-hidden="true" />,
      run: () => {
        if (link.external) window.open(link.href, '_blank', 'noopener,noreferrer')
        else window.location.href = link.href
      },
    }))

    const actionItems: PaletteItem[] = [
      {
        id: 'action-theme',
        label: theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
        hint: 'Toggle the interface palette',
        kind: 'Action',
        keywords: 'theme dark light appearance colour color toggle',
        icon: theme === 'dark' ? <Sun size={14} aria-hidden="true" /> : <Moon size={14} aria-hidden="true" />,
        run: onToggleTheme,
      },
      {
        id: 'action-motion',
        label: motion === 'off' ? 'Turn motion on' : 'Reduce motion',
        hint: 'Changes animation behaviour everywhere on the site',
        kind: 'Action',
        keywords: 'motion animation reduce accessibility toggle',
        icon: <MousePointerClick size={14} aria-hidden="true" />,
        run: onToggleMotion,
      },
      {
        id: 'action-top',
        label: 'Back to top of page',
        hint: 'Jump to the identity screen',
        kind: 'Action',
        keywords: 'top home scroll start',
        icon: <ArrowUpRight size={14} aria-hidden="true" />,
        run: () => onNavigate('#top'),
      },
    ]

    return [...sectionItems, ...projectItems, ...linkItems, ...actionItems]
  }, [onNavigate, onToggleMotion, onToggleTheme, motion, theme])

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return items
    return items.filter((item) =>
      `${item.label} ${item.hint} ${item.kind} ${item.keywords}`.toLowerCase().includes(needle),
    )
  }, [items, query])

  useEffect(() => {
    setActiveIndex(0)
  }, [query, open])

  useEffect(() => {
    if (!open) return
    restoreFocusRef.current = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus())

    return () => {
      window.cancelAnimationFrame(frame)
      document.body.style.overflow = previousOverflow
      restoreFocusRef.current?.focus?.()
    }
  }, [open])

  if (!open) return null

  const commit = (item: PaletteItem | undefined) => {
    if (!item) return
    onClose()
    item.run()
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (results.length ? (index + 1) % results.length : 0))
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => (results.length ? (index - 1 + results.length) % results.length : 0))
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      commit(results[activeIndex])
      return
    }
    if (event.key === 'Tab') {
      // Simple focus trap: the panel is the only interactive surface.
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'input, button:not([disabled])',
      )
      if (!focusables || focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
  }

  const email = linkById('email')

  return (
    <div
      className="palette"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="palette__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        ref={panelRef}
        onKeyDown={onKeyDown}
      >
        <div className="palette__head">
          <Search size={16} aria-hidden="true" />
          <input
            ref={inputRef}
            className="palette__input"
            type="text"
            value={query}
            placeholder="Search sections, projects, links and actions…"
            aria-label="Search the site"
            aria-controls="palette-results"
            aria-activedescendant={results[activeIndex] ? `palette-option-${results[activeIndex].id}` : undefined}
            role="combobox"
            aria-expanded="true"
            aria-autocomplete="list"
            onChange={(event) => setQuery(event.target.value)}
          />
          <span className="palette__esc">ESC</span>
        </div>

        <div className="palette__body" id="palette-results">
          {results.length === 0 ? (
            <p className="palette__empty">
              Nothing matches “{query}”. Try “projects”, “SameFace”, “theme” or “email”.
            </p>
          ) : (
            <div className="palette__list" role="listbox" aria-label="Results">
              {results.map((item, index) => (
                <button
                  key={item.id}
                  id={`palette-option-${item.id}`}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  className="palette__item"
                  data-active={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => commit(item)}
                >
                  <span className="palette__item-icon">{item.icon}</span>
                  <span>
                    <span className="palette__item-label">{item.label}</span>
                    <span className="palette__item-hint">{item.hint}</span>
                  </span>
                  <span className="palette__item-kind">{item.kind}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="palette__foot">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> move
          </span>
          <span>
            <kbd>↵</kbd> open
          </span>
          <span>
            <kbd>esc</kbd> close
          </span>
          <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Command size={12} aria-hidden="true" />
            {email ? 'RAHUL.OS palette' : 'RAHUL.OS'}
          </span>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { defaultContent, useSiteContent } from './content'
import { ArrowIcon, CheckIcon, CloseIcon } from './icons'

type Path = Array<string | number>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function getAtPath(root: unknown, path: Path): unknown {
  return path.reduce<unknown>((current, key) => {
    if (isRecord(current) || Array.isArray(current)) {
      return (current as Record<string | number, unknown>)[key]
    }
    return undefined
  }, root)
}

function humanize(label: string | number): string {
  if (typeof label === 'number') return `Item ${label + 1}`
  return label
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]+/g, ' ')
    .replace(/^./, (letter) => letter.toUpperCase())
    .trim()
}

function singularize(label: string): string {
  const normalized = humanize(label)
  if (normalized.endsWith('ies')) return `${normalized.slice(0, -3)}y`
  if (normalized.endsWith('sses')) return normalized.slice(0, -2)
  if (normalized.endsWith('s')) return normalized.slice(0, -1)
  return normalized
}

function inputId(path: Path): string {
  return `cms-${path.join('-').replace(/[^a-zA-Z0-9_-]/g, '')}`
}

const LONG_KEYS = new Set([
  'note',
  'description',
  'intro',
  'quote',
  'title',
  'text',
  'message',
  'sub',
  'role',
  'line',
  'introduction',
])

function createArrayItem(current: unknown[], path: Path): unknown {
  const template = current[0] ?? getAtPath(defaultContent, path)
  if (Array.isArray(template)) return template[0] ?? ''
  if (isRecord(template)) {
    return Object.fromEntries(Object.entries(template).map(([key, value]) => [key, clone(value)]))
  }
  if (typeof template === 'number') return 0
  if (typeof template === 'boolean') return false
  return ''
}

interface FieldEditorProps {
  label: string | number
  path: Path
  value: unknown
  onChange: (path: Path, value: unknown) => void
  depth?: number
}

function FieldEditor({ label, path, value, onChange, depth = 0 }: FieldEditorProps) {
  if (typeof value === 'string') {
    const key = typeof path[path.length - 1] === 'string' ? String(path[path.length - 1]) : ''
    const multiline = LONG_KEYS.has(key) || value.length > 90 || value.includes('\n')
    const id = inputId(path)

    if (key === 'icon') {
      return (
        <div className="cms-field">
          <label htmlFor={id}>{humanize(label)}</label>
          <select id={id} value={value} onChange={(event) => onChange(path, event.target.value)}>
            <option value="award">award</option>
            <option value="medal">medal</option>
          </select>
        </div>
      )
    }

    return (
      <div className="cms-field">
        <label htmlFor={id}>{humanize(label)}</label>
        {multiline ? (
          <textarea
            id={id}
            value={value}
            rows={key === 'quote' || value.length > 240 ? 5 : 3}
            onChange={(event) => onChange(path, event.target.value)}
          />
        ) : (
          <input
            id={id}
            type={key === 'emailAddress' ? 'email' : 'text'}
            spellCheck={key === 'emailAddress' || key === 'href' ? false : undefined}
            value={value}
            onChange={(event) => onChange(path, event.target.value)}
          />
        )}
      </div>
    )
  }

  if (typeof value === 'number') {
    const id = inputId(path)
    return (
      <div className="cms-field cms-field--compact">
        <label htmlFor={id}>{humanize(label)}</label>
        <input
          id={id}
          type="number"
          step={keyStep(path)}
          value={value}
          onChange={(event) => onChange(path, Number(event.target.value))}
        />
      </div>
    )
  }

  if (typeof value === 'boolean') {
    const id = inputId(path)
    return (
      <div className="cms-field cms-field--toggle">
        <label htmlFor={id}>{humanize(label)}</label>
        <input
          id={id}
          type="checkbox"
          checked={value}
          onChange={(event) => onChange(path, event.target.checked)}
        />
      </div>
    )
  }

  if (Array.isArray(value)) {
    const itemLabel = singularize(String(label))
    const template = createArrayItem(value, path)

    return (
      <div className="cms-array">
        <div className="cms-array-head">
          <span>{humanize(label)}</span>
          <span className="cms-count">{value.length}</span>
        </div>
        {value.length === 0 ? (
          <p className="cms-empty">No {String(label).toLowerCase()} yet.</p>
        ) : (
          <div className="cms-array-list">
            {value.map((item, index) => (
              <div className="cms-array-item" key={index}>
                <div className="cms-array-item-head">
                  <strong>
                    {itemLabel} {index + 1}
                  </strong>
                  <button
                    type="button"
                    className="cms-icon-button"
                    aria-label={`Remove ${itemLabel} ${index + 1}`}
                    onClick={() => onChange(path, value.filter((_, itemIndex) => itemIndex !== index))}
                  >
                    <CloseIcon width={14} height={14} />
                  </button>
                </div>
                {isRecord(item) || Array.isArray(item) ? (
                  <FieldEditor label="" path={[...path, index]} value={item} onChange={onChange} depth={depth + 1} />
                ) : (
                  <FieldEditor
                    label={`${itemLabel} ${index + 1}`}
                    path={[...path, index]}
                    value={item}
                    onChange={onChange}
                    depth={depth + 1}
                  />
                )}
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          className="cms-add-button"
          onClick={() => onChange(path, [...value, clone(template)])}
        >
          + Add {itemLabel.toLowerCase()}
        </button>
      </div>
    )
  }

  if (isRecord(value)) {
    return (
      <div className={`cms-object${depth === 0 ? ' cms-object--root' : ''}`}>
        {Object.entries(value).map(([key, child]) => (
          <FieldEditor
            key={key}
            label={humanize(key)}
            path={[...path, key]}
            value={child}
            onChange={onChange}
            depth={depth + 1}
          />
        ))}
      </div>
    )
  }

  return null
}

function keyStep(path: Path): string {
  const key = path[path.length - 1]
  return key === 'decimals' ? '1' : 'any'
}

interface Section {
  id: string
  label: string
  path: Path
  description: string
}

const sections: Section[] = [
  { id: 'site', label: 'Site & meta', path: ['meta'], description: 'Browser title, page description and theme color.' },
  { id: 'loader', label: 'Intro loader', path: ['loader'], description: 'Typing text and name shown before the portfolio loads.' },
  { id: 'cursor', label: 'Cursor tag', path: ['cursor'], description: 'The small label that follows the pointer on desktop.' },
  { id: 'brand', label: 'Brand', path: ['brand'], description: 'The name shown in the navigation and its small subtitle.' },
  { id: 'navigation', label: 'Navigation', path: ['nav'], description: 'Menu links, button copy and accessibility labels.' },
  { id: 'hero', label: 'Hero', path: ['hero'], description: 'Intro name card, pass, note, buttons, stickers, cassette and statistics.' },
  { id: 'about', label: 'About', path: ['about'], description: 'About heading, photo caption, paragraphs and focus chips.' },
  { id: 'education', label: 'Education', path: ['education'], description: 'CA journey, education cards, labels and scores.' },
  { id: 'achievements', label: 'Achievements', path: ['achievements'], description: 'Achievement titles and descriptions.' },
  { id: 'experience', label: 'Experience', path: ['experience'], description: 'Roles, companies, responsibilities and skill tags.' },
  { id: 'skills', label: 'Skills', path: ['skills'], description: 'Accounting groups, technical groups, folder copy and soft skills.' },
  { id: 'vision', label: 'Vision', path: ['vision'], description: 'Career objective quote and the what-I-bring panel.' },
  { id: 'contact', label: 'Contact', path: ['contact'], description: 'Contact intro, email, form labels, placeholders and status messages.' },
  { id: 'footer', label: 'Footer', path: ['footer'], description: 'Footer marquee, identity line and copyright text.' },
  { id: 'images', label: 'Main images', path: ['images'], description: 'Replace the hero portrait and about photo by URL or upload.' },
]

function AdminLogin({ onSignedIn }: { onSignedIn: () => void }) {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          email: String(formData.get('email') ?? ''),
          password: String(formData.get('password') ?? ''),
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Unable to sign in.')
      form.reset()
      onSignedIn()
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in.')
      emailRef.current?.focus()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-login-shell">
      <div className="admin-login-card">
        <span className="tape-label">backstage pass</span>
        <h1>Content studio</h1>
        <p>Sign in to edit every word and both main images on the portfolio.</p>

        <form onSubmit={handleSubmit}>
          <div className="cms-field">
            <label htmlFor="admin-email">Email</label>
            <input
              ref={emailRef}
              id="admin-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              spellCheck={false}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="cms-field">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          {error && <p className="cms-error" role="alert">{error}</p>}
          <button className="cms-primary-button" type="submit" disabled={submitting}>
            {submitting ? 'Checking…' : 'Open admin panel'} <ArrowIcon width={15} height={15} />
          </button>
        </form>

        <p className="admin-login-hint">Credentials are verified on the server. No password is stored in this page.</p>

        <a className="admin-back-link" href="/">← Back to portfolio</a>
      </div>
    </div>
  )
}

interface ImageEditorProps {
  imageKey: 'hero' | 'about'
  title: string
  note: string
  value: string
  onChange: (path: Path, value: unknown) => void
}

function ImageEditor({ imageKey, title, note, value, onChange }: ImageEditorProps) {
  const [error, setError] = useState('')
  const path = useMemo<Path>(() => ['images', imageKey], [imageKey])

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Choose an image under 2 MB so it can be saved in this browser.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      onChange(path, String(reader.result))
      setError('')
    }
    reader.onerror = () => setError('That file could not be read. Try another image.')
    reader.readAsDataURL(file)
  }

  return (
    <section className="cms-image-card">
      <div className="cms-image-preview">
        <img src={value} alt={`${title} preview`} width={320} height={240} />
      </div>
      <div className="cms-image-controls">
        <span className="hand-label">{note}</span>
        <h2>{title}</h2>
        <FieldEditor label="Image URL" path={path} value={value} onChange={onChange} />
        <div className="cms-field">
          <label htmlFor={`upload-${imageKey}`}>Upload replacement</label>
          <input id={`upload-${imageKey}`} type="file" accept="image/*" onChange={handleUpload} />
        </div>
        <button
          type="button"
          className="cms-secondary-button"
          onClick={() => {
            onChange(path, defaultContent.images[imageKey])
            setError('')
          }}
        >
          Restore original image
        </button>
        {error && <p className="cms-error" role="alert">{error}</p>}
      </div>
    </section>
  )
}

const saveLabels: Record<string, string> = {
  loading: 'Loading content…',
  saved: 'Saved securely',
  dirty: 'Saving…',
  saving: 'Saving…',
  error: 'Save failed',
}

export default function AdminApp() {
  const { content, saveStatus, updateAtPath, resetContent, retrySave } = useSiteContent()
  const [signedIn, setSignedIn] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [activeId, setActiveId] = useState('hero')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let cancelled = false
    fetch('/api/session', { credentials: 'same-origin' })
      .then((response) => response.json().catch(() => ({ authenticated: false })))
      .then((data) => {
        if (cancelled) return
        setSignedIn(Boolean(data.authenticated))
      })
      .catch(() => {
        if (!cancelled) setSignedIn(false)
      })
      .finally(() => {
        if (!cancelled) setCheckingSession(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (checkingSession) return
    const desired = signedIn ? '/admin' : '/login'
    if ((window.location.pathname.replace(/\/+$/, '') || '/') !== desired) {
      window.history.replaceState({}, '', desired)
    }
  }, [checkingSession, signedIn])

  if (checkingSession) {
    return (
      <div className="admin-login-shell">
        <div className="admin-login-card admin-session-check">Checking your session…</div>
      </div>
    )
  }

  if (!signedIn) return <AdminLogin onSignedIn={() => setSignedIn(true)} />

  const activeSection = sections.find((section) => section.id === activeId) ?? sections[0]
  const sectionValue = getAtPath(content, activeSection.path)

  const handleReset = () => {
    if (!window.confirm('Reset every text field and both images to the original portfolio content?')) return
    resetContent()
    setNotice('All content restored to the original version.')
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: '{}',
      })
    } finally {
      setSignedIn(false)
    }
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <a className="admin-brand" href="/">
          <span className="admin-brand-main">{content.brand.name}</span>
          <span className="admin-brand-sub">content studio</span>
        </a>
        <div className="admin-topbar-actions">
          <span className={`cms-saved cms-saved--${saveStatus}`}>
            {saveStatus === 'saved' ? <CheckIcon width={13} height={13} /> : null}
            {saveLabels[saveStatus] ?? saveStatus}
          </span>
          {saveStatus === 'error' && (
            <button type="button" className="cms-secondary-button" onClick={retrySave}>Retry save</button>
          )}
          <a className="cms-secondary-button" href="/" target="_blank" rel="noreferrer">
            View site <ArrowIcon width={13} height={13} />
          </a>
          <button type="button" className="cms-secondary-button" onClick={handleLogout}>Log out</button>
        </div>
      </header>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <span className="hand-label">sections</span>
          <nav aria-label="Content sections">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                className={activeId === section.id ? 'admin-nav-button is-active' : 'admin-nav-button'}
                aria-current={activeId === section.id ? 'page' : undefined}
                onClick={() => {
                  setActiveId(section.id)
                  setNotice('')
                }}
              >
                {section.label}
              </button>
            ))}
          </nav>
          <button type="button" className="admin-reset-button" onClick={handleReset}>
            Reset all content
          </button>
        </aside>

        <main className="admin-main">
          <div className="admin-page-head">
            <div>
              <span className="hand-label">edit mode</span>
              <h1>{activeSection.label}</h1>
              <p>{activeSection.description}</p>
            </div>
            <a className="cms-primary-button" href="/" target="_blank" rel="noreferrer">
              Open portfolio <ArrowIcon width={14} height={14} />
            </a>
          </div>

          {notice && <p className="cms-notice" role="status">{notice}</p>}

          {activeSection.id === 'images' ? (
            <div className="cms-images-grid">
              <ImageEditor
                imageKey="hero"
                title="Hero portrait"
                note="image one"
                value={content.images.hero}
                onChange={updateAtPath}
              />
              <ImageEditor
                imageKey="about"
                title="About photo"
                note="image two"
                value={content.images.about}
                onChange={updateAtPath}
              />
            </div>
          ) : (
            <div className="cms-panel">
              <FieldEditor
                label={activeSection.label}
                path={activeSection.path}
                value={sectionValue}
                onChange={updateAtPath}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import {
  ArrowIcon,
  AwardIcon,
  BookIcon,
  BriefcaseIcon,
  ChartIcon,
  CheckIcon,
  CloseIcon,
  MailIcon,
  MedalIcon,
  MenuIcon,
  SparkIcon,
} from './icons'
import { formatTemplate, useSiteContent } from './content'

function useReveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>('[data-reveal]')
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' },
    )

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])
}

function useActiveSection(hrefs: string[]) {
  const [active, setActive] = useState(hrefs[0] ?? '#home')
  const key = hrefs.join('|')

  useEffect(() => {
    const sections = key
      .split('|')
      .map((href) => document.getElementById(href.slice(1)))
      .filter((element): element is HTMLElement => Boolean(element))

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActive(`#${visible[0].target.id}`)
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.1, 0.5] },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [key])

  return active
}

function CountUp({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    const element = ref.current
    if (!element) return

    let frame = 0
    let started = false

    const animate = () => {
      const start = performance.now()
      const tick = (now: number) => {
        const progress = Math.min((now - start) / 1100, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setDisplay((value * eased).toFixed(decimals))
        if (progress < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          started = true
          animate()
          observer.disconnect()
        }
      },
      { threshold: 0.4 },
    )

    observer.observe(element)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [value, decimals])

  return <span ref={ref}>{display}</span>
}

function Loader() {
  const { content } = useSiteContent()
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDone(true)
      return
    }
    const timer = window.setTimeout(() => setDone(true), 1500)
    return () => window.clearTimeout(timer)
  }, [])

  if (done) return null

  return (
    <div className="intro-loader" aria-hidden="true">
      <p
        style={
          {
            '--loader-width': `${`${content.loader.text} ${content.loader.name}`.length}ch`,
          } as CSSProperties
        }
      >
        {content.loader.text} {content.loader.name}
        <span className="loader-caret" />
      </p>
    </div>
  )
}

function CursorTag() {
  const { content } = useSiteContent()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const element = ref.current
    if (!element) return

    let frame = 0
    let x = 0
    let y = 0

    const move = (event: MouseEvent) => {
      x = event.clientX
      y = event.clientY
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        element.style.transform = `translate3d(${x + 14}px, ${y + 12}px, 0)`
        element.classList.add('on')
      })
    }
    const leave = () => element.classList.remove('on')

    window.addEventListener('mousemove', move, { passive: true })
    document.addEventListener('mouseleave', leave)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('mousemove', move)
      document.removeEventListener('mouseleave', leave)
    }
  }, [])

  return (
    <div ref={ref} className="cursor-tag" aria-hidden="true">
      <span className="cursor-arrow" />
      <span>{content.cursor.label}</span>
    </div>
  )
}

function TapeMarquee({ items, reverse = false, tone = 'cream' }: { items: string[]; reverse?: boolean; tone?: 'cream' | 'rose' | 'plum' }) {
  const content = [...items, ...items, ...items]
  return (
    <div className={`tape-marquee tape-marquee--${tone}${reverse ? ' tape-marquee--reverse' : ''}`} aria-hidden="true">
      <div className="tape-track">
        {content.map((item, index) => (
          <span key={`${item}-${index}`}>
            {item} <b>✦</b>
          </span>
        ))}
      </div>
    </div>
  )
}

function PaperHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <header className="paper-heading" data-reveal>
      <span className="hand-label">{eyebrow}</span>
      <h2>{title}</h2>
      <span className="paper-heading-rule" aria-hidden="true" />
    </header>
  )
}

const sudokuRows = [
  '530678012',
  '672195300',
  '198342500',
  '859761423',
  '426053791',
  '713924856',
  '961537284',
  '287419635',
  '345286179',
]

function SudokuBackdrop() {
  return (
    <div className="sudoku-backdrop" aria-hidden="true">
      {sudokuRows.flatMap((row, rowIndex) =>
        row.split('').map((digit, columnIndex) => (
          <span
            key={`${rowIndex}-${columnIndex}`}
            className={[
              'sudoku-bg-cell',
              columnIndex % 3 === 2 && columnIndex < 8 ? 'sudoku-bg-cell--block-right' : '',
              rowIndex % 3 === 2 && rowIndex < 8 ? 'sudoku-bg-cell--block-bottom' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {digit === '0' ? '' : digit}
          </span>
        )),
      )}
    </div>
  )
}

function FloatingIcons() {
  return (
    <div className="float-layer" aria-hidden="true">
      <span className="float-png float-png--calculator">
        <img src="/—Pngtree—calculator_3774414.png" alt="" width={2816} height={2816} />
      </span>
      <span className="float-png float-png--rubik">
        <img src="/—Pngtree—multicolor spinning game toy rubik's_5577449.png" alt="" width={1200} height={1200} />
      </span>
      <span className="float-png float-png--books">
        <img src="/books_sketch.png" alt="" width={447} height={447} />
      </span>
      <span className="float-png float-png--rhode">
        <img src="/rhode_product.png" alt="" width={480} height={638} />
      </span>
      <span className="float-png float-png--cat">
        <img src="/gatita%20abogada-cutout.png" alt="" width={736} height={1104} />
      </span>
    </div>
  )
}

function Navbar() {
  const { content } = useSiteContent()
  const active = useActiveSection(content.nav.items.map((item) => item.href))
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`sitebar${scrolled ? ' sitebar--solid' : ''}`}>
      <div className="nav-inner">
        <a className="brand" href={content.nav.items[0]?.href ?? '#home'} aria-label={content.brand.aria} onClick={() => setOpen(false)}>
          <span className="brand-name">{content.brand.name}</span>
          <span className="brand-sub">{content.brand.sub}</span>
        </a>

        <nav className="desktop-nav" aria-label={content.nav.primaryAria}>
          {content.nav.items.map((item) => (
            <a key={item.href} href={item.href} className={active === item.href ? 'nav-link is-active' : 'nav-link'}>
              {item.label}
            </a>
          ))}
        </nav>

        <a className="nav-cta" href={content.nav.items[content.nav.items.length - 1]?.href ?? '#contact'}>
          {content.nav.cta} <ArrowIcon width={15} height={15} />
        </a>

        <button
          className="menu-toggle"
          type="button"
          aria-label={open ? content.nav.closeAria : content.nav.openAria}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      <nav id="mobile-menu" className={`mobile-menu${open ? ' is-open' : ''}`} aria-label={content.nav.mobileAria} aria-hidden={!open}>
        {content.nav.items.map((item) => (
          <a key={item.href} href={item.href} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
            {item.label}
          </a>
        ))}
        <a
          href={content.nav.items[content.nav.items.length - 1]?.href ?? '#contact'}
          onClick={() => setOpen(false)}
          tabIndex={open ? 0 : -1}
        >
          {content.nav.mobileCta}
        </a>
      </nav>
    </header>
  )
}

function Hero() {
  const { content } = useSiteContent()
  const hero = content.hero
  const [flipped, setFlipped] = useState(false)
  const [tapePlaying, setTapePlaying] = useState(false)

  return (
    <section id="home" className="hero">
      <div className="desk-speckles" aria-hidden="true" />
      <SudokuBackdrop />
      <TapeMarquee items={hero.marqueeTop} />
      <FloatingIcons />

      <div className="container hero-inner">
        <div className="hero-copy">
          <div className="hero-kicker hero-stagger">
            <span className="tape-label">{hero.tapeLabel}</span>
          </div>

          <button
            type="button"
            className={`name-flip hero-stagger${flipped ? ' is-flipped' : ''}`}
            onClick={() => setFlipped((value) => !value)}
            aria-pressed={flipped}
            aria-label={flipped ? hero.flip.frontAria : hero.flip.backAria}
          >
            <span className="name-flip-inner">
              <span className="name-face name-face--front">
                <span className="hand-small">{hero.flip.hi}</span>
                <span className="hero-name">{hero.flip.name}</span>
                <span className="hero-signature">{hero.flip.signature}</span>
              </span>
              <span className="name-face name-face--back">
                <span className="pass-top">{hero.flip.passTop}</span>
                <span className="pass-grid">
                  {hero.flip.fields.map((field) => (
                    <span key={field.label}>
                      <small>{field.label}</small>
                      {field.value}
                    </span>
                  ))}
                </span>
                <span className="pass-foot">{hero.flip.passFoot}</span>
              </span>
            </span>
          </button>

          <p className="hero-role hero-stagger">{hero.role}</p>

          <div className="hero-note hero-stagger">
            <span className="note-tape" aria-hidden="true" />
            <p>{hero.note}</p>
          </div>
          <p className="hero-tiny hero-stagger">{hero.hint}</p>

          <div className="hero-actions hero-stagger">
            <a className="paper-button paper-button--solid" href="#experience">
              {hero.actions.experience} <ArrowIcon width={16} height={16} />
            </a>
            <a className="paper-button" href="#contact">
              {hero.actions.contact}
            </a>
          </div>

          <div className="hero-tagline hero-stagger">
            <SparkIcon width={15} height={15} />
            <span>{hero.tagline}</span>
          </div>
        </div>

        <div className="hero-visual hero-stagger">
          <div className="polaroid">
            <span className="polaroid-tape" aria-hidden="true" />
            <img src={content.images.hero} alt={hero.imageAlt} width={900} height={1600} />
            <span className="polaroid-caption">{hero.imageCaption}</span>
          </div>

          <span className="sticker sticker--round" aria-hidden="true">
            {hero.stickers.studentTop} <br /> {hero.stickers.studentBottom}
          </span>
          <span className="sticker sticker--group" aria-hidden="true">
            {hero.stickers.group} <CheckIcon width={12} height={12} />
          </span>
          <span className="sticker sticker--city" aria-hidden="true">{hero.stickers.city}</span>
          <span className="doodle doodle--one" aria-hidden="true">✳</span>
          <span className="doodle doodle--two" aria-hidden="true">✦</span>

          <div className={`cassette${tapePlaying ? ' is-playing' : ''}`}>
            <button
              type="button"
              onClick={() => setTapePlaying((value) => !value)}
              aria-pressed={tapePlaying}
              aria-label={hero.cassette.aria}
            >
              <span className="cassette-label">
                <span className="cassette-reel" />
                <span className="cassette-window">
                  <i className="reel reel--left" />
                  <i className="reel reel--right" />
                </span>
                <span className="cassette-reel" />
              </span>
              <span className="cassette-text">{tapePlaying ? hero.cassette.playing : hero.cassette.idle}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container hero-stats hero-stagger">
        {hero.stats.map((stat, index) => (
          <div className="hero-stat" key={`${stat.label}-${index}`}>
            <strong>
              <CountUp value={Number(stat.value) || 0} decimals={Number(stat.decimals) || 0} />
              <span className="percent-sign">{stat.suffix}</span>
            </strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>

      <TapeMarquee items={hero.marqueeBottom} reverse tone="rose" />
    </section>
  )
}

function About() {
  const { content } = useSiteContent()
  const about = content.about

  return (
    <section id="about" className="section about-section">
      <div className="container about-grid">
        <div data-reveal>
          <PaperHeading eyebrow={about.eyebrow} title={about.title} />
          <div className="about-photo" data-reveal>
            <img src={content.images.about} alt={about.photoAlt} width={900} height={1600} loading="lazy" />
            <span>{about.photoCaption}</span>
          </div>
        </div>
        <div className="about-panel" data-reveal>
          {about.paragraphs.map((paragraph, index) => (
            <p key={index} className={index === 0 ? 'about-lead' : undefined}>
              {paragraph}
            </p>
          ))}
          <div className="focus-chips" aria-label={about.eyebrow}>
            {about.focusAreas.map((area) => (
              <span key={area} className="focus-chip">
                <CheckIcon width={13} height={13} /> {area}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Education() {
  const { content } = useSiteContent()
  const education = content.education
  const caJourney = education.items.filter((item) => item.kind === 'CA')
  const remaining = education.items.filter((item) => item.kind !== 'CA')

  return (
    <section id="education" className="section education-section">
      <div className="container">
        <PaperHeading eyebrow={education.eyebrow} title={education.title} />

        <div className="ca-track" data-reveal>
          {caJourney.map((item, index) => (
            <div className="ca-step-wrap" key={`${item.title}-${index}`}>
              <article className={`paper-card ca-card${item.featured ? ' ca-card--featured' : ''}`}>
                <span className="card-tape" aria-hidden="true" />
                <div className="ca-card-top">
                  <span className="hand-label">{item.label}</span>
                  <span className="ca-date">{item.detail}</span>
                </div>
                <h3>{item.title}</h3>
                <p className="ca-institute">{item.institute}</p>
                <div className="ca-score">
                  <strong>{item.score}</strong>
                  <span>{education.labels.score}</span>
                </div>
              </article>
              {index === 0 && (
                <div className="ca-connector" aria-hidden="true">
                  <ArrowIcon width={18} height={18} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="education-grid">
          {remaining.map((item, index) => (
            <article className="paper-card edu-card" key={`${item.title}-${index}`} data-reveal>
              <span className="card-tape card-tape--small" aria-hidden="true" />
              <div className="edu-icon" aria-hidden="true">
                <BookIcon width={18} height={18} />
              </div>
              <div className="edu-meta">
                <span>{item.kind}</span>
                <span>{item.detail}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.institute}</p>
              <div className="edu-score">
                <strong>{item.score}</strong>
                <span>{education.labels.score}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Achievements() {
  const { content } = useSiteContent()
  const achievements = content.achievements

  return (
    <section id="achievements" className="section achievements-section">
      <div className="container">
        <PaperHeading eyebrow={achievements.eyebrow} title={achievements.title} />
        <div className="achievement-grid">
          {achievements.items.map((item, index) => (
            <article className="paper-card achievement-card" key={`${item.title}-${index}`} data-reveal>
              <span className="card-tape" aria-hidden="true" />
              <div className="achievement-icon" aria-hidden="true">
                {item.icon === 'award' ? <AwardIcon width={22} height={22} /> : <MedalIcon width={22} height={22} />}
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Experience() {
  const { content } = useSiteContent()
  const experience = content.experience

  return (
    <section id="experience" className="section experience-section">
      <div className="container">
        <PaperHeading eyebrow={experience.eyebrow} title={experience.title} />
        <div className="timeline">
          {experience.items.map((job, index) => (
            <article className="timeline-item" key={`${job.company}-${index}`} data-reveal>
              <div className="timeline-marker" aria-hidden="true">
                <BriefcaseIcon width={16} height={16} />
              </div>
              <div className="paper-card timeline-card">
                <span className="card-tape" aria-hidden="true" />
                <div className="timeline-card-head">
                  <div>
                    <span className="hand-label">{job.period}</span>
                    <h3>{job.role}</h3>
                    <p className="timeline-company">{job.company}</p>
                  </div>
                  <span className="timeline-index">0{index + 1}</span>
                </div>

                {job.responsibilities.length > 0 ? (
                  <>
                    <ul className="responsibility-list">
                      {job.responsibilities.map((task, taskIndex) => (
                        <li key={`${task}-${taskIndex}`}>
                          <CheckIcon width={14} height={14} />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="timeline-tags" aria-label={experience.eyebrow}>
                      {job.tags.map((tag, tagIndex) => (
                        <span key={`${tag}-${tagIndex}`}>{tag}</span>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="timeline-note">{job.note}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function TechnicalFolder() {
  const { content } = useSiteContent()
  const technical = content.skills.technical
  const [open, setOpen] = useState(false)

  return (
    <div className={`folder${open ? ' is-open' : ''}`} data-reveal>
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span className="folder-back" aria-hidden="true" />
        <span className="folder-front" aria-hidden="true" />
        <span className="folder-label">{open ? technical.folderOpen : technical.folderClosed}</span>
      </button>
      <div className="folder-tools" aria-hidden={!open}>
        {technical.groups.flatMap((group) => group.items).map((item, index) => (
          <span key={`${item}-${index}`} style={{ '--i': index } as CSSProperties}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

function Skills() {
  const { content } = useSiteContent()
  const skills = content.skills

  return (
    <section id="skills" className="skills-section">
      <div className="accounting-block">
        <div className="container">
          <PaperHeading eyebrow={skills.accounting.eyebrow} title={skills.accounting.title} />
          <div className="expertise-grid">
            {skills.accounting.groups.map((group, groupIndex) => (
              <article className="paper-card expertise-card" key={`${group.title}-${groupIndex}`} data-reveal>
                <span className="card-tape" aria-hidden="true" />
                <div className="expertise-card-head">
                  <span className="expertise-number" aria-hidden="true">
                    <ChartIcon width={17} height={17} />
                  </span>
                  <h3>{group.title}</h3>
                </div>
                <ul>
                  {group.items.map((item, itemIndex) => (
                    <li key={`${item}-${itemIndex}`}>
                      <span aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="container technical-block">
        <PaperHeading eyebrow={skills.technical.eyebrow} title={skills.technical.title} />
        <div className="technical-grid">
          {skills.technical.groups.map((group, groupIndex) => (
            <article className="paper-card technical-card" key={`${group.title}-${groupIndex}`} data-reveal>
              <span className="card-tape card-tape--small" aria-hidden="true" />
              <h3>{group.title}</h3>
              <div className="skill-badges">
                {group.items.map((item, itemIndex) => (
                  <span key={`${item}-${itemIndex}`}>{item}</span>
                ))}
              </div>
            </article>
          ))}
          <TechnicalFolder />
        </div>
        <p className="skills-note" data-reveal>
          {skills.technical.note}
        </p>
      </div>

      <div className="container soft-block">
        <PaperHeading eyebrow={skills.soft.eyebrow} title={skills.soft.title} />
        <div className="soft-grid">
          {skills.soft.items.map((skill, index) => (
            <article className={`soft-note soft-note--${index % 3}`} key={`${skill}-${index}`} data-reveal>
              <span className="note-tape" aria-hidden="true" />
              <SparkIcon width={17} height={17} />
              <span>{skill}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Vision() {
  const { content } = useSiteContent()
  const vision = content.vision

  return (
    <section id="vision" className="section vision-section">
      <div className="container vision-inner">
        <div data-reveal>
          <PaperHeading eyebrow={vision.eyebrow} title={vision.title} />
          <div className="quote-slip">
            <span className="note-tape" aria-hidden="true" />
            <p>{vision.quote}</p>
          </div>
        </div>
        <div className="vision-panel" data-reveal>
          <span className="hand-label">{vision.bringLabel}</span>
          {vision.rows.map((row, index) => (
            <div className="vision-row" key={`${row}-${index}`}>
              <span aria-hidden="true" />
              {row}
            </div>
          ))}
          <div className="vision-panel-foot">{vision.foot}</div>
        </div>
      </div>
    </section>
  )
}

const CONTACT_RATE_LIMIT_KEY = 'misha-contact-submissions'
const CONTACT_RATE_WINDOW_MS = 10 * 60 * 1000
const CONTACT_MAX_SUBMISSIONS = 3
const CONTACT_COOLDOWN_MS = 30 * 1000

function readSubmissionTimes(now: number): number[] {
  try {
    const saved = localStorage.getItem(CONTACT_RATE_LIMIT_KEY)
    const parsed = saved ? JSON.parse(saved) : []
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((item): item is number => typeof item === 'number' && Number.isFinite(item))
      .filter((time) => now - time < CONTACT_RATE_WINDOW_MS)
  } catch {
    return []
  }
}

function writeSubmissionTimes(times: number[]) {
  try {
    localStorage.setItem(CONTACT_RATE_LIMIT_KEY, JSON.stringify(times))
  } catch {
    return
  }
}

function getRateLimitMessage(
  times: number[],
  now: number,
  status: { maxTemplate: string; cooldownTemplate: string },
): string {
  if (times.length >= CONTACT_MAX_SUBMISSIONS) {
    const retryAt = (times[0] ?? now) + CONTACT_RATE_WINDOW_MS
    const minutes = Math.max(1, Math.ceil((retryAt - now) / 60000))
    return formatTemplate(status.maxTemplate, { minutes, plural: minutes === 1 ? '' : 's' })
  }

  const lastSubmission = times[times.length - 1] ?? 0
  const remaining = CONTACT_COOLDOWN_MS - (now - lastSubmission)
  if (remaining > 0) {
    const seconds = Math.ceil(remaining / 1000)
    return formatTemplate(status.cooldownTemplate, { seconds })
  }

  return ''
}

function Contact() {
  const { content } = useSiteContent()
  const contact = content.contact
  const [status, setStatus] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const accessKey = import.meta.env.WEBFORM_KEY
    const now = Date.now()
    const recentSubmissions = readSubmissionTimes(now)
    const rateLimitMessage = getRateLimitMessage(recentSubmissions, now, contact.status)

    if (rateLimitMessage) {
      setStatus(rateLimitMessage)
      return
    }

    if (!accessKey) {
      setStatus(contact.status.notConfigured)
      return
    }

    setSending(true)
    setStatus(contact.status.sending)

    const formData = new FormData(form)
    formData.append('access_key', accessKey)
    formData.append('from_name', contact.fromName)

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()

      if (response.ok && data.success) {
        writeSubmissionTimes([...recentSubmissions, now])
        setStatus(contact.status.success)
        form.reset()
      } else if (response.status === 429) {
        setStatus(contact.status.tooMany)
      } else {
        setStatus(contact.status.error)
      }
    } catch {
      setStatus(contact.status.error)
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="contact" className="section contact-section">
      <div className="container contact-grid">
        <div className="contact-intro" data-reveal>
          <PaperHeading eyebrow={contact.eyebrow} title={contact.title} />
          <p>{contact.intro}</p>
          <div className="contact-details">
            <a href={`mailto:${contact.emailAddress}`}>
              <span className="contact-icon"><MailIcon width={17} height={17} /></span>
              <span><small>{contact.emailLabel}</small>{contact.emailAddress}</span>
            </a>
          </div>
        </div>

        <form className="retro-window" onSubmit={handleSubmit} data-reveal>
          <div className="window-bar">
            <span>{contact.windowTitle}</span>
            <span aria-hidden="true">□</span>
          </div>
          <div className="window-body">
            <input
              type="checkbox"
              name="botcheck"
              className="botcheck"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            <div className="form-row">
              <label>
                <span>{contact.fields.name}</span>
                <input name="name" type="text" autoComplete="name" placeholder={contact.fields.namePlaceholder} required />
              </label>
              <label>
                <span>{contact.fields.email}</span>
                <input name="email" type="email" autoComplete="email" placeholder={contact.fields.emailPlaceholder} required />
              </label>
            </div>
            <label>
              <span>{contact.fields.subject}</span>
              <input name="subject" type="text" placeholder={contact.fields.subjectPlaceholder} required />
            </label>
            <label>
              <span>{contact.fields.message}</span>
              <textarea name="message" rows={5} placeholder={contact.fields.messagePlaceholder} required />
            </label>
            <button className="paper-button paper-button--solid" type="submit" disabled={sending}>
              {sending ? contact.buttons.sending : contact.buttons.send} <ArrowIcon width={16} height={16} />
            </button>
            <p className="form-status" role="status" aria-live="polite">{status}</p>
          </div>
        </form>
      </div>
    </section>
  )
}

function Footer() {
  const { content } = useSiteContent()
  const footer = content.footer

  return (
    <footer className="footer">
      <TapeMarquee items={footer.marquee} tone="plum" reverse />
      <div className="container footer-inner">
        <div>
          <span className="footer-name">{footer.name}</span>
          <strong>{footer.role}</strong>
          <p>{footer.line}</p>
        </div>
        <div className="footer-links">
          <a href={`mailto:${content.contact.emailAddress}`}>{content.contact.emailAddress}</a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          {formatTemplate(footer.rightsTemplate, { year: new Date().getFullYear(), name: footer.rightsName })}
        </span>
        <a href={content.nav.items[0]?.href ?? '#home'}>{footer.back}</a>
      </div>
    </footer>
  )
}

export default function App() {
  useReveal()

  return (
    <>
      <Loader />
      <CursorTag />
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar />
      <main id="main">
        <Hero />
        <About />
        <Education />
        <Achievements />
        <Experience />
        <Skills />
        <Vision />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

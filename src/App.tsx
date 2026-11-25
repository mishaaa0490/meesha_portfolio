import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import {
  ArrowIcon,
  AwardIcon,
  BookIcon,
  BriefcaseIcon,
  CalculatorIcon,
  CameraIcon,
  ChartIcon,
  CheckIcon,
  CloseIcon,
  CoffeeIcon,
  CookieIcon,
  GlobeIcon,
  LampIcon,
  LipGlossIcon,
  MailIcon,
  MedalIcon,
  MenuIcon,
  PaperclipIcon,
  PhoneIcon,
  PinIcon,
  SparkIcon,
} from './icons'
import {
  accountingExpertise,
  achievements,
  education,
  experience,
  focusAreas,
  navItems,
  profile,
  softSkills,
  technicalSkills,
} from './data'

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

function useActiveSection() {
  const [active, setActive] = useState('#home')

  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.href.slice(1)))
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
  }, [])

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
      <p>
        hello, i&apos;m Misha<span className="loader-caret" />
      </p>
    </div>
  )
}

function CursorTag() {
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
      <span>misha</span>
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
      <span className="float-icon float-icon--coffee"><CoffeeIcon width={26} height={26} /></span>
      <span className="float-icon float-icon--lip"><LipGlossIcon width={25} height={25} /></span>
      <span className="float-icon float-icon--calc"><CalculatorIcon width={27} height={27} /></span>
      <span className="float-icon float-icon--camera"><CameraIcon width={28} height={28} /></span>
      <span className="float-icon float-icon--clip"><PaperclipIcon width={26} height={26} /></span>
      <span className="float-icon float-icon--lamp"><LampIcon width={30} height={30} /></span>
      <span className="float-icon float-icon--globe"><GlobeIcon width={28} height={28} /></span>
      <span className="float-icon float-icon--cookie"><CookieIcon width={26} height={26} /></span>
    </div>
  )
}

function Navbar() {
  const active = useActiveSection()
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
        <a className="brand" href="#home" aria-label="Misha Sahu — home" onClick={() => setOpen(false)}>
          <span className="brand-name">misha sahu</span>
          <span className="brand-sub">CA student · Udaipur</span>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className={active === item.href ? 'nav-link is-active' : 'nav-link'}>
              {item.label}
            </a>
          ))}
        </nav>

        <a className="nav-cta" href="#contact">
          say hello <ArrowIcon width={15} height={15} />
        </a>

        <button
          className="menu-toggle"
          type="button"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      <nav id="mobile-menu" className={`mobile-menu${open ? ' is-open' : ''}`} aria-label="Mobile navigation" aria-hidden={!open}>
        {navItems.map((item) => (
          <a key={item.href} href={item.href} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
            {item.label}
          </a>
        ))}
        <a href="#contact" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
          Say hello
        </a>
      </nav>
    </header>
  )
}

function Hero() {
  const [flipped, setFlipped] = useState(false)
  const [tapePlaying, setTapePlaying] = useState(false)

  return (
    <section id="home" className="hero">
      <div className="desk-speckles" aria-hidden="true" />
      <SudokuBackdrop />
      <TapeMarquee items={['CA Student', 'Accounting', 'Taxation', 'Auditing', 'Financial Management']} />
      <FloatingIcons />

      <div className="container hero-inner">
        <div className="hero-copy">
          <div className="hero-kicker hero-stagger">
            <span className="tape-label">a little introduction</span>
          </div>

          <button
            type="button"
            className={`name-flip hero-stagger${flipped ? ' is-flipped' : ''}`}
            onClick={() => setFlipped((value) => !value)}
            aria-pressed={flipped}
            aria-label={flipped ? 'Show Misha Sahu name' : 'Show Misha Sahu CA journey pass'}
          >
            <span className="name-flip-inner">
              <span className="name-face name-face--front">
                <span className="hand-small">hi, i&apos;m</span>
                <span className="hero-name">Misha Sahu</span>
                <span className="hero-signature">Misha</span>
              </span>
              <span className="name-face name-face--back">
                <span className="pass-top">CA JOURNEY PASS</span>
                <span className="pass-grid">
                  <span><small>Name</small>Misha Sahu</span>
                  <span><small>Status</small>CA Student</span>
                  <span><small>Milestone</small>Group 1 passed</span>
                  <span><small>Based in</small>Udaipur</span>
                </span>
                <span className="pass-foot">CA Foundation → CA Intermediate</span>
              </span>
            </span>
          </button>

          <p className="hero-role hero-stagger">CA Student | Accounting &amp; Finance Professional</p>

          <div className="hero-note hero-stagger">
            <span className="note-tape" aria-hidden="true" />
            <p>
              Building a career in accounting, taxation, auditing and financial management — with hands-on internship
              experience and a love for getting the details right.
            </p>
          </div>
          <p className="hero-tiny hero-stagger">tap the name to see my CA pass ↗</p>

          <div className="hero-actions hero-stagger">
            <a className="paper-button paper-button--solid" href="#experience">
              View My Experience <ArrowIcon width={16} height={16} />
            </a>
            <a className="paper-button" href="#contact">
              Get In Touch
            </a>
          </div>

          <div className="hero-location hero-stagger">
            <PinIcon width={15} height={15} />
            <span>University Road, Udaipur, Rajasthan</span>
          </div>
        </div>

        <div className="hero-visual hero-stagger">
          <div className="polaroid">
            <span className="polaroid-tape" aria-hidden="true" />
            <img src="/meesha.jpeg" alt="Portrait of Misha Sahu" width={900} height={1600} />
            <span className="polaroid-caption">misha, at work</span>
          </div>

          <span className="sticker sticker--round" aria-hidden="true">
            CA <br /> STUDENT
          </span>
          <span className="sticker sticker--group" aria-hidden="true">
            GROUP 1 <CheckIcon width={12} height={12} />
          </span>
          <span className="sticker sticker--city" aria-hidden="true">UDAIPUR, RJ</span>
          <span className="doodle doodle--one" aria-hidden="true">✳</span>
          <span className="doodle doodle--two" aria-hidden="true">✦</span>

          <div className={`cassette${tapePlaying ? ' is-playing' : ''}`}>
            <button type="button" onClick={() => setTapePlaying((value) => !value)} aria-pressed={tapePlaying}>
              <span className="cassette-label">
                <span className="cassette-reel" />
                <span className="cassette-window">
                  <i className="reel reel--left" />
                  <i className="reel reel--right" />
                </span>
                <span className="cassette-reel" />
              </span>
              <span className="cassette-text">{tapePlaying ? 'accuracy over speed' : 'tap the tape'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container hero-stats hero-stagger">
        <div className="hero-stat">
          <strong><CountUp value={81.32} decimals={2} />%</strong>
          <span>B.Com · Mohanlal Sukhadia University</span>
        </div>
        <div className="hero-stat">
          <strong><CountUp value={50.66} decimals={2} />%</strong>
          <span>CA Intermediate · Group 1</span>
        </div>
        <div className="hero-stat">
          <strong><CountUp value={87} decimals={2} />%</strong>
          <span>Class XII · Navbharat SRSEC School</span>
        </div>
      </div>

      <TapeMarquee items={['Accuracy', 'Reliability', 'Continuous learning', 'Career growth']} reverse tone="rose" />
    </section>
  )
}

function About() {
  return (
    <section id="about" className="section about-section">
      <div className="container about-grid">
        <div data-reveal>
          <PaperHeading eyebrow="a little about me" title="Building a career on accuracy, discipline and continuous learning." />
          <div className="about-sticker" aria-hidden="true">READ ME ✳</div>
        </div>
        <div className="about-panel" data-reveal>
          <p className="about-lead">
            I am a CA student and accounting-focused professional based in Udaipur, Rajasthan, building a career rooted
            in accuracy, discipline and continuous learning.
          </p>
          <p>
            My internship at IMW Services Pvt Ltd gave me practical exposure to journal entries, ledger posting, trial
            balance preparation, bank reconciliation, GST return data preparation and invoice processing. I work with
            Tally and MS Excel for accounting entries, data tracking and report preparation.
          </p>
          <p>
            I am focused on accounting, taxation, auditing and financial management, and I am looking to contribute
            effectively to an organisation while strengthening my technical and professional competencies under expert
            mentorship.
          </p>
          <div className="focus-chips" aria-label="Areas of interest">
            {focusAreas.map((area) => (
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
  const caJourney = education.filter((item) => item.kind === 'CA')
  const remaining = education.filter((item) => item.kind !== 'CA')

  return (
    <section id="education" className="section education-section">
      <div className="container">
        <PaperHeading eyebrow="my CA journey" title="One step at a time, from foundation to Group 1." />

        <div className="ca-track" data-reveal>
          {caJourney.map((item, index) => (
            <div className="ca-step-wrap" key={item.title}>
              <article className={`paper-card ca-card${item.title.includes('Intermediate') ? ' ca-card--featured' : ''}`}>
                <span className="card-tape" aria-hidden="true" />
                <div className="ca-card-top">
                  <span className="hand-label">{item.title.includes('Intermediate') ? 'current milestone' : 'where it began'}</span>
                  <span className="ca-date">{item.detail}</span>
                </div>
                <h3>{item.title}</h3>
                <p className="ca-institute">{item.institute}</p>
                <div className="ca-score">
                  <strong>{item.score}</strong>
                  <span>score</span>
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
          {remaining.map((item) => (
            <article className="paper-card edu-card" key={item.title} data-reveal>
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
                <span>score</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Achievements() {
  return (
    <section id="achievements" className="section achievements-section">
      <div className="container">
        <PaperHeading eyebrow="little wins" title="Consistency, recognised early." />
        <div className="achievement-grid">
          {achievements.map((item) => (
            <article className="paper-card achievement-card" key={item.title} data-reveal>
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
  return (
    <section id="experience" className="section experience-section">
      <div className="container">
        <PaperHeading eyebrow="where i've worked" title="Practical exposure, applied with care." />
        <div className="timeline">
          {experience.map((job, index) => (
            <article className="timeline-item" key={job.company} data-reveal>
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
                      {job.responsibilities.map((task) => (
                        <li key={task}>
                          <CheckIcon width={14} height={14} />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="timeline-tags" aria-label="Areas of work">
                      {job.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="timeline-note">Role and organisation as listed in the résumé.</p>
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
  const [open, setOpen] = useState(false)

  return (
    <div className={`folder${open ? ' is-open' : ''}`} data-reveal>
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span className="folder-back" aria-hidden="true" />
        <span className="folder-front" aria-hidden="true" />
        <span className="folder-label">{open ? 'close the folder' : 'open my tool folder'}</span>
      </button>
      <div className="folder-tools" aria-hidden={!open}>
        {technicalSkills.flatMap((group) => group.items).map((item, index) => (
          <span key={item} style={{ '--i': index } as CSSProperties}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

function Skills() {
  return (
    <section id="skills" className="skills-section">
      <div className="accounting-block">
        <div className="container">
          <PaperHeading eyebrow="what i work with" title="The accounting core." />
          <div className="expertise-grid">
            {accountingExpertise.map((group) => (
              <article className="paper-card expertise-card" key={group.title} data-reveal>
                <span className="card-tape" aria-hidden="true" />
                <div className="expertise-card-head">
                  <span className="expertise-number" aria-hidden="true">
                    <ChartIcon width={17} height={17} />
                  </span>
                  <h3>{group.title}</h3>
                </div>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>
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
        <PaperHeading eyebrow="technical skills" title="Tools &amp; knowledge I work with." />
        <div className="technical-grid">
          {technicalSkills.map((group) => (
            <article className="paper-card technical-card" key={group.title} data-reveal>
              <span className="card-tape card-tape--small" aria-hidden="true" />
              <h3>{group.title}</h3>
              <div className="skill-badges">
                {group.items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </article>
          ))}
          <TechnicalFolder />
        </div>
        <p className="skills-note" data-reveal>
          Accounting and compliance knowledge listed here reflects foundational understanding, not a proficiency rating.
        </p>
      </div>

      <div className="container soft-block">
        <PaperHeading eyebrow="soft skills" title="How I work with people and change." />
        <div className="soft-grid">
          {softSkills.map((skill, index) => (
            <article className={`soft-note soft-note--${index % 3}`} key={skill} data-reveal>
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
  return (
    <section id="vision" className="section vision-section">
      <div className="container vision-inner">
        <div data-reveal>
          <PaperHeading eyebrow="career objective" title="Steady growth. Real responsibility. Meaningful work." />
          <div className="quote-slip">
            <span className="note-tape" aria-hidden="true" />
            <p>
              I am seeking an opportunity in a reputed organisation where I can apply my knowledge of accounting,
              taxation, auditing and financial management, gain practical experience and continue developing my
              professional skills. As a CA student, I aim to contribute effectively while strengthening my technical and
              professional competencies under expert mentorship.
            </p>
          </div>
        </div>
        <div className="vision-panel" data-reveal>
          <span className="hand-label">what I bring</span>
          {focusAreas.map((area) => (
            <div className="vision-row" key={area}>
              <span aria-hidden="true" />
              {area}
            </div>
          ))}
          <div className="vision-panel-foot">Continuous learning · Accuracy · Reliability</div>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  const [status, setStatus] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') ?? '')
    const email = String(data.get('email') ?? '')
    const subject = String(data.get('subject') ?? '')
    const message = String(data.get('message') ?? '')

    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setStatus('Your email app should open with the message ready to send.')
    form.reset()
  }

  return (
    <section id="contact" className="section contact-section">
      <div className="container contact-grid">
        <div className="contact-intro" data-reveal>
          <PaperHeading eyebrow="say hello" title="Let's connect." />
          <p>
            Open to opportunities in accounting, taxation, auditing and financial management. I would be glad to hear
            from recruiters, mentors and collaborators.
          </p>
          <div className="contact-details">
            <a href={`mailto:${profile.email}`}>
              <span className="contact-icon"><MailIcon width={17} height={17} /></span>
              <span><small>Email</small>{profile.email}</span>
            </a>
            <a href={`tel:${profile.phoneHref}`}>
              <span className="contact-icon"><PhoneIcon width={17} height={17} /></span>
              <span><small>Phone</small>{profile.phone}</span>
            </a>
            <div>
              <span className="contact-icon"><PinIcon width={17} height={17} /></span>
              <span><small>Location</small>{profile.location}</span>
            </div>
          </div>
        </div>

        <form className="retro-window" onSubmit={handleSubmit} data-reveal>
          <div className="window-bar">
            <span>new message.txt</span>
            <span aria-hidden="true">□</span>
          </div>
          <div className="window-body">
            <div className="form-row">
              <label>
                <span>Name</span>
                <input name="name" type="text" autoComplete="name" placeholder="Your name" required />
              </label>
              <label>
                <span>Email</span>
                <input name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
              </label>
            </div>
            <label>
              <span>Subject</span>
              <input name="subject" type="text" placeholder="How can we connect?" required />
            </label>
            <label>
              <span>Message</span>
              <textarea name="message" rows={5} placeholder="Write your message here..." required />
            </label>
            <button className="paper-button paper-button--solid" type="submit">
              Send Message <ArrowIcon width={16} height={16} />
            </button>
            <p className="form-status" role="status" aria-live="polite">{status}</p>
          </div>
        </form>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <TapeMarquee items={['Misha Sahu', 'CA Student', 'Udaipur, Rajasthan']} tone="plum" reverse />
      <div className="container footer-inner">
        <div>
          <span className="footer-name">misha sahu</span>
          <strong>{profile.role}</strong>
          <p>{profile.shortLocation}</p>
        </div>
        <div className="footer-links">
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <a href={`tel:${profile.phoneHref}`}>{profile.phone}</a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} {profile.name}. All rights reserved.</span>
        <a href="#home">back to the desk ↑</a>
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

import { createContext, createElement, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

export type IconName = 'award' | 'medal'

export interface NavItem {
  label: string
  href: string
}

export interface PassField {
  label: string
  value: string
}

export interface StatItem {
  value: string
  decimals: number
  suffix: string
  label: string
}

export interface EducationItem {
  title: string
  detail: string
  institute: string
  score: string
  kind: string
  featured: boolean
  label: string
}

export interface AchievementItem {
  title: string
  description: string
  icon: IconName
}

export interface ExperienceItem {
  role: string
  company: string
  period: string
  responsibilities: string[]
  tags: string[]
  note: string
}

export interface SkillGroup {
  title: string
  items: string[]
}

export interface SiteContent {
  meta: {
    title: string
    description: string
    themeColor: string
  }
  loader: {
    text: string
    name: string
  }
  cursor: {
    label: string
  }
  brand: {
    name: string
    sub: string
    aria: string
  }
  nav: {
    items: NavItem[]
    cta: string
    mobileCta: string
    primaryAria: string
    mobileAria: string
    openAria: string
    closeAria: string
  }
  hero: {
    marqueeTop: string[]
    tapeLabel: string
    flip: {
      frontAria: string
      backAria: string
      hi: string
      name: string
      signature: string
      passTop: string
      passFoot: string
      fields: PassField[]
    }
    role: string
    note: string
    hint: string
    actions: {
      experience: string
      contact: string
    }
    tagline: string
    imageAlt: string
    imageCaption: string
    stickers: {
      studentTop: string
      studentBottom: string
      group: string
      city: string
    }
    cassette: {
      idle: string
      playing: string
      aria: string
    }
    stats: StatItem[]
    marqueeBottom: string[]
  }
  about: {
    eyebrow: string
    title: string
    photoAlt: string
    photoCaption: string
    paragraphs: string[]
    focusAreas: string[]
  }
  education: {
    eyebrow: string
    title: string
    labels: {
      currentMilestone: string
      whereItBegan: string
      score: string
    }
    items: EducationItem[]
  }
  achievements: {
    eyebrow: string
    title: string
    items: AchievementItem[]
  }
  experience: {
    eyebrow: string
    title: string
    items: ExperienceItem[]
  }
  skills: {
    accounting: {
      eyebrow: string
      title: string
      groups: SkillGroup[]
    }
    technical: {
      eyebrow: string
      title: string
      folderOpen: string
      folderClosed: string
      note: string
      groups: SkillGroup[]
    }
    soft: {
      eyebrow: string
      title: string
      items: string[]
    }
  }
  vision: {
    eyebrow: string
    title: string
    quote: string
    bringLabel: string
    rows: string[]
    foot: string
  }
  contact: {
    eyebrow: string
    title: string
    intro: string
    emailLabel: string
    emailAddress: string
    fromName: string
    windowTitle: string
    fields: {
      name: string
      email: string
      subject: string
      message: string
      namePlaceholder: string
      emailPlaceholder: string
      subjectPlaceholder: string
      messagePlaceholder: string
    }
    buttons: {
      send: string
      sending: string
    }
    status: {
      notConfigured: string
      sending: string
      success: string
      tooMany: string
      error: string
      maxTemplate: string
      cooldownTemplate: string
    }
  }
  footer: {
    marquee: string[]
    name: string
    role: string
    line: string
    back: string
    rightsName: string
    rightsTemplate: string
  }
  images: {
    hero: string
    about: string
  }
}

export const defaultContent: SiteContent = {
  meta: {
    title: 'Misha Sahu — CA Student | Accounting & Finance Professional',
    description:
      'Misha Sahu — CA Student and Accounting & Finance Professional. Building a career in accounting, taxation, auditing and financial management.',
    themeColor: '#3f2416',
  },
  loader: {
    text: "hello, i'm",
    name: 'Misha',
  },
  cursor: {
    label: 'misha',
  },
  brand: {
    name: 'misha sahu',
    sub: 'CA student · Accounting & Finance',
    aria: 'Misha Sahu — home',
  },
  nav: {
    items: [
      { label: 'Home', href: '#home' },
      { label: 'About', href: '#about' },
      { label: 'Education', href: '#education' },
      { label: 'Experience', href: '#experience' },
      { label: 'Skills', href: '#skills' },
      { label: 'Achievements', href: '#achievements' },
      { label: 'Contact', href: '#contact' },
    ],
    cta: 'say hello',
    mobileCta: 'Say hello',
    primaryAria: 'Primary navigation',
    mobileAria: 'Mobile navigation',
    openAria: 'Open navigation menu',
    closeAria: 'Close navigation menu',
  },
  hero: {
    marqueeTop: ['CA Student', 'Accounting', 'Taxation', 'Auditing', 'Financial Management'],
    tapeLabel: 'a little introduction',
    flip: {
      frontAria: 'Show Misha Sahu name',
      backAria: 'Show Misha Sahu CA journey pass',
      hi: "hi, i'm",
      name: 'Misha Sahu',
      signature: 'Misha',
      passTop: 'CA JOURNEY PASS',
      passFoot: 'CA Foundation → CA Intermediate',
      fields: [
        { label: 'Name', value: 'Misha Sahu' },
        { label: 'Status', value: 'CA Student' },
        { label: 'Milestone', value: 'Group 1 passed' },
        { label: 'Focus', value: 'Accuracy' },
      ],
    },
    role: 'CA Student | Accounting & Finance Professional',
    note: 'Building a career in accounting, taxation, auditing and financial management — with hands-on internship experience and a love for getting the details right.',
    hint: 'tap the name to see my CA pass ↗',
    actions: {
      experience: 'View My Experience',
      contact: 'Get In Touch',
    },
    tagline: 'Detail-oriented · Deadline-driven',
    imageAlt: 'Portrait of Misha Sahu',
    imageCaption: 'misha, at work',
    stickers: {
      studentTop: 'CA',
      studentBottom: 'STUDENT',
      group: 'GROUP 1',
      city: 'G1 PASSED',
    },
    cassette: {
      idle: 'tap the tape',
      playing: 'accuracy over speed',
      aria: 'Toggle cassette tape',
    },
    stats: [
      { value: '81.32', decimals: 2, suffix: '%', label: 'B.Com · Mohanlal Sukhadia University' },
      { value: '50.66', decimals: 2, suffix: '%', label: 'CA Intermediate · Group 1' },
      { value: '87', decimals: 2, suffix: '%', label: 'Class XII · Navbharat SRSEC School' },
    ],
    marqueeBottom: ['Accuracy', 'Reliability', 'Continuous learning', 'Career growth'],
  },
  about: {
    eyebrow: 'a little about me',
    title: 'Building a career on accuracy, discipline and continuous learning.',
    photoAlt: 'Misha Sahu',
    photoCaption: 'more me ✳',
    paragraphs: [
      'I am a CA student and accounting-focused professional building a career rooted in accuracy, discipline and continuous learning.',
      'My internship at IMW Services Pvt Ltd gave me practical exposure to journal entries, ledger posting, trial balance preparation, bank reconciliation, GST return data preparation and invoice processing. I work with Tally and MS Excel for accounting entries, data tracking and report preparation.',
      'I am focused on accounting, taxation, auditing and financial management, and I am looking to contribute effectively to an organisation while strengthening my technical and professional competencies under expert mentorship.',
    ],
    focusAreas: ['Accounting', 'Taxation', 'Auditing', 'Financial management'],
  },
  education: {
    eyebrow: 'my CA journey',
    title: 'One step at a time, from foundation to Group 1.',
    labels: {
      currentMilestone: 'current milestone',
      whereItBegan: 'where it began',
      score: 'score',
    },
    items: [
      {
        title: 'CA Intermediate — Group 1 Passed',
        detail: 'September 2026',
        institute: 'Institute of Chartered Accountants of India',
        score: '50.66%',
        kind: 'CA',
        featured: true,
        label: 'current milestone',
      },
      {
        title: 'CA Foundation',
        detail: 'May 2023',
        institute: 'Institute of Chartered Accountants of India',
        score: '54.00%',
        kind: 'CA',
        featured: false,
        label: 'where it began',
      },
      {
        title: 'Bachelor of Commerce',
        detail: '2022–2026',
        institute: 'Mohanlal Sukhadia University',
        score: '81.32%',
        kind: 'Graduation',
        featured: false,
        label: 'graduation',
      },
      {
        title: 'Class XII',
        detail: '2021–2022',
        institute: 'Navbharat SRSEC School',
        score: '87.00%',
        kind: 'School',
        featured: false,
        label: 'school',
      },
      {
        title: 'Class X',
        detail: '2020–2021',
        institute: 'The Stanward SRSEC School',
        score: '85.07%',
        kind: 'School',
        featured: false,
        label: 'school',
      },
    ],
  },
  achievements: {
    eyebrow: 'little wins',
    title: 'Consistency, recognised early.',
    items: [
      {
        title: 'Best Student in Class 12th',
        description: 'Academic award for outstanding performance in Class XII.',
        icon: 'award',
      },
      {
        title: '3rd Position — Class 12th',
        description: 'Certificate of Merit for securing 3rd position in Class XII.',
        icon: 'medal',
      },
      {
        title: '3rd Position — Class 10th',
        description: 'Certificate of Merit for securing 3rd position in Class X.',
        icon: 'medal',
      },
    ],
  },
  experience: {
    eyebrow: "where i've worked",
    title: 'Practical exposure, applied with care.',
    items: [
      {
        role: 'Accountant Intern',
        company: 'IMW Services Pvt Ltd',
        period: 'Internship',
        responsibilities: [
          'Recorded day-to-day transactions and passed journal entries.',
          'Posted ledgers and assisted in preparing trial balance.',
          'Prepared bank reconciliation statements.',
          'Maintained accounts payable and accounts receivable records.',
          'Processed invoices and billing.',
          'Assisted with GST return data preparation.',
          'Assisted with input tax credit reconciliation.',
          'Used Tally and MS Excel for accounting entries, data tracking and report preparation.',
        ],
        tags: [
          'Accounting Entries',
          'Bank Reconciliation',
          'GST',
          'Accounts Payable / Receivable',
          'Invoice Processing',
          'Tally',
          'MS Excel',
        ],
        note: 'Role and organisation as listed in the résumé.',
      },
      {
        role: 'Junior Assistant',
        company: 'AL SALVI and ASSOCIATE',
        period: 'Role as listed in résumé',
        responsibilities: [],
        tags: [],
        note: 'Role and organisation as listed in the résumé.',
      },
    ],
  },
  skills: {
    accounting: {
      eyebrow: 'what i work with',
      title: 'The accounting core.',
      groups: [
        {
          title: 'Core Accounting',
          items: ['Bookkeeping', 'Journal entries', 'Ledger posting', 'Trial balance preparation'],
        },
        {
          title: 'Finance Operations',
          items: [
            'Accounts payable',
            'Accounts receivable',
            'Invoice processing',
            'Billing',
            'Bank reconciliation',
          ],
        },
        {
          title: 'Taxation & Compliance',
          items: [
            'GST return filing basics',
            'GSTR-1',
            'GSTR-3B',
            'Input tax credit',
            'TDS basics',
            'Income Tax Act 1961',
          ],
        },
        {
          title: 'Financial Reporting',
          items: [
            'Basic financial statements',
            'Profit & Loss statement',
            'Balance sheet',
            'Statutory compliance awareness',
          ],
        },
      ],
    },
    technical: {
      eyebrow: 'technical skills',
      title: 'Tools & knowledge I work with.',
      folderOpen: 'close the folder',
      folderClosed: 'open my tool folder',
      note: 'Accounting and compliance knowledge listed here reflects foundational understanding, not a proficiency rating.',
      groups: [
        {
          title: 'Accounting & Office Tools',
          items: ['Tally', 'Zoho', 'MS Excel', 'MS Word', 'MS PowerPoint'],
        },
        {
          title: 'MS Excel Knowledge',
          items: ['VLOOKUP', 'Pivot Tables', 'SUMIFS'],
        },
        {
          title: 'Accounting & Compliance Knowledge',
          items: [
            'Accounting Standards',
            'Standards on Auditing',
            'Companies Act 2013',
            'Income Tax Act 1961',
            'Goods and Services Tax 2017',
          ],
        },
      ],
    },
    soft: {
      eyebrow: 'soft skills',
      title: 'How I work with people and change.',
      items: [
        'Good communication and interpersonal skills',
        'Quick learner',
        'Adaptability to changing environments',
        'Ability to work independently',
        'Ability to work in a team',
        'Competitive analysis',
      ],
    },
  },
  vision: {
    eyebrow: 'career objective',
    title: 'Steady growth. Real responsibility. Meaningful work.',
    quote:
      'I am seeking an opportunity in a reputed organisation where I can apply my knowledge of accounting, taxation, auditing and financial management, gain practical experience and continue developing my professional skills. As a CA student, I aim to contribute effectively while strengthening my technical and professional competencies under expert mentorship.',
    bringLabel: 'what I bring',
    rows: ['Accounting', 'Taxation', 'Auditing', 'Financial management'],
    foot: 'Continuous learning · Accuracy · Reliability',
  },
  contact: {
    eyebrow: 'say hello',
    title: "Let's connect.",
    intro:
      'Open to opportunities in accounting, taxation, auditing and financial management. I would be glad to hear from recruiters, mentors and collaborators.',
    emailLabel: 'Email',
    emailAddress: 'mishaaa0490@gmail.com',
    fromName: 'Misha Sahu Portfolio',
    windowTitle: 'new message.txt',
    fields: {
      name: 'Name',
      email: 'Email',
      subject: 'Subject',
      message: 'Message',
      namePlaceholder: 'Your name',
      emailPlaceholder: 'you@example.com',
      subjectPlaceholder: 'How can we connect?',
      messagePlaceholder: 'Write your message here...',
    },
    buttons: {
      send: 'Send Message',
      sending: 'Sending...',
    },
    status: {
      notConfigured: 'Contact form is not configured. Please email me directly.',
      sending: 'Sending your message...',
      success: 'Message sent successfully.',
      tooMany: 'Too many messages. Please try again shortly.',
      error: 'Unable to send your message. Please try again.',
      maxTemplate: 'Too many messages. Please try again in {minutes} minute{plural}.',
      cooldownTemplate: 'Please wait {seconds}s before sending another message.',
    },
  },
  footer: {
    marquee: ['Misha Sahu', 'CA Student', 'Accuracy first'],
    name: 'misha sahu',
    role: 'CA Student | Accounting & Finance Professional',
    line: 'CA Intermediate · Group 1 Passed',
    back: 'back to the desk ↑',
    rightsName: 'Misha Sahu',
    rightsTemplate: '© {year} {name}. All rights reserved.',
  },
  images: {
    hero: '/meesha.jpeg',
    about: '/WhatsApp%20Image%202026-11-25%20at%202.59.22%20PM.jpeg',
  },
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function mergeWithDefaults<T>(defaults: T, saved: unknown): T {
  if (Array.isArray(defaults)) {
    if (!Array.isArray(saved)) return defaults
    const template = defaults[0]
    if (isRecord(template)) {
      return saved.map((item) => mergeWithDefaults(template, item)) as T
    }
    return saved as T
  }

  if (isRecord(defaults)) {
    if (!isRecord(saved)) return defaults
    const result: Record<string, unknown> = { ...defaults }
    Object.keys(defaults).forEach((key) => {
      result[key] = mergeWithDefaults(defaults[key], saved[key])
    })
    return result as T
  }

  return typeof saved === typeof defaults ? (saved as T) : defaults
}

type SaveStatus = 'loading' | 'saved' | 'dirty' | 'saving' | 'error'

interface ContentContextValue {
  content: SiteContent
  saveStatus: SaveStatus
  updateAtPath: (path: Array<string | number>, value: unknown) => void
  resetContent: () => void
  retrySave: () => void
}

const ContentContext = createContext<ContentContextValue | null>(null)

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(defaultContent)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('loading')
  const hasLocalEdits = useRef(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/content', { credentials: 'same-origin' })
      .then((response) => (response.ok ? response.json() : {}))
      .then((stored: unknown) => {
        if (cancelled || hasLocalEdits.current) return
        setContent(mergeWithDefaults(defaultContent, stored))
        setSaveStatus('saved')
      })
      .catch(() => {
        if (cancelled) return
        setSaveStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (saveStatus !== 'dirty') return
    const timer = window.setTimeout(async () => {
      setSaveStatus('saving')
      try {
        const response = await fetch('/api/content', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify(content),
        })
        if (!response.ok) throw new Error('Save failed')
        setSaveStatus('saved')
      } catch {
        setSaveStatus('error')
      }
    }, 450)
    return () => window.clearTimeout(timer)
  }, [content, saveStatus])

  useEffect(() => {
    document.title = content.meta.title
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (description) description.content = content.meta.description
    const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (themeColor) themeColor.content = content.meta.themeColor
  }, [content.meta])

  const updateAtPath = (path: Array<string | number>, value: unknown) => {
    hasLocalEdits.current = true
    setContent((previous) => {
      const next = JSON.parse(JSON.stringify(previous)) as SiteContent
      let cursor = next as unknown as Record<string | number, unknown>
      path.slice(0, -1).forEach((key) => {
        cursor = cursor[key] as Record<string | number, unknown>
      })
      cursor[path[path.length - 1]] = value
      return next
    })
    setSaveStatus('dirty')
  }

  const resetContent = () => {
    hasLocalEdits.current = true
    setContent(defaultContent)
    setSaveStatus('dirty')
  }

  const retrySave = () => setSaveStatus('dirty')

  return createElement(
    ContentContext.Provider,
    { value: { content, saveStatus, updateAtPath, resetContent, retrySave } },
    children,
  )
}

export function useSiteContent(): ContentContextValue {
  const value = useContext(ContentContext)
  if (!value) throw new Error('useSiteContent must be used inside ContentProvider')
  return value
}

export function formatTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match))
}

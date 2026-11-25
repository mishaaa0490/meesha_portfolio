import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = (props: IconProps) => ({
  xmlns: 'http://www.w3.org/2000/svg',
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...props,
})

export const ArrowIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export const MailIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
)

export const PhoneIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z" />
  </svg>
)

export const PinIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

export const AwardIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="8" r="5" />
    <path d="m8.5 12.5-1.5 9L12 18l5 3.5-1.5-9" />
  </svg>
)

export const MedalIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M7 3h10l-3 7H10L7 3Z" />
    <circle cx="12" cy="15" r="6" />
    <path d="m12 12 1 2 2 .3-1.5 1.4.4 2.1L12 16.8l-1.9 1 .4-2.1L9 14.3l2-.3 1-2Z" />
  </svg>
)

export const BookIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22V4.5Z" />
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
  </svg>
)

export const BriefcaseIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="7" width="18" height="14" rx="2" />
    <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18" />
  </svg>
)

export const CheckIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m5 12 4 4L19 6" />
  </svg>
)

export const MenuIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)

export const CloseIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export const ChartIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </svg>
)

export const SparkIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
  </svg>
)

export const CoffeeIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 9h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Z" />
    <path d="M17 10h2a2.5 2.5 0 0 1 0 5h-2M8 3c0 1-1 1.5-1 2.5M12 3c0 1-1 1.5-1 2.5" />
  </svg>
)

export const LipGlossIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="9" y="2" width="6" height="7" rx="1" />
    <path d="M8 9h8l-1 12H9L8 9Z" />
    <path d="M9.5 14h5M10 21h4" />
  </svg>
)

export const CalculatorIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <path d="M8 6h8v3H8z" />
    <path d="M8.5 13h.01M12 13h.01M15.5 13h.01M8.5 17h.01M12 17h.01M15.5 17h.01" strokeWidth="2.6" />
  </svg>
)

export const CameraIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 8h4l1.5-2h7L17 8h4a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
    <circle cx="12" cy="13.5" r="3.5" />
    <path d="M17.5 11h.01" strokeWidth="2.4" />
  </svg>
)

export const PaperclipIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M20 11.5 12.3 19a4.6 4.6 0 0 1-6.5-6.5l8-8a3.1 3.1 0 0 1 4.4 4.4l-8 8a1.6 1.6 0 0 1-2.2-2.2l7.3-7.3" />
  </svg>
)

export const LampIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M6 4h8l4 7H4l2-7Z" />
    <path d="M12 11v7M8 21h8M10 18h4" />
  </svg>
)

export const GlobeIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
  </svg>
)

export const CookieIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 3a9 9 0 1 0 9 9 3 3 0 0 1-3-3 3 3 0 0 1-3-3 3 3 0 0 1-3-3Z" />
    <path d="M8 9h.01M14 8h.01M16 13h.01M9 15h.01M12 17h.01" strokeWidth="2.4" />
  </svg>
)

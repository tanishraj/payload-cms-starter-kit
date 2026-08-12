import Image from 'next/image'

import { FaFacebook, FaGithub, FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa'
import { Mail, MapPin, Phone } from 'lucide-react'

import {
  resolveBlockAppearanceClasses,
  type BlockAppearance,
} from '@/blocks/shared/blockAppearance'
import {
  regularBlockContainerClasses,
  regularBlockMobilePaddingClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'
import { ContentActions } from '@/components/ContentActions'
import type { ResolvedCmsAction } from '@/lib/cmsLinks'
import { cn } from '@/lib/utils'

interface FooterLink {
  name: string
  href: string
}
interface FooterSection {
  title?: string | null
  links: FooterLink[]
}
interface FooterSocialLink {
  icon: React.ReactNode
  href: string
  label: string
}
interface FooterLogo {
  url: string
  src: string
  alt: string
  title?: string | null
  width?: number
  height?: number
}

interface FooterBasicProps {
  actions?: ResolvedCmsAction[]
  logo?: FooterLogo
  sections?: FooterSection[]
  socialLinks?: FooterSocialLink[]
  copyright?: string
  description?: string
  legalLinks?: FooterLink[]
  appearance?: BlockAppearance | null
  className?: string
  size?: RegularBlockSize | null
}

interface Footer56Props extends FooterBasicProps {
  addressLines?: string[]
  phone?: string
  email?: string
}
type Props = Partial<Footer56Props>

const defaultProps: Footer56Props = {
  logo: {
    url: 'https://www.shadcnblocks.com',
    src: '/images/logo/shadcnblocks-logo-word.svg',
    alt: 'logo',
    title: 'Shadcnblocks.com',
  },
  sections: [
    {
      title: 'Product',
      links: [
        { name: 'Overview', href: '#' },
        { name: 'Pricing', href: '#' },
        { name: 'Marketplace', href: '#' },
        { name: 'Features', href: '#' },
        { name: 'Integrations', href: '#' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About', href: '#' },
        { name: 'Team', href: '#' },
        { name: 'Blog', href: '#' },
        { name: 'Careers', href: '#' },
        { name: 'Contact', href: '#' },
      ],
    },
    {
      title: 'Support',
      links: [
        { name: 'Help center', href: '#' },
        { name: 'Documentation', href: '#' },
        { name: 'Status', href: '#' },
        { name: 'Community', href: '#' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'Guides', href: '#' },
        { name: 'Templates', href: '#' },
        { name: 'Sales', href: '#' },
        { name: 'Advertise', href: '#' },
      ],
    },
  ],
  socialLinks: [
    {
      icon: <FaInstagram className="size-5" />,
      href: '#',
      label: 'Instagram',
    },
    { icon: <FaFacebook className="size-5" />, href: '#', label: 'Facebook' },
    { icon: <FaTwitter className="size-5" />, href: '#', label: 'Twitter' },
    { icon: <FaLinkedin className="size-5" />, href: '#', label: 'LinkedIn' },
    { icon: <FaGithub className="size-5" />, href: '#', label: 'GitHub' },
  ],
  copyright: '© 2024 Shadcnblocks.com. All rights reserved.',
  legalLinks: [
    { name: 'Terms and Conditions', href: '#' },
    { name: 'Privacy Policy', href: '#' },
  ],
  addressLines: ['123 Market Street, Suite 400', 'San Francisco, CA 94103'],
  phone: '+1 (555) 000-0000',
  email: 'hello@shadcnblocks.com',
}

const MAX_SECTIONS = 4

const Footer56 = (props: Props) => {
  const {
    actions,
    appearance,
    logo,
    addressLines,
    phone,
    email,
    sections,
    size,
    socialLinks,
    copyright,
    description,
    legalLinks,
    className,
  } = {
    ...defaultProps,
    ...props,
  }

  const visibleSections = (sections ?? []).slice(0, MAX_SECTIONS)
  const appearanceClasses = resolveBlockAppearanceClasses(appearance)
  const sectionClassName = cn(
    regularBlockMobilePaddingClasses[size ?? 'default'],
    appearanceClasses.className,
    className,
  )

  return (
    <section
      className={sectionClassName}
      data-footer56-background={appearance?.background ?? 'none'}
    >
      <div className={cn(regularBlockContainerClasses, 'flex')}>
        <footer className="w-full">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-6">
            <div className="col-span-2 mb-8 lg:mb-0">
              <div className="flex items-center lg:justify-start">
                <a href={logo?.url ?? '#'}>
                  <Image
                    src={logo?.src ?? ''}
                    alt={logo?.alt ?? ''}
                    title={logo?.title ?? ''}
                    width={logo?.width ?? 120}
                    height={Math.max(logo?.height ?? 28, 1)}
                    style={{
                      width: 'auto',
                      height: `${logo?.height ?? 28}px`,
                      objectFit: 'contain',
                    }}
                    className="h-auto w-auto dark:invert"
                  />
                </a>
              </div>
              {description ? (
                <p className="mt-6 max-w-sm text-sm leading-6 text-current/70">{description}</p>
              ) : null}
              {actions?.length ? (
                <ContentActions actions={actions} className="mt-6" mode="button" />
              ) : null}
              <div className="mt-6 space-y-3 text-sm text-current/70">
                <div className="flex gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-current/70" aria-hidden />
                  <div className="space-y-0.5">
                    {(addressLines ?? []).map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
                {phone ? (
                  <div className="flex items-center gap-2">
                    <Phone className="size-4 shrink-0" aria-hidden />
                    <a
                      href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                      className="font-medium hover:text-primary"
                    >
                      {phone}
                    </a>
                  </div>
                ) : null}
                {email ? (
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 shrink-0" aria-hidden />
                    <a href={`mailto:${email}`} className="font-medium hover:text-primary">
                      {email}
                    </a>
                  </div>
                ) : null}
              </div>
              <ul className="mt-6 flex flex-wrap items-center gap-4 text-sm text-current/70">
                {socialLinks?.map((social, idx) => (
                  <li key={idx} className="font-medium hover:text-primary">
                    <a href={social.href} aria-label={social.label}>
                      {social.icon}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            {visibleSections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-4 text-sm font-semibold uppercase font-mono tracking-widest">
                  {section.title}
                </h3>
                <ul className="space-y-4 text-sm text-current/70">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx} className="font-medium hover:text-primary">
                      <a href={link.href}>{link.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col justify-between gap-4 border-t border-current/15 pt-8 text-xs font-medium text-current/70 md:flex-row md:items-center">
            <p>{copyright}</p>
            <ul className="flex flex-wrap gap-4">
              {legalLinks?.map((link, linkIdx) => (
                <li key={linkIdx} className="underline hover:text-primary">
                  <a href={link.href}>{link.name}</a>
                </li>
              ))}
            </ul>
          </div>
        </footer>
      </div>
    </section>
  )
}

export { Footer56 }

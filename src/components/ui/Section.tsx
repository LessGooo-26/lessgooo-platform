import type { ReactNode } from 'react'
import { Container } from './Container'

type SectionProps = {
  children: ReactNode
  className?: string
  labelledBy?: string
  tone?: 'default' | 'subtle' | 'contrast'
}

export function Section({ children, className = '', labelledBy, tone = 'default' }: SectionProps) {
  return (
    <section
      className={`section section--${tone} ${className}`.trim()}
      aria-labelledby={labelledBy}
    >
      <Container>{children}</Container>
    </section>
  )
}


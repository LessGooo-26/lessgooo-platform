import type { ComponentProps } from 'react'
import { Link } from 'react-router-dom'

type LinkButtonProps = ComponentProps<typeof Link> & {
  variant?: 'primary' | 'secondary'
}

export function LinkButton({ className = '', variant = 'primary', ...props }: LinkButtonProps) {
  return <Link className={`button button--${variant} ${className}`.trim()} {...props} />
}


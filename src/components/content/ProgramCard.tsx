import { Link } from 'react-router-dom'

type ProgramCardProps = {
  title: string
  description: string
  linkLabel: string
  to: string
}

export function ProgramCard({ title, description, linkLabel, to }: ProgramCardProps) {
  return (
    <article className="program-card">
      <h3>{title}</h3>
      <p>{description}</p>
      <Link className="text-link" to={to}>
        {linkLabel}<span aria-hidden="true"> →</span>
      </Link>
    </article>
  )
}


import { LinkButton } from '../ui/LinkButton'

type CallToActionProps = {
  eyebrow: string
  title: string
  description: string
  action: { label: string; to: string }
}

export function CallToAction({ eyebrow, title, description, action }: CallToActionProps) {
  return (
    <div className="call-to-action">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <LinkButton to={action.to}>{action.label}</LinkButton>
    </div>
  )
}


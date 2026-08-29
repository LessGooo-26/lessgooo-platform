import { Container } from '../ui/Container'
import { LinkButton } from '../ui/LinkButton'

type HeroProps = {
  eyebrow: string
  title: string
  introduction: string
  primaryAction: { label: string; to: string }
  secondaryAction: { label: string; to: string }
}

export function Hero({ eyebrow, title, introduction, primaryAction, secondaryAction }: HeroProps) {
  return (
    <section className="hero" aria-labelledby="home-title">
      <Container>
        <div className="hero__content">
          <p className="eyebrow">{eyebrow}</p>
          <h1 id="home-title">{title}</h1>
          <p className="hero__introduction">{introduction}</p>
          <div className="button-group">
            <LinkButton to={primaryAction.to}>{primaryAction.label}</LinkButton>
            <LinkButton to={secondaryAction.to} variant="secondary">
              {secondaryAction.label}
            </LinkButton>
          </div>
        </div>
      </Container>
    </section>
  )
}


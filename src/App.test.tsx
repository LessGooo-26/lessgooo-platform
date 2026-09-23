import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from './App'
import { publicRoutes } from './routes/public-routes'

function renderApp(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App />
    </MemoryRouter>,
  )
}

describe('public website', () => {
  beforeEach(() => localStorage.removeItem('lessgooo-language'))
  it('remembers an explicit French choice across visits', async () => {
    const user = userEvent.setup()
    const first = renderApp()
    await user.click(screen.getByRole('button', { name: 'Français' }))
    first.unmount()
    renderApp()
    expect(screen.getByRole('heading', { name: 'Apprendre la technologie par la pratique.' })).toBeInTheDocument()
  })
  it('renders the semantic shell and confirmed Home content', () => {
    renderApp()
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Primary navigation' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Learn technology by doing.' })).toBeInTheDocument()
    expect(screen.getByText('For children, adults and professionals.')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('provides the complete primary navigation architecture', () => {
    renderApp()
    const navigation = screen.getByRole('navigation', { name: 'Primary navigation' })
    expect(within(navigation).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(within(navigation).getByRole('link', { name: 'About LESSGOOO' })).toHaveAttribute('href', '/about')
    expect(within(navigation).getByRole('link', { name: 'Programs' })).toHaveAttribute('href', '/programs')
    expect(within(navigation).getByRole('link', { name: 'Partners' })).toHaveAttribute('href', '/partners')
    expect(within(navigation).getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact')
  })

  it('opens and closes the accessible mobile navigation', async () => {
    const user = userEvent.setup()
    renderApp()
    const toggle = screen.getByRole('button', { name: 'Open menu' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('navigation', { name: 'Mobile navigation' })).not.toBeInTheDocument()
    await user.click(toggle)
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('navigation', { name: 'Mobile navigation' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Close menu' }))
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false')
  })

  it.each([
    ['About LESSGOOO', publicRoutes.about],
    ['Practical learning paths', publicRoutes.programs],
    ['LESSGOOO Kids', publicRoutes.kids],
    ['DevOps / Cloud / AI', publicRoutes.devopsCloudAi],
    ['Linux', publicRoutes.linux],
    ['Web Development', publicRoutes.webDevelopment],
    ['IoT / Arduino', publicRoutes.iotArduino],
    ['Modern Secretariat', publicRoutes.modernSecretariat],
    ['Languages', publicRoutes.languages],
    ['Partners', publicRoutes.partners],
    ['Contact LESSGOOO', publicRoutes.contact],
  ])('prepares the %s route', (heading, path) => {
    renderApp(path)
    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument()
  })

  it('switches the application and its institutional content to French', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(screen.getByRole('button', { name: 'Français' }))
    expect(screen.getByRole('navigation', { name: 'Navigation principale' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Apprendre la technologie par la pratique.' })).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('lang', 'fr')
  })

  it('does not fabricate controlled institutional claims on the Home page', () => {
    const { container } = renderApp()
    const publicCopy = container.textContent ?? ''
    expect(publicCopy).not.toMatch(/government approved|accredited|guaranteed employment|guaranteed certificate/i)
    expect(publicCopy).not.toMatch(/\b\d[\d,.]*\s*(FCFA|CFA)\b/i)
  })

  it('renders a 404 page for an unknown route', () => {
    renderApp('/missing')
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Return home' })).toHaveAttribute('href', '/')
  })
})

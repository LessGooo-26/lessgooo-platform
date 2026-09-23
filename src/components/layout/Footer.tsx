import { Link } from "react-router-dom";
import { useLocale } from "../../i18n/LocaleContext";
import { publicRoutes } from "../../routes/public-routes";
import { Container } from "../ui/Container";

export function Footer() {
  const { content } = useLocale();

  return (
    <footer className="site-footer">
      <Container className="site-footer__inner">
        <div>
          <Link className="site-name" to={publicRoutes.home}>
            <img
              className="site-logo"
              src={`${import.meta.env.BASE_URL}logo-lessgooo.png`}
              alt="LESSGOOO Academy"
            />
          </Link>
          <p>{content.shell.footerSummary}</p>
        </div>
        <nav aria-label={content.shell.footerNavigation}>
          <Link to={publicRoutes.programs}>{content.navigation.programs}</Link>
          <Link to={publicRoutes.about}>{content.navigation.about}</Link>
          <Link to={publicRoutes.services}>{content.navigation.services}</Link>
          <Link to={publicRoutes.faq}>{content.navigation.faq}</Link>
          <Link to={publicRoutes.contact}>{content.navigation.contact}</Link>
        </nav>
      </Container>
    </footer>
  );
}

import { Link } from "react-router-dom";
import { useLocale } from "../../i18n/LocaleContext";

export function SchoolSpotlight() {
  const { locale } = useLocale(),
    fr = locale === "fr";
  return (
    <div
      className="program-card"
      style={{ marginBottom: 28, background: "#edf5fb" }}
    >
      <p className="eyebrow">
        {fr
          ? "Élèves et familles · Cameroun"
          : "Learners and families · Cameroon"}
      </p>
      <h2>
        {fr
          ? "Le soutien scolaire, simplement."
          : "School support, made simple."}
      </h2>
      <p>
        {fr
          ? "Répétitions de la 4e à la terminale, ressources francophones et anglophones, exercices corrigés et repères pour les parents."
          : "Tutoring from 4e to terminale, Francophone and Anglophone resources, explained exercises and guidance for parents."}
      </p>
      <Link to="/school">
        {fr ? "Découvrir l'espace scolaire" : "Explore the school space"} →
      </Link>
    </div>
  );
}

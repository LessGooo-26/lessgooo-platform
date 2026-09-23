import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { useLanguage, tx, localeCode } from "./lib/language";
import {
  progress,
  type Campus,
  type Lesson,
  type Persona,
  type Submission,
} from "./lib/model";
import { homeworkItems, homeworkText } from "./lib/homework";
import "./homework.css";

type Props = {
  c: Campus;
  persona: Persona;
  openLesson: (l: Lesson) => void;
  openSubmission: (s: Submission) => void;
};
export function HomeworkBoard({
  c,
  persona,
  openLesson,
  openSubmission,
}: Props) {
  const { t, locale } = useLanguage();
  const teacher = persona === "teacher",
    parent = persona === "parent";
  const [studentId, setStudent] = useState(
    teacher ? "all" : c.students[0]?.id || "",
  );
  const [view, setView] = useState(teacher ? "waiting" : "todo");
  const [limit, setLimit] = useState(6);
  const students =
    teacher && studentId === "all"
      ? c.students
      : c.students.filter((s) => s.id === studentId);
  const items = students.flatMap((s) => homeworkItems(c, s.id));
  const groups = {
    todo: items
      .filter((i) => i.status === "missing" || i.status === "revise")
      .sort(
        (a, b) => Number(b.status === "revise") - Number(a.status === "revise"),
      ),
    waiting: items.filter((i) => i.status === "pending"),
    completed: items.filter((i) => i.status === "validated"),
  };
  const labels = {
    todo: t("To do", "À faire"),
    waiting: teacher
      ? t("To review", "À corriger")
      : t("Waiting for feedback", "En attente de retour"),
    completed: t("Completed", "Terminés"),
  };
  const visible = groups[view as keyof typeof groups];
  const chooseView = (v: string) => {
    setView(v);
    setLimit(6);
  };
  return (
    <div className="homework-board">
      <section className="homework-welcome">
        <div className="homework-welcome-icon">
          <BookOpen size={27} />
        </div>
        <div>
          <span className="eyebrow">
            {t("ONE STEP AT A TIME", "UNE ÉTAPE À LA FOIS")}
          </span>
          <h2>
            {teacher
              ? t(
                  "Help each learner move forward",
                  "Aidez chaque élève à progresser",
                )
              : parent
                ? t(
                    "Follow your child’s next step",
                    "Suivez la prochaine étape de votre enfant",
                  )
                : t(
                    "Small steps. Real progress.",
                    "De petits pas. De vrais progrès.",
                  )}
          </h2>
          <p>
            {teacher
              ? t(
                  "Open a submission, give useful feedback, then validate it or ask for a revision.",
                  "Ouvrez un devoir, donnez un retour utile, puis validez-le ou demandez une correction.",
                )
              : parent
                ? t(
                    "See the activity, check what was submitted and read the teacher’s feedback together.",
                    "Découvrez l’activité, consultez le travail remis et lisez ensemble le retour du formateur.",
                  )
                : t(
                    "Open your lesson, try the activity, then share what you made. Your teacher will guide the next step.",
                    "Ouvrez votre leçon, essayez l’activité, puis partagez votre travail. Votre formateur vous guidera pour la suite.",
                  )}
          </p>
        </div>
        <div className="homework-completion">
          <CheckCircle2 size={20} />
          <strong>
            {students.reduce(
              (sum, student) => sum + progress(c, student.id).done,
              0,
            )}{" "}
            / {items.length}
          </strong>
          <span>{t("activities validated", "activités validées")}</span>
        </div>
      </section>
      <div className="homework-controls">
        <div
          className="homework-filters"
          role="group"
          aria-label={t("Homework status", "État des devoirs")}
        >
          {Object.entries(labels).map(([key, label]) => (
            <button
              key={key}
              aria-pressed={view === key}
              onClick={() => chooseView(key)}
            >
              {label}
              <span>{groups[key as keyof typeof groups].length}</span>
            </button>
          ))}
        </div>
        {teacher && (
          <label>
            {t("Learner", "Élève")}
            <select
              value={studentId}
              onChange={(e) => {
                setStudent(e.target.value);
                setLimit(6);
              }}
            >
              <option value="all">
                {t("All learners", "Tous les élèves")}
              </option>
              {c.students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <section
        className="homework-cards"
        aria-label={labels[view as keyof typeof labels]}
      >
        {visible
          .slice(0, limit)
          .map(({ lesson, student, status, submission }) => (
            <article
              className={"homework-card " + status}
              key={student.id + ":" + lesson.id}
            >
              <div className="homework-card-top">
                <span className="homework-status">
                  {status === "validated" ? (
                    <CheckCircle2 size={16} />
                  ) : status === "pending" ? (
                    <Clock3 size={16} />
                  ) : status === "revise" ? (
                    <MessageCircle size={16} />
                  ) : (
                    <BookOpen size={16} />
                  )}
                  {status === "validated"
                    ? t("Validated", "Validé")
                    : status === "pending"
                      ? t("Submitted", "Remis")
                      : status === "revise"
                        ? t(
                            "Try again with feedback",
                            "À reprendre avec les conseils",
                          )
                        : t("Ready to start", "Prêt à commencer")}
                </span>
                {teacher && <span>{student.name}</span>}
              </div>
              <p className="homework-module">{tx(lesson.module)}</p>
              <h3>{tx(lesson.title)}</h3>
              <p className="homework-card-description">
                {status === "revise" && submission?.feedback
                  ? homeworkText(submission, "feedback", locale)
                  : status === "pending"
                    ? t(
                        "Submitted work is saved and waiting for review.",
                        "Le travail remis est enregistré et attend une correction.",
                      )
                    : status === "validated"
                      ? t(
                          "Activity completed and validated by your teacher.",
                          "Activité terminée et validée par votre formateur.",
                        )
                      : tx(lesson.task)}
              </p>
              <div className="homework-card-footer">
                <small>
                  {submission ? (
                    <time dateTime={submission.created}>
                      {new Intl.DateTimeFormat(localeCode(), {
                        dateStyle: "medium",
                      }).format(new Date(submission.created))}
                    </time>
                  ) : (
                    t("About ", "Environ ") + lesson.minutes + " min"
                  )}
                </small>
                <Button
                  variant={status === "missing" ? "default" : "outline"}
                  onClick={() =>
                    submission ? openSubmission(submission) : openLesson(lesson)
                  }
                >
                  {submission
                    ? teacher
                      ? t("Review work", "Examiner le travail")
                      : status === "pending"
                        ? t("View my work", "Voir le travail")
                        : t("Read feedback", "Lire le retour")
                    : parent || teacher
                      ? t("Open activity", "Voir l’activité")
                      : t("Start activity", "Commencer l’activité")}
                  <ArrowRight size={16} />
                </Button>
              </div>
            </article>
          ))}
      </section>
      {!visible.length && (
        <div className="homework-empty">
          <Sparkles size={30} />
          <h3>
            {view === "waiting"
              ? t(
                  "No work waiting for feedback",
                  "Aucun travail en attente de retour",
                )
              : view === "completed"
                ? t(
                    "Your progress starts with one activity",
                    "Votre progression commence par une activité",
                  )
                : t("You’re up to date", "Tout est à jour")}
          </h3>
          <p>
            {view === "completed"
              ? t(
                  "Validated activities will appear here. Start with one item in To do.",
                  "Les activités validées apparaîtront ici. Commencez par une activité dans À faire.",
                )
              : t(
                  "Choose another view to see your activities and feedback.",
                  "Choisissez une autre vue pour retrouver les activités et les retours.",
                )}
          </p>
          {view === "completed" && (
            <Button variant="outline" onClick={() => chooseView("todo")}>
              {t("See activities", "Voir les activités")}
            </Button>
          )}
        </div>
      )}
      {visible.length > limit && (
        <Button
          className="homework-more"
          variant="outline"
          onClick={() => setLimit(limit + 6)}
        >
          {t("Show more activities", "Voir plus d’activités")} (
          {visible.length - limit})
        </Button>
      )}
      <p className="homework-help">
        {t(
          "Progress increases when your teacher validates an activity. Work without a due date is never marked late.",
          "La progression augmente quand le formateur valide une activité. Un devoir sans date limite n’est jamais indiqué en retard.",
        )}
      </p>
    </div>
  );
}

export function HomeworkSummary({
  c,
  openLesson,
  go,
}: {
  c: Campus;
  openLesson: (l: Lesson) => void;
  go: () => void;
}) {
  const { t } = useLanguage();
  const [studentId, setStudent] = useState(c.students[0]?.id || "");
  const target = c.students.find((s) => s.id === studentId) || c.students[0];
  if (!target) return null;
  const items = homeworkItems(c, target.id);
  const next = items
    .filter((i) => i.status === "revise" || i.status === "missing")
    .sort(
      (a, b) => Number(b.status === "revise") - Number(a.status === "revise"),
    )
    .slice(0, 3);
  const p = progress(c, target.id);
  return (
    <section className="panel homework-overview">
      <div className="workspace-heading">
        <div>
          <span className="eyebrow">
            {t("YOUR NEXT STEP", "VOTRE PROCHAINE ÉTAPE")}
          </span>
          <h2>
            {t(
              "A little practice, every day",
              "Un peu de pratique, chaque jour",
            )}
          </h2>
        </div>
        {c.students.length > 1 && (
          <label>
            {t("Learner", "Élève")}
            <select
              value={target.id}
              onChange={(e) => setStudent(e.target.value)}
            >
              {c.students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <div className="homework-progress-line">
        <progress
          value={p.done}
          max={p.total || 1}
          aria-label={t("Validated activities", "Activités validées")}
        />
        <span>
          <b>
            {p.done} / {p.total}
          </b>{" "}
          {t("validated", "validées")}
        </span>
        <span>
          {items.filter((i) => i.status === "pending").length}{" "}
          {t("awaiting feedback", "en attente de retour")}
        </span>
      </div>
      <div className="homework-next-list">
        {next.map(({ lesson, status }) => (
          <button
            key={lesson.id}
            onClick={() => (status === "revise" ? go() : openLesson(lesson))}
          >
            <span className="homework-next-icon">
              {status === "revise" ? (
                <MessageCircle size={19} />
              ) : (
                <BookOpen size={19} />
              )}
            </span>
            <span>
              <strong>{tx(lesson.title)}</strong>
              <small>
                {status === "revise"
                  ? t(
                      "Read your teacher’s feedback",
                      "Lisez le retour de votre formateur",
                    )
                  : t("Ready when you are", "À votre rythme")}
              </small>
            </span>
            <ArrowRight size={17} />
          </button>
        ))}
      </div>
      <Button variant="outline" onClick={go}>
        {t("View all homework", "Voir tous les devoirs")}
        <ArrowRight size={16} />
      </Button>
    </section>
  );
}

export function HomeworkHistory({
  submissions,
  current,
  openSubmission,
}: {
  submissions: Submission[];
  current: Submission;
  openSubmission: (s: Submission) => void;
}) {
  const { t } = useLanguage();
  const others = submissions
    .filter(
      (s) =>
        s.student === current.student &&
        s.lesson === current.lesson &&
        s.id !== current.id,
    )
    .sort((a, b) => b.created.localeCompare(a.created));
  if (!others.length) return null;
  return (
    <details className="homework-history">
      <summary>
        {t("Other attempts", "Autres tentatives")} ({others.length})
      </summary>
      <div>
        {others.map((s) => (
          <Button key={s.id} variant="ghost" onClick={() => openSubmission(s)}>
            <time dateTime={s.created}>
              {new Intl.DateTimeFormat(localeCode(), {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(s.created))}
            </time>
            <span>
              {s.status === "pending"
                ? t("Awaiting review", "En attente de correction")
                : s.status === "revise"
                  ? t("To improve", "À retravailler")
                  : t("Validated", "Validé")}
            </span>
            <ArrowRight size={16} />
          </Button>
        ))}
      </div>
    </details>
  );
}

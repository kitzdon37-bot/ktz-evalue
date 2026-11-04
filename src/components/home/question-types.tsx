import { Brain, Code2, Globe2, ListChecks, ListOrdered, PenLine } from "lucide-react";

// Vitrine des types de questions, chacun avec une petite animation en CSS pur (globals.css).

function Card({
  icon: Icon,
  title,
  text,
  className = "",
  children,
  i,
}: {
  icon: typeof Code2;
  title: string;
  text: string;
  className?: string;
  children: React.ReactNode;
  i: number;
}) {
  return (
    <article
      data-reveal
      style={{ "--i": i } as React.CSSProperties}
      className={`group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-stone-200/80 bg-white p-6 shadow-soft transition duration-500 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift ${className}`}
    >
      <div className="glow-follow" aria-hidden="true" />
      <div className="relative flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-md shadow-brand-500/25 transition-transform duration-500 group-hover:rotate-[-6deg] group-hover:scale-110">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="text-lg font-bold text-stone-900">{title}</h3>
      </div>
      <p className="relative mt-2 text-sm leading-relaxed text-stone-600">{text}</p>
      <div className="relative mt-5 flex-1">{children}</div>
    </article>
  );
}

export function QuestionTypes() {
  return (
    <div className="grid gap-5 md:grid-cols-6">
      <Card
        i={0}
        icon={Code2}
        title="Exercices de code"
        text="Le candidat écrit sa fonction, l'exécute sur des exemples, puis des tests cachés la vérifient dans un bac à sable."
        className="md:col-span-4"
      >
        <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
          <pre className="overflow-hidden rounded-2xl bg-ink-800 p-4 font-mono text-[12px] leading-6 text-stone-200 shadow-inner">
            <span className="block text-stone-500">{"// Somme des nombres du tableau"}</span>
            <span className="type-line type-l1 block">
              <span className="text-sky-300">function</span> <span className="text-brand-300">somme</span>(tableau) {"{"}
            </span>
            <span className="type-line type-l2 block">
              {"  "}
              <span className="text-sky-300">return</span> tableau.reduce((a, b) =&gt; a + b, <span className="text-sun-300">0</span>);
            </span>
            <span className="type-line type-l3 block">{"}"}</span>
          </pre>
          <div className="space-y-2 font-mono text-[11px]">
            {[
              ["somme([1,2,3])", "6", 1],
              ["somme([])", "0", 2],
              ["test caché", "✓", 3],
              ["test caché", "✓", 4],
            ].map(([call, out, n]) => (
              <div key={`${call}${n}`} className={`test-row test-row-${n} flex items-center justify-between rounded-xl px-3 py-2`}>
                <span>
                  {call} → {out}
                </span>
                <span className="font-sans font-bold">✓</span>
              </div>
            ))}
            <p className="test-total rounded-xl bg-emerald-500 px-3 py-2 text-center font-sans text-xs font-bold text-white">4 tests sur 4 réussis</p>
          </div>
        </div>
      </Card>

      <Card i={1} icon={ListOrdered} title="Remettre dans l'ordre" text="Glisser-déposer, même au doigt sur téléphone." className="md:col-span-2">
        <div className="relative h-[132px]">
          {[
            ["Indépendance de la RCA", "ord-a"],
            ["Création de l'OUA", "ord-b"],
            ["Union africaine", "ord-c"],
          ].map(([t, cls]) => (
            <div key={t} className={`ord-item ${cls} absolute inset-x-0 flex items-center gap-2.5 rounded-xl border-2 border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-800`}>
              <span className="flex flex-col gap-[3px]" aria-hidden="true">
                <span className="h-[2px] w-3 rounded bg-stone-300" />
                <span className="h-[2px] w-3 rounded bg-stone-300" />
                <span className="h-[2px] w-3 rounded bg-stone-300" />
              </span>
              {t}
            </div>
          ))}
        </div>
      </Card>

      <Card i={0} icon={Brain} title="Raisonnement illustré" text="Suites de figures, matrices, horloges, graphiques." className="md:col-span-2">
        <div className="relative overflow-hidden rounded-2xl border border-stone-200">
          {/* eslint-disable-next-line @next/next/no-img-element -- illustration SVG locale */}
          <img src="/illustrations/suite-polygones.svg" alt="Suite de figures : triangle, carré, pentagone, puis une case à deviner" className="w-full" />
          <svg viewBox="0 0 560 160" className="reveal-answer pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
            <polygon points="522.5,80 502.5,114.6 462.5,114.6 442.5,80 462.5,45.4 502.5,45.4" fill="#fed7aa" stroke="#ea580c" strokeWidth="3" />
          </svg>
        </div>
      </Card>

      <Card i={1} icon={Globe2} title="Culture générale" text="Centrafrique, Afrique, monde et sciences." className="md:col-span-2">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- illustration SVG locale */}
          <img src="/illustrations/drapeau-rca.svg" alt="Drapeau de la République centrafricaine" className="flag-wave w-28 rounded-lg shadow-md" />
          <div className="space-y-1.5 text-sm">
            <p className="rounded-lg border border-stone-200 px-2.5 py-1 text-stone-500">Gabon</p>
            <p className="pick-good rounded-lg border-2 px-2.5 py-1 font-semibold">République centrafricaine</p>
            <p className="rounded-lg border border-stone-200 px-2.5 py-1 text-stone-500">Cameroun</p>
          </div>
        </div>
      </Card>

      <Card i={2} icon={ListChecks} title="QCM et vrai / faux" text="Corrigés à l'instant, sans IA, sur le serveur." className="md:col-span-2">
        <div className="relative space-y-2 text-sm">
          <span className="qcm-cursor absolute inset-x-0 h-9 rounded-xl border-2 border-brand-500 bg-brand-50/60" aria-hidden="true" />
          {["2 190 000 FCFA", "2 380 000 FCFA", "2 019 000 FCFA"].map((c, k) => (
            <p key={c} className="relative flex h-9 items-center gap-2 rounded-xl border border-stone-200 px-3 text-stone-700">
              <b className="text-stone-400">{String.fromCharCode(65 + k)}</b> {c}
            </p>
          ))}
        </div>
      </Card>

      <Card
        i={0}
        icon={PenLine}
        title="Réponses écrites et mises en situation"
        text="Notées avec votre grille de correction ; chaque critère est expliqué, et vous gardez le dernier mot."
        className="md:col-span-6"
      >
        <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
          <div className="rounded-2xl bg-stone-50 p-4 text-sm leading-relaxed text-stone-700">
            « Je recompte la caisse avec un témoin, je vérifie les pièces du mois. Si l&apos;écart persiste, j&apos;informe mon responsable par
            écrit et j&apos;enregistre l&apos;écart en compte d&apos;attente, puis je propose un contrôle hebdomadaire. »
          </div>
          <ul className="space-y-2 text-sm">
            {[
              ["Recompte et vérifie les pièces", "2/2"],
              ["Informe la hiérarchie", "2/2"],
              ["Enregistre l'écart sans le masquer", "2/2"],
              ["Propose une mesure", "1/2"],
            ].map(([c, p], n) => (
              <li key={c} className={`rubric-row rubric-${n + 1} flex items-center justify-between rounded-xl bg-white px-3 py-2 ring-1 ring-stone-200`}>
                <span className="flex items-center gap-2">
                  <span className={`grid h-5 w-5 place-items-center rounded-full text-[11px] font-bold text-white ${p === "2/2" ? "bg-emerald-500" : "bg-sun-400"}`}>
                    {p === "2/2" ? "✓" : "◐"}
                  </span>
                  {c}
                </span>
                <b className="tabular-nums">{p}</b>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}

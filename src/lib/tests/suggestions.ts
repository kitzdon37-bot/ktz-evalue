// Catalogue de métiers et de compétences, pour suggérer pendant la saisie :
// - l'intitulé du poste (autocomplétion) ;
// - les compétences à évaluer pour ce poste.
// Données statiques (aucun appel à l'IA, aucun coût), utilisables côté navigateur.

export type JobSuggestion = {
  title: string;
  family: string;
  /** Autres façons d'écrire le poste, pour mieux le reconnaître. */
  aliases?: string[];
  skills: string[];
};

export const JOB_SUGGESTIONS: JobSuggestion[] = [
  { title: "Comptable", family: "Finance", aliases: ["comptabilité", "aide-comptable"], skills: ["Comptabilité OHADA (SYSCOHADA)", "Fiscalité et TVA", "Rapprochement bancaire", "Paie et déclarations sociales", "Excel et logiciels comptables", "Clôture et états financiers", "Rigueur et contrôle interne"] },
  { title: "Responsable administratif et financier (RAF)", family: "Finance", aliases: ["raf", "daf", "directeur financier"], skills: ["Gestion budgétaire", "Comptabilité OHADA (SYSCOHADA)", "Procédures des bailleurs de fonds", "Contrôle interne et audit", "Trésorerie", "Encadrement d'équipe", "Reporting financier"] },
  { title: "Auditeur / Auditrice", family: "Finance", aliases: ["audit", "contrôleur interne"], skills: ["Normes d'audit", "Contrôle interne", "Analyse des risques", "Comptabilité OHADA (SYSCOHADA)", "Rédaction de rapports", "Éthique et confidentialité"] },
  { title: "Caissier / Caissière", family: "Finance", aliases: ["caisse"], skills: ["Gestion de caisse", "Calcul mental et rendu de monnaie", "Mobile Money (Orange Money, Moov)", "Accueil client", "Honnêteté et rigueur", "Clôture de caisse"] },
  { title: "Agent de crédit (microfinance)", family: "Finance", aliases: ["microfinance", "chargé de crédit"], skills: ["Analyse de dossier de crédit", "Évaluation de la capacité de remboursement", "Recouvrement", "Relation client", "Connaissance du marché local", "Mathématiques financières"] },
  { title: "Chargé(e) de clientèle (banque)", family: "Finance", aliases: ["conseiller bancaire", "chargé de clientèle"], skills: ["Produits bancaires", "Relation et conseil client", "Conformité (KYC, lutte anti-blanchiment)", "Vente et fidélisation", "Mobile Money", "Communication écrite"] },
  { title: "Assistant(e) administratif(ve)", family: "Administration", aliases: ["assistant administratif", "assistante", "agent administratif"], skills: ["Rédaction de courriers", "Classement et archivage", "Word et Excel", "Accueil et téléphone", "Organisation d'agenda", "Logistique de réunions"] },
  { title: "Secrétaire de direction", family: "Administration", aliases: ["secrétaire"], skills: ["Rédaction professionnelle", "Gestion d'agenda", "Confidentialité", "Word, Excel et e-mail", "Organisation d'événements", "Orthographe et grammaire"] },
  { title: "Réceptionniste", family: "Administration", aliases: ["accueil", "hôtesse"], skills: ["Accueil des visiteurs", "Standard téléphonique", "Gestion des réservations", "Langues (français, sango, anglais)", "Présentation et courtoisie", "Gestion des urgences"] },
  { title: "Agent de saisie", family: "Administration", aliases: ["opérateur de saisie", "saisie de données"], skills: ["Saisie rapide et précise", "Excel", "Contrôle qualité des données", "Confidentialité", "Concentration"] },
  { title: "Chargé(e) des ressources humaines", family: "Administration", aliases: ["rh", "ressources humaines", "gestionnaire rh"], skills: ["Code du travail centrafricain", "Recrutement", "Gestion de la paie", "Administration du personnel", "Gestion des conflits", "Formation des employés"] },
  { title: "Juriste", family: "Administration", aliases: ["droit", "conseiller juridique"], skills: ["Droit des affaires OHADA", "Droit du travail", "Rédaction de contrats", "Veille juridique", "Gestion des contentieux", "Analyse et argumentation"] },
  { title: "Commercial(e)", family: "Commerce", aliases: ["vendeur", "commercial", "attaché commercial", "représentant"], skills: ["Techniques de vente", "Prospection", "Négociation", "Relation client", "Connaissance du marché local", "Suivi des objectifs", "Calcul de marges et remises"] },
  { title: "Gestionnaire de stock / Magasinier", family: "Logistique", aliases: ["magasinier", "gestionnaire de stock", "stock"], skills: ["Gestion des stocks (FIFO, inventaires)", "Réception et contrôle des marchandises", "Tenue des fiches de stock", "Excel", "Sécurité de l'entrepôt", "Rigueur"] },
  { title: "Logisticien(ne)", family: "Logistique", aliases: ["logistique", "logisticien"], skills: ["Gestion des stocks et entrepôts", "Transport et convois", "Achats et appels d'offres", "Procédures des bailleurs", "Gestion de flotte", "Sécurité des opérations"] },
  { title: "Chauffeur", family: "Logistique", aliases: ["conducteur", "chauffeur"], skills: ["Code de la route", "Conduite sur pistes", "Entretien de base du véhicule", "Sécurité et règles de convoi", "Ponctualité", "Tenue du carnet de bord"] },
  { title: "Mécanicien(ne)", family: "Technique", aliases: ["mécanique", "garagiste"], skills: ["Diagnostic de pannes", "Moteurs diesel et essence", "Entretien préventif", "Électricité automobile", "Sécurité à l'atelier", "Gestion des pièces"] },
  { title: "Électricien(ne)", family: "Technique", aliases: ["électricité", "électricien bâtiment"], skills: ["Installation électrique", "Lecture de schémas", "Normes de sécurité", "Énergie solaire", "Diagnostic et dépannage", "Groupes électrogènes"] },
  { title: "Technicien(ne) télécom", family: "Technique", aliases: ["télécom", "technicien réseau"], skills: ["Réseaux mobiles (2G/3G/4G)", "Fibre et transmission", "Énergie des sites (solaire, groupes)", "Maintenance préventive", "Sécurité en hauteur", "Rapports d'intervention"] },
  { title: "Informaticien(ne)", family: "Informatique", aliases: ["informatique", "technicien informatique", "support informatique"], skills: ["Maintenance du matériel", "Réseaux et Wi-Fi", "Windows et bureautique", "Sécurité informatique", "Support aux utilisateurs", "Sauvegardes"] },
  { title: "Développeur / Développeuse web", family: "Informatique", aliases: ["développeur", "programmeur", "dev"], skills: ["HTML, CSS et JavaScript", "Bases de données SQL", "Développement back-end", "Git", "Sécurité des applications", "Résolution de problèmes"] },
  { title: "Analyste de données", family: "Informatique", aliases: ["data", "data analyst", "statisticien"], skills: ["Excel avancé", "Statistiques", "Outils de collecte (KoBo, ODK)", "Visualisation (Power BI)", "Qualité des données", "Rédaction d'analyses"] },
  { title: "Community manager", family: "Communication", aliases: ["réseaux sociaux", "community"], skills: ["Réseaux sociaux (Facebook, WhatsApp, TikTok)", "Rédaction web", "Création visuelle (Canva)", "Gestion de communauté", "Statistiques et performance", "Veille"] },
  { title: "Chargé(e) de communication", family: "Communication", aliases: ["communication", "chargé de com"], skills: ["Plan de communication", "Rédaction et relations presse", "Réseaux sociaux", "Photo et vidéo", "Organisation d'événements", "Communication de crise"] },
  { title: "Agent(e) de terrain humanitaire", family: "Humanitaire & ONG", aliases: ["humanitaire", "agent de terrain", "ong"], skills: ["Principes humanitaires et protection", "Collecte de données et suivi", "Communication communautaire", "Sécurité sur le terrain", "Distribution et ciblage", "Rapports d'activité"] },
  { title: "Chargé(e) de programme", family: "Humanitaire & ONG", aliases: ["chef de projet ong", "program officer", "coordinateur de projet"], skills: ["Gestion du cycle de projet", "Cadre logique et indicateurs", "Gestion budgétaire", "Relations avec les bailleurs", "Rédaction de rapports", "Encadrement d'équipe"] },
  { title: "Chargé(e) de suivi-évaluation (MEAL)", family: "Humanitaire & ONG", aliases: ["meal", "suivi-évaluation", "m&e"], skills: ["Indicateurs et cadre logique", "Collecte de données (KoBo, ODK)", "Analyse statistique", "Redevabilité envers les communautés", "Rédaction de rapports", "Excel avancé"] },
  { title: "Agent de protection de l'enfance", family: "Humanitaire & ONG", aliases: ["protection", "protection de l'enfance"], skills: ["Principes de protection", "Gestion de cas", "Écoute et accompagnement", "Référencement vers les services", "Confidentialité", "Sensibilisation communautaire"] },
  { title: "Infirmier / Infirmière", family: "Santé", aliases: ["infirmier", "infirmière", "soins"], skills: ["Soins infirmiers", "Prise des constantes", "Administration des médicaments", "Hygiène et prévention des infections", "Accueil et éducation des patients", "Dossiers de soins"] },
  { title: "Sage-femme", family: "Santé", aliases: ["maïeutique"], skills: ["Suivi de grossesse", "Accouchement et urgences obstétricales", "Soins du nouveau-né", "Planification familiale", "Hygiène", "Conseil aux mères"] },
  { title: "Médecin", family: "Santé", aliases: ["docteur", "médecin généraliste"], skills: ["Diagnostic clinique", "Prise en charge du paludisme et des maladies courantes", "Prescription", "Urgences", "Santé publique", "Rédaction de rapports médicaux"] },
  { title: "Pharmacien(ne)", family: "Santé", aliases: ["pharmacie"], skills: ["Dispensation des médicaments", "Gestion des stocks pharmaceutiques", "Chaîne du froid", "Conseil aux patients", "Réglementation pharmaceutique"] },
  { title: "Enseignant(e)", family: "Éducation", aliases: ["professeur", "instituteur", "formateur"], skills: ["Pédagogie et préparation de cours", "Gestion de classe", "Évaluation des élèves", "Maîtrise de la matière", "Communication avec les parents", "Inclusion"] },
  { title: "Agronome", family: "Agriculture", aliases: ["agriculture", "technicien agricole", "ingénieur agronome"], skills: ["Techniques culturales", "Sols et fertilisation", "Protection des cultures", "Encadrement des producteurs", "Suivi des rendements", "Agriculture durable"] },
  { title: "Ingénieur(e) en génie civil / BTP", family: "BTP", aliases: ["btp", "génie civil", "chef de chantier", "conducteur de travaux"], skills: ["Lecture de plans", "Métrés et devis", "Suivi de chantier", "Normes de construction", "Sécurité sur les chantiers", "Gestion des sous-traitants"] },
  { title: "Agent de sécurité", family: "Services", aliases: ["gardien", "vigile", "sécurité"], skills: ["Surveillance et rondes", "Contrôle des accès", "Gestion des incidents", "Premiers secours", "Rédaction de la main courante", "Vigilance"] },
];

/** Compétences utiles à presque tous les postes. */
export const GENERIC_SKILLS = [
  "Communication écrite",
  "Organisation et gestion du temps",
  "Travail en équipe",
  "Résolution de problèmes",
  "Bureautique (Word, Excel)",
  "Éthique et intégrité",
];

/** Met en minuscules, sans accents ni ponctuation, pour comparer des textes. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function haystack(j: JobSuggestion) {
  return normalize([j.title, ...(j.aliases ?? []), j.family].join(" "));
}

/** Métiers qui correspondent à ce qui est en train d'être tapé (les plus proches d'abord). */
export function searchJobs(query: string, limit = 8): JobSuggestion[] {
  const q = normalize(query);
  if (!q) return JOB_SUGGESTIONS.slice(0, limit);
  const words = q.split(" ").filter(Boolean);
  return JOB_SUGGESTIONS.map((j) => {
    const title = normalize(j.title);
    const all = haystack(j);
    let score = 0;
    if (title.startsWith(q)) score += 6;
    if (all.includes(q)) score += 4;
    for (const w of words) if (all.includes(w)) score += 2;
    // un mot commencé (« compt » → « comptable »)
    for (const w of words) if (all.split(" ").some((t) => t.startsWith(w))) score += 1;
    return { j, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.j);
}

/** Le métier du catalogue le plus proche d'un intitulé, s'il y en a un. */
export function bestJob(jobTitle: string): JobSuggestion | null {
  const [first] = searchJobs(jobTitle, 1);
  return first && normalize(jobTitle).length >= 3 ? first : null;
}

/**
 * Compétences proposées pour un intitulé : celles du métier le plus proche,
 * complétées par celles d'un métier voisin et par des compétences générales.
 */
export function suggestSkills(jobTitle: string, exclude: string[] = []): string[] {
  const taken = new Set(exclude.map(normalize));
  const matches = searchJobs(jobTitle, 2);
  const out: string[] = [];
  const push = (s: string) => {
    const k = normalize(s);
    if (!taken.has(k)) {
      taken.add(k);
      out.push(s);
    }
  };
  if (normalize(jobTitle).length >= 3) {
    matches[0]?.skills.forEach(push);
    matches[1]?.skills.slice(0, 3).forEach(push);
  }
  GENERIC_SKILLS.forEach(push);
  return out.slice(0, 12);
}

/** Toutes les compétences connues (catalogue + générales), sans doublon. */
export const ALL_SKILLS: string[] = (() => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of [...JOB_SUGGESTIONS.flatMap((j) => j.skills), ...GENERIC_SKILLS]) {
    const k = normalize(s);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(s);
    }
  }
  return out;
})();

/**
 * Compétences qui correspondent à ce qui est tapé (« compta » → « Comptabilité OHADA… »).
 * Sans texte, propose celles du poste. Exclut celles déjà choisies.
 */
export function searchSkills(query: string, opts: { jobTitle?: string; exclude?: string[]; limit?: number } = {}): string[] {
  const { jobTitle = "", exclude = [], limit = 8 } = opts;
  const taken = new Set(exclude.map(normalize));
  const q = normalize(query);
  if (!q) return suggestSkills(jobTitle, exclude).slice(0, limit);
  const words = q.split(" ").filter(Boolean);
  // Les compétences du poste passent en premier à score égal.
  const jobSkills = new Set((jobTitle ? searchJobs(jobTitle, 2).flatMap((j) => j.skills) : []).map(normalize));
  return ALL_SKILLS.filter((s) => !taken.has(normalize(s)))
    .map((s) => {
      const n = normalize(s);
      const tokens = n.split(" ");
      let score = 0;
      if (n.startsWith(q)) score += 6;
      // Au milieu d'un mot seulement à partir de 4 lettres (« tre » ne doit pas proposer « Entretien »).
      if (q.length >= 4 && n.includes(q)) score += 4;
      for (const w of words) if (tokens.some((t) => t.startsWith(w))) score += 2;
      if (score > 0 && jobSkills.has(n)) score += 3;
      return { s, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.s.localeCompare(b.s, "fr"))
    .slice(0, limit)
    .map((x) => x.s);
}

/** Petite description de poste prête à compléter, à partir des compétences choisies. */
export function describeJob(jobTitle: string, skills: string[]): string {
  const list = skills.map((s) => `- ${s}`).join("\n");
  return `Nous recherchons un(e) ${jobTitle} pour renforcer notre équipe.\n\nMissions principales :\n- \n- \n\nCompétences attendues :\n${list}\n\nLieu : Bangui (République centrafricaine).`;
}

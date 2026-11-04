// Modèles supplémentaires de la bibliothèque (série 4), rédigés avec Claude Code.
// Données, communication, protection, santé, agriculture et BTP. Les noms de compétences reprennent
// ceux du catalogue (src/lib/tests/suggestions.ts) pour l'assemblage automatique des tests.
import { mcq, open, short, tf } from "./templates.mjs";

export const TEMPLATES_4 = [
  {
    profession: "Analyste de données",
    title: "Analyste de données",
    level: "CONFIRMED",
    description: "Excel avancé, statistiques, collecte KoBo/ODK, Power BI, qualité des données et rédaction d'analyses.",
    skills: [
      {
        name: "Statistiques",
        weight: 35,
        questions: [
          short("Cinq ménages ont respectivement 3, 5, 6, 8 et 13 personnes. Quelle est la médiane ?", "6", "Valeurs triées : 3, 5, 6, 8, 13 ; la valeur centrale est 6.", 90),
          short("Pour les mêmes ménages (3, 5, 6, 8, 13 personnes), quelle est la moyenne ?", "7", "(3 + 5 + 6 + 8 + 13) / 5 = 35 / 5 = 7.", 90),
          mcq("Dans une enquête sur les revenus, quelques très hauts revenus tirent la moyenne vers le haut. Quel indicateur est le plus représentatif ?", ["La moyenne", "La médiane", "Le maximum", "La somme"], 1, "La médiane est peu sensible aux valeurs extrêmes."),
          tf("Une corrélation entre deux variables prouve que l'une cause l'autre.", false, "Corrélation n'est pas causalité : un troisième facteur peut expliquer les deux."),
        ],
      },
      {
        name: "Outils de collecte (KoBo, ODK)",
        weight: 30,
        questions: [
          mcq("Dans un formulaire KoBo, comment éviter qu'un enquêteur saisisse un âge de 250 ans ?", ["En ajoutant une contrainte (par exemple . >= 0 and . <= 120)", "En le demandant oralement", "En corrigeant après", "C'est impossible"], 0, "Les contraintes bloquent les valeurs impossibles dès la saisie."),
          tf("KoBo et ODK permettent de collecter des données hors connexion puis de les envoyer plus tard.", true, "C'est un avantage majeur sur le terrain sans réseau."),
          mcq("À quoi sert une question « relevant » (pertinence) dans XLSForm ?", ["À afficher une question seulement si une condition est remplie", "À traduire le formulaire", "À calculer une moyenne", "À exporter en PDF"], 0, "Elle permet les sauts logiques : par exemple, ne poser les questions sur l'école qu'aux enfants scolarisés."),
        ],
      },
      {
        name: "Qualité des données",
        weight: 35,
        questions: [
          mcq("Un enquêteur remplit 40 questionnaires d'une heure en une seule journée. Que concluez-vous ?", ["Il est très efficace", "Les données sont suspectes et doivent être vérifiées", "C'est normal", "Il faut le féliciter"], 1, "C'est matériellement impossible : on vérifie les durées et les réponses (risque de falsification)."),
          tf("Il faut conserver une copie des données brutes avant tout nettoyage.", true, "On doit pouvoir revenir aux données d'origine et tracer les corrections."),
          open("FREE_TEXT", "Le chef de projet vous demande « le chiffre » de ménages vulnérables pour un rapport demain. Rédigez en quelques lignes ce que vous lui renvoyez.", [["Donne le chiffre avec la définition utilisée", 2], ["Indique la source, la période et la taille de l'échantillon", 2], ["Signale les limites (marge d'erreur, données manquantes)", 2], ["Langage clair pour un non-spécialiste", 2]], "Sur les 1 240 ménages enquêtés à Bambari en septembre, 38 % sont vulnérables (score de consommation alimentaire « pauvre » ou « limite »). Marge d'erreur environ ± 3 points. Attention : 4 % des questionnaires ont été écartés car incomplets, et les quartiers inaccessibles n'ont pas été enquêtés."),
        ],
      },
    ],
  },
  {
    profession: "Community manager",
    title: "Community manager",
    level: "CONFIRMED",
    description: "Réseaux sociaux, rédaction web, création visuelle, gestion de communauté, statistiques et veille.",
    skills: [
      {
        name: "Réseaux sociaux (Facebook, WhatsApp, TikTok)",
        weight: 35,
        questions: [
          mcq("Pour toucher des jeunes de 18 à 25 ans avec des vidéos courtes, quel réseau privilégier ?", ["LinkedIn", "TikTok", "Un site internet", "Le courrier"], 1, "TikTok est centré sur la vidéo courte et touche un public jeune."),
          tf("Une chaîne WhatsApp permet de diffuser des messages à beaucoup d'abonnés sans révéler leurs numéros.", true, "Les abonnés ne voient pas les numéros des autres."),
          mcq("Quel format fonctionne le mieux dans une région où la connexion est lente ?", ["Vidéos longues en haute définition", "Visuels légers et textes courts", "Lives de 2 heures", "Fichiers PDF lourds"], 1, "Il faut adapter les contenus à la connexion du public."),
        ],
      },
      {
        name: "Gestion de communauté",
        weight: 35,
        questions: [
          mcq("Un client publie un commentaire négatif mais justifié sur la page de l'entreprise. Que faites-vous ?", ["Vous le supprimez", "Vous répondez rapidement, poliment, et proposez une solution en message privé", "Vous l'insultez", "Vous l'ignorez"], 1, "Une réponse rapide et constructive rassure toute la communauté."),
          tf("Il faut supprimer les messages haineux ou injurieux et, si besoin, bloquer leur auteur.", true, "La modération protège la communauté et l'image de la marque."),
          open("SCENARIO", "Une rumeur fausse sur votre entreprise circule et les commentaires négatifs se multiplient. Que faites-vous dans les 24 heures ?", [["Vérifie les faits et alerte la direction", 2], ["Publie une réponse officielle claire et factuelle", 3], ["Répond aux commentaires de façon cohérente et suit l'évolution", 2], ["Évite la polémique et les suppressions massives", 1]], "Je vérifie les faits avec la direction et on valide un message. Je publie un démenti court et factuel, avec preuves si possible, j'épingle le message, je réponds aux commentaires avec le même message, je modère les insultes, et je suis l'évolution toute la journée.", 360),
        ],
      },
      {
        name: "Statistiques et performance",
        weight: 30,
        questions: [
          short("Une publication a touché 4 000 personnes et obtenu 200 interactions. Quel est le taux d'engagement, en % ?", "5", "200 / 4 000 = 5 %.", 90),
          mcq("Quel indicateur mesure le nombre de personnes différentes ayant vu une publication ?", ["La portée", "Le nombre de partages", "Le nombre d'abonnés", "Le nombre de publications"], 0, "La portée compte les personnes uniques ; les impressions comptent les affichages."),
          tf("Un grand nombre d'abonnés garantit des ventes.", false, "L'engagement et la conversion comptent plus que le nombre d'abonnés."),
        ],
      },
    ],
  },
  {
    profession: "Chargé(e) de communication",
    title: "Chargé(e) de communication",
    level: "CONFIRMED",
    description: "Plan de communication, rédaction et relations presse, réseaux sociaux, événements et communication de crise.",
    skills: [
      {
        name: "Plan de communication",
        weight: 35,
        questions: [
          mcq("Quelle est la première étape d'un plan de communication ?", ["Choisir les couleurs du logo", "Définir les objectifs et les publics cibles", "Imprimer les affiches", "Acheter de la publicité"], 1, "Tout part des objectifs et des cibles."),
          tf("Un même message doit être adapté au canal et au public visé.", true, "On ne parle pas de la même façon à la radio communautaire et sur LinkedIn."),
          mcq("Pour toucher des populations rurales sans internet, quel canal est souvent le plus efficace ?", ["Les radios communautaires", "Une newsletter par e-mail", "LinkedIn", "Un site internet"], 0, "La radio reste le média le plus écouté en zone rurale."),
        ],
      },
      {
        name: "Rédaction et relations presse",
        weight: 35,
        questions: [
          mcq("Que doit contenir le premier paragraphe d'un communiqué de presse ?", ["L'historique de l'entreprise", "L'essentiel : qui, quoi, quand, où, pourquoi", "Les remerciements", "Les coordonnées du comptable"], 1, "Le journaliste doit comprendre l'information dès le début."),
          open("FREE_TEXT", "Rédigez le titre et le premier paragraphe d'un communiqué annonçant l'ouverture d'un centre de formation professionnelle à Berbérati.", [["Titre informatif et accrocheur", 2], ["Répond à qui, quoi, quand, où, pourquoi", 3], ["Style clair, phrases courtes, sans fautes", 3]], "Titre : Berbérati : un centre de formation pour 300 jeunes aux métiers du BTP. — Berbérati, le 4 novembre 2026. La société X ouvre lundi 10 novembre un centre de formation professionnelle dans le quartier Poto-Poto. Il formera chaque année 300 jeunes à la maçonnerie, à l'électricité et à la menuiserie, pour répondre aux besoins des chantiers de la région.", 420),
          tf("On peut envoyer un communiqué à la presse sans validation de la direction en cas d'urgence.", false, "Toute communication officielle est validée, même en urgence (procédure accélérée)."),
        ],
      },
      {
        name: "Communication de crise",
        weight: 30,
        questions: [
          mcq("Un accident grave survient sur un site de l'entreprise. Quelle attitude adopter envers les médias ?", ["Ne rien dire", "Communiquer vite, avec des faits vérifiés et de la compassion, via un porte-parole unique", "Laisser chaque employé répondre", "Nier l'accident"], 1, "Rapidité, vérité, empathie et un porte-parole unique."),
          tf("En situation de crise, il vaut mieux dire « nous ne savons pas encore, nous reviendrons vers vous » que de donner une information non vérifiée.", true, "Une information fausse aggrave la crise."),
          mcq("Que contient un « Q/R » (questions-réponses) préparé pour une crise ?", ["Les questions probables des journalistes et les réponses validées", "Les résultats financiers", "La liste des employés", "Le planning des congés"], 0, "Il permet au porte-parole de répondre de façon cohérente."),
        ],
      },
    ],
  },
  {
    profession: "Agent de protection de l'enfance",
    title: "Agent de protection de l'enfance",
    level: "CONFIRMED",
    description: "Principes de protection, gestion de cas, écoute, référencement, confidentialité et sensibilisation.",
    skills: [
      {
        name: "Principes de protection",
        weight: 35,
        questions: [
          mcq("Quel principe doit guider toute décision concernant un enfant ?", ["L'avis du chef de village", "L'intérêt supérieur de l'enfant", "Le coût de l'intervention", "La rapidité"], 1, "C'est le principe central de la Convention relative aux droits de l'enfant."),
          tf("Le principe « ne pas nuire » signifie qu'une intervention ne doit pas exposer l'enfant à un risque supplémentaire.", true, "Avant d'agir, on évalue les risques pour l'enfant."),
          mcq("Jusqu'à quel âge une personne est-elle considérée comme un enfant selon la Convention relative aux droits de l'enfant ?", ["12 ans", "15 ans", "18 ans", "21 ans"], 2, "Un enfant est tout être humain âgé de moins de 18 ans."),
        ],
      },
      {
        name: "Gestion de cas",
        weight: 35,
        questions: [
          mcq("Dans quel ordre se déroulent les étapes de la gestion de cas ?", ["Clôture, évaluation, plan", "Identification, évaluation, plan d'action, mise en œuvre, suivi, clôture", "Plan d'action, identification, clôture", "Suivi, identification, paiement"], 1, "C'est le cycle standard de la gestion de cas."),
          open("SCENARIO", "Une fille de 14 ans vous confie qu'elle va être mariée de force le mois prochain. Que faites-vous ?", [["Écoute sans juger, la rassure et ne promet pas un secret absolu", 2], ["Évalue le risque immédiat pour sa sécurité", 2], ["Informe le superviseur et ouvre un cas selon la procédure", 2], ["Réfère vers les services adaptés (juridique, psychosocial, mise en sécurité) avec son accord", 2]], "Je l'écoute calmement, je la remercie de sa confiance et je lui explique que je dois en parler à mon superviseur pour la protéger. J'évalue si elle est en danger immédiat. J'ouvre un cas, et avec elle je planifie le référencement vers les services juridiques, psychosociaux et, si besoin, un hébergement sûr.", 420),
          tf("Il faut réévaluer régulièrement la situation de l'enfant pendant le suivi du cas.", true, "La situation évolue ; le plan d'action doit être ajusté."),
        ],
      },
      {
        name: "Confidentialité",
        weight: 30,
        questions: [
          mcq("Où conservez-vous les fiches de cas papier ?", ["Sur votre bureau", "Dans une armoire fermée à clé, accessible seulement aux personnes autorisées", "Chez vous", "Au tableau d'affichage"], 1, "Les dossiers de cas sont confidentiels et sécurisés."),
          tf("On peut publier la photo d'un enfant victime sur la page Facebook de l'organisation si son visage est souriant.", false, "Publier l'image d'un enfant victime l'expose et viole la confidentialité."),
          mcq("Un voisin vous demande des nouvelles d'un enfant que vous suivez. Que répondez-vous ?", ["Vous racontez la situation", "Vous expliquez poliment que vous ne pouvez pas parler des cas suivis", "Vous donnez seulement le nom du service référé", "Vous lui montrez le dossier"], 1, "Les informations ne sont partagées qu'avec les personnes qui en ont besoin, avec consentement."),
        ],
      },
    ],
  },
  {
    profession: "Sage-femme",
    title: "Sage-femme",
    level: "CONFIRMED",
    description: "Suivi de grossesse, accouchement et urgences obstétricales, soins du nouveau-né et planification familiale.",
    skills: [
      {
        name: "Suivi de grossesse",
        weight: 30,
        questions: [
          mcq("Combien de contacts prénatals l'OMS recommande-t-elle au minimum depuis 2016 ?", ["2", "4", "8", "12"], 2, "L'OMS recommande au moins 8 contacts prénatals."),
          mcq("Une femme enceinte de 32 semaines a une tension de 160/110 mmHg, des maux de tête et des troubles visuels. Que suspectez-vous ?", ["Une grossesse normale", "Une pré-éclampsie sévère", "Un paludisme simple", "Une anémie légère"], 1, "HTA sévère et signes neurologiques : pré-éclampsie sévère, urgence."),
          tf("La supplémentation en fer et acide folique est recommandée pendant la grossesse.", true, "Elle prévient l'anémie et certaines malformations."),
        ],
      },
      {
        name: "Accouchement et urgences obstétricales",
        weight: 40,
        questions: [
          mcq("Quel médicament est recommandé en première intention pour prévenir l'hémorragie du post-partum lors de la délivrance ?", ["Le paracétamol", "L'ocytocine (10 UI en IM)", "L'amoxicilline", "Le fer"], 1, "L'ocytocine fait partie de la gestion active de la troisième phase du travail."),
          mcq("Quel médicament prévient et traite les convulsions de l'éclampsie ?", ["Le diazépam seul", "Le sulfate de magnésium", "La quinine", "L'ocytocine"], 1, "Le sulfate de magnésium est le traitement de référence."),
          tf("Le partogramme sert à surveiller l'évolution du travail et à repérer tôt un travail anormal.", true, "Il permet de décider à temps d'une référence."),
          open("SCENARIO", "Juste après la délivrance, une femme saigne abondamment et l'utérus est mou. Décrivez votre conduite immédiate.", [["Appelle à l'aide et masse l'utérus", 2], ["Administre de l'ocytocine et pose une voie veineuse avec perfusion", 2], ["Vérifie le placenta complet et les déchirures, vide la vessie", 2], ["Surveille les signes vitaux et organise la référence si le saignement persiste", 2]], "J'appelle à l'aide, je masse l'utérus, je donne de l'ocytocine, je pose deux voies veineuses et je perfuse. Je vérifie que le placenta est complet, je cherche des déchirures et je vide la vessie. Je surveille pouls et tension et, si le saignement continue, je fais une compression bimanuelle et je réfère en urgence.", 420),
        ],
      },
      {
        name: "Soins du nouveau-né",
        weight: 30,
        questions: [
          mcq("Que faites-vous en premier pour un nouveau-né qui crie bien à la naissance ?", ["Le laver immédiatement", "Le sécher, le mettre en peau à peau sur la mère et le couvrir", "Le peser avant tout", "Lui donner de l'eau sucrée"], 1, "Sécher et mettre en peau à peau prévient l'hypothermie."),
          tf("L'allaitement doit commencer dans la première heure après la naissance.", true, "La mise au sein précoce est recommandée par l'OMS."),
          mcq("Quels vaccins sont habituellement donnés à la naissance dans le PEV ?", ["Rougeole et fièvre jaune", "BCG et polio oral (VPO 0)", "Pentavalent 3", "Méningite A seule"], 1, "Le BCG et le VPO 0 sont donnés à la naissance (et l'hépatite B selon le calendrier national)."),
        ],
      },
    ],
  },
  {
    profession: "Médecin",
    title: "Médecin généraliste",
    level: "EXPERT",
    description: "Diagnostic clinique, paludisme et maladies courantes, prescription, urgences et santé publique.",
    skills: [
      {
        name: "Prise en charge du paludisme et des maladies courantes",
        weight: 40,
        questions: [
          mcq("Quel est le traitement de première intention du paludisme grave chez l'adulte et l'enfant ?", ["Les CTA par voie orale", "L'artésunate injectable", "La chloroquine", "Le paracétamol seul"], 1, "L'OMS recommande l'artésunate IV ou IM pour le paludisme grave."),
          tf("Avant de traiter un paludisme, il est recommandé de confirmer le diagnostic par TDR ou microscopie.", true, "Le test évite les traitements inutiles et les résistances."),
          mcq("Un enfant de 2 ans tousse avec une respiration rapide sans signe de danger. Selon la PCIME, quel traitement ?", ["Amoxicilline par voie orale", "Aucun traitement", "Corticoïdes", "Antipaludique uniquement"], 0, "Une pneumonie simple se traite par amoxicilline orale."),
          open("SCENARIO", "Un homme de 30 ans arrive avec une fièvre à 39,5 °C, une raideur de la nuque et une somnolence, en saison sèche. Quelle est votre conduite ?", [["Évoque la méningite (contexte épidémique) et le paludisme grave", 2], ["Prise en charge urgente : antibiothérapie probabiliste sans retarder, TDR paludisme", 3], ["Ponction lombaire si possible et sans contre-indication", 2], ["Notification aux autorités sanitaires", 1]], "Je pense d'abord à une méningite bactérienne (saison sèche, ceinture de la méningite) et au paludisme grave. Je fais un TDR, une ponction lombaire si possible, mais je ne retarde pas la ceftriaxone. J'isole le patient, je surveille la conscience et je notifie le cas au district sanitaire.", 420),
        ],
      },
      {
        name: "Prescription",
        weight: 30,
        questions: [
          tf("Les antibiotiques sont indiqués pour un simple rhume viral.", false, "Les antibiotiques n'agissent pas sur les virus ; leur usage inutile favorise les résistances."),
          short("Un enfant de 12 kg doit recevoir de l'amoxicilline à 50 mg/kg/jour en deux prises. Combien de mg par prise ?", "300", "50 × 12 = 600 mg/jour, soit 300 mg par prise.", 120),
          mcq("Que doit contenir une ordonnance ?", ["Seulement le nom du médicament", "Identité du patient, médicament, dosage, posologie, durée, date et signature", "Le prix du médicament", "Le diagnostic complet obligatoirement"], 1, "Ce sont les mentions nécessaires à une dispensation sûre."),
        ],
      },
      {
        name: "Santé publique",
        weight: 30,
        questions: [
          mcq("Vous voyez cinq cas de diarrhée aqueuse aiguë sévère chez des adultes du même quartier en deux jours. Que faites-vous ?", ["Rien de particulier", "Suspectez le choléra, notifiez immédiatement et renforcez l'hygiène", "Attendez la fin du mois pour faire un rapport", "Prescrivez des antibiotiques à tout le quartier"], 1, "Cela évoque une épidémie de choléra : notification immédiate et riposte."),
          tf("La vaccination de routine des enfants est l'une des interventions de santé publique les plus efficaces.", true, "Elle prévient de nombreuses maladies mortelles."),
          mcq("Qu'est-ce qu'une maladie à déclaration obligatoire ?", ["Une maladie que les patients doivent déclarer à leur employeur", "Une maladie que le soignant doit signaler aux autorités sanitaires", "Une maladie rare sans traitement", "Une maladie chronique"], 1, "La déclaration permet de détecter les épidémies et d'agir vite."),
        ],
      },
    ],
  },
  {
    profession: "Pharmacien(ne)",
    title: "Pharmacien(ne) — officine et dépôt",
    level: "CONFIRMED",
    description: "Dispensation, gestion des stocks pharmaceutiques, chaîne du froid, conseil et réglementation.",
    skills: [
      {
        name: "Dispensation des médicaments",
        weight: 35,
        questions: [
          mcq("Une ordonnance prescrit une dose qui vous semble 10 fois trop élevée. Que faites-vous ?", ["Vous délivrez, c'est le médecin qui décide", "Vous contactez le prescripteur avant de délivrer", "Vous divisez la dose vous-même sans rien dire", "Vous refusez sans explication"], 1, "Le pharmacien vérifie l'ordonnance et contacte le prescripteur en cas de doute."),
          tf("Les antibiotiques peuvent être vendus sans ordonnance à la demande du client.", false, "Ils sont soumis à prescription ; la vente libre favorise les résistances."),
          mcq("Une femme enceinte demande de l'ibuprofène pour des douleurs au 3e trimestre. Que lui dites-vous ?", ["C'est sans risque", "Il est contre-indiqué en fin de grossesse ; on lui conseille plutôt le paracétamol et un avis médical", "Il faut doubler la dose", "Elle peut prendre de l'aspirine à forte dose"], 1, "Les AINS sont contre-indiqués à partir du 6e mois de grossesse."),
        ],
      },
      {
        name: "Gestion des stocks pharmaceutiques",
        weight: 35,
        questions: [
          mcq("Quelle règle applique-t-on pour sortir les médicaments du stock ?", ["Dernier entré, premier sorti", "Premier expiré, premier sorti (PEPS / FEFO)", "Le plus cher d'abord", "Au hasard"], 1, "On sort d'abord les lots qui périment le plus tôt."),
          short("Une pharmacie consomme 300 boîtes de CTA par mois. Avec un stock de sécurité de 2 mois, quel est le stock de sécurité, en boîtes ?", "600", "300 × 2 = 600 boîtes.", 90),
          tf("Les médicaments périmés doivent être retirés des rayons et détruits selon une procédure tracée.", true, "Ils ne doivent jamais être vendus ni jetés n'importe où."),
        ],
      },
      {
        name: "Chaîne du froid",
        weight: 30,
        questions: [
          mcq("Entre quelles températures conserve-t-on la plupart des vaccins et l'insuline non entamée ?", ["-20 et -10 °C", "+2 et +8 °C", "+15 et +25 °C", "+25 et +30 °C"], 1, "La plupart des vaccins et l'insuline se conservent au réfrigérateur entre +2 et +8 °C."),
          tf("Il faut relever et noter la température du réfrigérateur au moins deux fois par jour.", true, "Le relevé permet de détecter rapidement une rupture de la chaîne du froid."),
          open("SCENARIO", "Le matin, vous constatez que le réfrigérateur à vaccins affiche +14 °C après une coupure de courant la nuit. Que faites-vous ?", [["Ne délivre pas les produits et les met en quarantaine au froid", 3], ["Évalue la durée de l'exposition (relevés, enregistreur, pastilles de contrôle)", 2], ["Informe le responsable et suit la procédure avant toute destruction ou remise en circulation", 2], ["Propose une mesure pour l'avenir (groupe, alarme)", 1]], "Je mets les produits en quarantaine dans un autre réfrigérateur fonctionnel, marqués « ne pas utiliser ». Je regarde l'enregistreur et les pastilles de contrôle des vaccins pour savoir combien de temps ils ont chauffé. J'informe le responsable et le programme de vaccination, qui décident de garder ou détruire. Je propose une alarme de température et un onduleur ou un réfrigérateur solaire.", 360),
        ],
      },
    ],
  },
  {
    profession: "Agronome",
    title: "Agronome — encadrement des producteurs",
    level: "CONFIRMED",
    description: "Techniques culturales, sols et fertilisation, protection des cultures, encadrement et suivi des rendements.",
    skills: [
      {
        name: "Techniques culturales",
        weight: 30,
        questions: [
          mcq("Quel est l'intérêt principal de la rotation des cultures ?", ["Planter toujours la même culture", "Préserver la fertilité du sol et limiter les maladies et ravageurs", "Augmenter le besoin en engrais", "Récolter plus tôt"], 1, "Alterner les cultures casse le cycle des ravageurs et équilibre le sol."),
          tf("Associer maïs et légumineuses (arachide, niébé) peut enrichir le sol en azote.", true, "Les légumineuses fixent l'azote de l'air grâce à leurs nodules."),
          short("Le maïs est semé à 80 cm entre les lignes et 25 cm sur la ligne, 1 graine par poquet. Combien de poquets par hectare (10 000 m²) ?", "50000", "10 000 / (0,80 × 0,25) = 50 000 poquets.", 150),
        ],
      },
      {
        name: "Sols et fertilisation",
        weight: 35,
        questions: [
          mcq("Que signifient les lettres N, P et K d'un engrais ?", ["Azote, phosphore, potassium", "Nitrate, plomb, calcium", "Nickel, potasse, carbone", "Nutriment, protéine, kaolin"], 0, "N = azote, P = phosphore, K = potassium."),
          short("Un sac de 50 kg d'engrais NPK 15-15-15 contient combien de kg d'azote (N) ?", "7.5", "15 % × 50 = 7,5 kg d'azote.", 90),
          tf("Le compost et le fumier améliorent la structure du sol et sa capacité à retenir l'eau.", true, "La matière organique améliore la fertilité durablement."),
        ],
      },
      {
        name: "Encadrement des producteurs",
        weight: 35,
        questions: [
          mcq("Quelle méthode est souvent la plus efficace pour faire adopter une nouvelle technique par des producteurs ?", ["Une note écrite envoyée par e-mail", "Une parcelle de démonstration comparant l'ancienne et la nouvelle pratique", "Une réunion en ville", "Une affiche en anglais"], 1, "Les producteurs adoptent ce qu'ils voient fonctionner sur le terrain (champ-école)."),
          tf("Il faut tenir compte du calendrier agricole et des travaux des femmes pour fixer les horaires des formations.", true, "Sinon une partie des producteurs ne peut pas participer."),
          open("SCENARIO", "Dans un groupement, les rendements de manioc ont chuté et les feuilles sont jaunes et déformées en mosaïque. Que faites-vous ?", [["Identifie la mosaïque du manioc et vérifie sur le terrain", 2], ["Recommande des boutures saines ou de variétés tolérantes et l'arrachage des plants malades", 3], ["Organise la formation des producteurs et le suivi", 2], ["Rédige un rapport ou alerte les services compétents", 1]], "Les symptômes font penser à la mosaïque du manioc, transmise par les boutures et la mouche blanche. Je visite les champs pour confirmer. Je recommande d'arracher et brûler les plants très atteints, de n'utiliser que des boutures saines ou des variétés tolérantes, et j'organise une démonstration au champ-école. J'alerte les services agricoles et je suis les parcelles.", 420),
        ],
      },
    ],
  },
  {
    profession: "Ingénieur(e) en génie civil / BTP",
    title: "Ingénieur(e) génie civil / BTP",
    level: "CONFIRMED",
    description: "Lecture de plans, métrés et devis, suivi de chantier, normes de construction et sécurité.",
    skills: [
      {
        name: "Métrés et devis",
        weight: 35,
        questions: [
          short("Une dalle mesure 6 m × 5 m sur 15 cm d'épaisseur. Quel volume de béton, en m³ ?", "4.5", "6 × 5 × 0,15 = 4,5 m³.", 120),
          short("Un béton est dosé à 350 kg de ciment par m³. Combien de sacs de 50 kg faut-il pour 4 m³ ?", "28", "350 × 4 = 1 400 kg, soit 28 sacs.", 120),
          mcq("À quoi sert un devis quantitatif et estimatif (DQE) ?", ["À présenter le plan de masse", "À chiffrer les quantités et le coût de chaque ouvrage", "À planifier les congés", "À signer la réception"], 1, "Le DQE détaille quantités, prix unitaires et montants."),
        ],
      },
      {
        name: "Suivi de chantier",
        weight: 35,
        questions: [
          mcq("Que consigne-t-on dans le journal de chantier ?", ["Les opinions personnelles", "Les travaux réalisés, les effectifs, la météo, les incidents et les instructions données", "Seulement les paiements", "Rien, il est facultatif"], 1, "Le journal de chantier est la mémoire du chantier et une preuve en cas de litige."),
          tf("Le décoffrage d'une dalle peut se faire le lendemain du coulage, quelle que soit la portée.", false, "Il faut respecter les délais de décoffrage et d'étaiement selon la portée et le béton."),
          open("SCENARIO", "Lors d'une visite, vous constatez que les armatures d'une poutre ne correspondent pas au plan (moins de barres que prévu). Le béton doit être coulé dans une heure. Que faites-vous ?", [["Arrête le coulage", 3], ["Fait corriger les armatures selon le plan et vérifie avant de couler", 2], ["Consigne l'incident par écrit et informe le maître d'ouvrage ou le bureau de contrôle", 2], ["Cherche la cause pour éviter la répétition", 1]], "J'arrête le coulage. Je montre l'écart au chef de chantier, je fais ajouter les barres manquantes conformément au plan et je vérifie avant de donner l'autorisation de couler. Je l'écris dans le journal de chantier, j'informe le bureau de contrôle et je vérifie les autres poutres ferraillées par la même équipe.", 420),
        ],
      },
      {
        name: "Sécurité sur les chantiers",
        weight: 30,
        questions: [
          mcq("Quels équipements de protection individuelle sont exigés en permanence sur un chantier ?", ["Casque et chaussures de sécurité au minimum", "Aucun", "Des lunettes de soleil", "Des sandales"], 0, "Casque et chaussures de sécurité sont le minimum ; d'autres EPI selon les tâches."),
          tf("Une tranchée profonde de plus de 1,30 m doit être blindée ou talutée pour éviter les éboulements.", true, "L'éboulement de tranchée est une cause fréquente d'accident mortel."),
          mcq("Un ouvrier travaille sur un échafaudage sans garde-corps. Que faites-vous ?", ["Rien, il est expérimenté", "Vous le faites descendre et faites installer les protections collectives", "Vous lui demandez d'aller plus vite", "Vous prenez une photo pour plus tard"], 1, "On arrête le travail dangereux et on installe des protections collectives."),
        ],
      },
    ],
  },
];

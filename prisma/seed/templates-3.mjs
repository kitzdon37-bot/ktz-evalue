// Modèles supplémentaires de la bibliothèque (série 3), rédigés avec Claude Code.
// Finance, administration, juridique et métiers techniques. Les noms de compétences reprennent
// ceux du catalogue (src/lib/tests/suggestions.ts) pour l'assemblage automatique des tests.
import { mcq, open, short, tf } from "./templates.mjs";

export const TEMPLATES_3 = [
  {
    profession: "Responsable administratif et financier (RAF)",
    title: "RAF — gestion financière et bailleurs",
    level: "EXPERT",
    description: "Budget, trésorerie, procédures des bailleurs de fonds, contrôle interne et reporting financier.",
    skills: [
      {
        name: "Gestion budgétaire",
        weight: 35,
        questions: [
          short("Un budget annuel prévoit 12 000 000 FCFA de dépenses. À fin juin, 7 800 000 FCFA ont été dépensés. Quel est le taux d'exécution budgétaire, en % ?", "65", "7 800 000 / 12 000 000 = 65 %.", 90),
          mcq("Une ligne budgétaire est dépassée de 15 % alors que le contrat du bailleur autorise 10 % de flexibilité entre lignes. Que faites-vous ?", ["Rien, l'écart est faible", "Vous demandez l'accord écrit du bailleur avant de valider la dépense", "Vous imputez l'excédent sur une autre ligne sans le dire", "Vous attendez le rapport final pour en parler"], 1, "Au-delà de la flexibilité contractuelle, l'accord préalable écrit du bailleur est nécessaire."),
          tf("Un budget de trésorerie et un budget de résultat donnent toujours les mêmes chiffres.", false, "Le budget de trésorerie suit les encaissements et décaissements ; le résultat suit les produits et charges, quelle que soit la date de paiement."),
          open("SCENARIO", "À mi-parcours d'un projet, le taux d'exécution budgétaire n'est que de 30 %. La direction vous demande quoi faire. Présentez votre démarche.", [["Analyse les causes par ligne (retards, surestimation, blocages)", 3], ["Propose un plan d'accélération ou une réallocation réaliste", 3], ["Prévoit la communication avec le bailleur (avenant, révision budgétaire)", 2]], "J'analyse ligne par ligne pourquoi on est en retard (achats bloqués, recrutements non faits, budget surestimé). Je propose avec les équipes un plan de dépenses mensuel jusqu'à la fin, et pour ce qui ne pourra pas être dépensé, je prépare une demande de révision budgétaire ou d'extension sans coût auprès du bailleur.", 420),
        ],
      },
      {
        name: "Procédures des bailleurs de fonds",
        weight: 35,
        questions: [
          mcq("Pour un achat de 15 000 000 FCFA sur un financement de bailleur, quelle procédure est généralement attendue ?", ["Achat direct auprès d'un fournisseur connu", "Mise en concurrence avec plusieurs offres et un comité d'évaluation", "Paiement en espèces pour aller plus vite", "Achat fractionné en plusieurs petites factures"], 1, "Les gros montants exigent une mise en concurrence formalisée ; fractionner pour l'éviter est interdit."),
          tf("Une dépense payée sans pièce justificative peut être déclarée éligible si le montant est faible.", false, "Toute dépense déclarée au bailleur doit être justifiée, quel que soit le montant."),
          mcq("Qu'est-ce qu'une dépense « inéligible » ?", ["Une dépense payée par virement", "Une dépense non prévue au contrat ou non conforme aux règles du bailleur", "Une dépense de moins de 100 000 FCFA", "Une dépense faite en fin de projet"], 1, "Elle n'est pas remboursée par le bailleur et reste à la charge de l'organisation."),
          short("Le bailleur finance 80 % d'un projet de 50 000 000 FCFA. Quel montant, en FCFA, l'organisation doit-elle apporter en cofinancement ?", "10000000", "20 % × 50 000 000 = 10 000 000 FCFA.", 90),
        ],
      },
      {
        name: "Contrôle interne et audit",
        weight: 30,
        questions: [
          mcq("Quel principe de contrôle interne est respecté quand la personne qui commande n'est pas celle qui paie ?", ["La séparation des tâches", "La comptabilité d'engagement", "Le principe de prudence", "La permanence des méthodes"], 0, "La séparation des tâches réduit les risques d'erreur et de fraude."),
          tf("Il est acceptable que le caissier fasse lui-même le rapprochement de sa caisse sans contrôle d'une autre personne.", false, "Le contrôle doit être fait ou vérifié par une personne indépendante."),
          open("FREE_TEXT", "L'auditeur relève que 12 paiements n'ont pas de bon de réception. Rédigez la réponse de la direction (constat, cause, mesures correctives).", [["Reconnaît le constat sans se justifier à l'excès", 2], ["Identifie une cause plausible", 2], ["Propose des mesures concrètes, un responsable et un délai", 4]], "Nous prenons acte du constat. Les réceptions étaient faites oralement par le magasin. Mesures : à partir du mois prochain, aucun paiement sans bon de réception signé ; contrôle mensuel par le RAF ; régularisation des 12 dossiers sous 30 jours. Responsable : le logisticien."),
        ],
      },
    ],
  },
  {
    profession: "Auditeur / Auditrice",
    title: "Auditeur(trice) — contrôle interne",
    level: "CONFIRMED",
    description: "Normes d'audit, analyse des risques, contrôle interne, rédaction de rapports et éthique.",
    skills: [
      {
        name: "Normes d'audit",
        weight: 30,
        questions: [
          mcq("Que signifie une « opinion avec réserve » dans un rapport d'audit ?", ["Les comptes sont parfaits", "Les comptes sont réguliers sauf sur certains points identifiés", "L'auditeur refuse de se prononcer", "Les comptes sont faux dans leur ensemble"], 1, "La réserve signale des anomalies limitées, sans remettre en cause l'ensemble."),
          tf("Un auditeur peut auditer une entreprise dans laquelle il a des intérêts financiers.", false, "Ce serait contraire à l'indépendance de l'auditeur."),
          mcq("Qu'est-ce qu'un échantillon en audit ?", ["Toutes les opérations de l'année", "Une sélection d'opérations testées pour se faire une opinion sur l'ensemble", "Les opérations choisies par le client", "Les opérations de plus d'un million"], 1, "On teste un échantillon représentatif quand il est impossible de tout vérifier."),
        ],
      },
      {
        name: "Analyse des risques",
        weight: 35,
        questions: [
          mcq("Lequel de ces signes doit alerter en priorité sur un risque de fraude ?", ["Un fournisseur avec plusieurs factures de montant juste sous le seuil d'appel d'offres", "Un paiement par virement bancaire", "Une facture avec TVA", "Un achat de fournitures de bureau"], 0, "Les factures juste sous le seuil peuvent signaler un fractionnement volontaire."),
          tf("Le risque se mesure en croisant la probabilité de survenue et l'impact.", true, "C'est la base de la cartographie des risques."),
          short("Un risque a une probabilité notée 4 sur 5 et un impact noté 3 sur 5. Quelle est sa criticité (probabilité × impact) ?", "12", "4 × 3 = 12.", 60),
          open("SCENARIO", "Vous découvrez qu'un même employé crée les fournisseurs dans le logiciel, valide les factures et prépare les paiements. Que faites-vous ?", [["Identifie le risque (absence de séparation des tâches, fournisseur fictif)", 3], ["Vérifie par des tests ciblés (fournisseurs récents, paiements)", 3], ["Recommande une séparation des tâches et un contrôle", 2]], "C'est un risque majeur de fournisseur fictif. Je teste les fournisseurs créés récemment (adresse, RCCM, compte bancaire), les paiements les plus élevés et je les rapproche des réceptions. Je recommande de séparer création des fournisseurs, validation et paiement, avec un contrôle mensuel.", 420),
        ],
      },
      {
        name: "Rédaction de rapports",
        weight: 35,
        questions: [
          mcq("Quel ordre est le plus utile pour présenter une constatation d'audit ?", ["Recommandation, puis constat", "Constat, critère, cause, conséquence, recommandation", "Conséquence uniquement", "Nom de la personne fautive, puis sanction"], 1, "Cette structure permet de comprendre et d'agir."),
          tf("Une recommandation d'audit doit être précise, réaliste et vérifiable.", true, "Une recommandation vague ne peut pas être suivie."),
          open("FREE_TEXT", "Rédigez une constatation d'audit à partir de ce fait : 8 avances de caisse de plus de 3 mois n'ont pas été justifiées.", [["Constat factuel et chiffré", 2], ["Risque ou conséquence expliqué", 2], ["Recommandation claire avec délai", 3], ["Ton neutre et professionnel", 1]], "Constat : 8 avances de caisse, pour 1 250 000 FCFA, ne sont pas justifiées depuis plus de 3 mois. Risque : dépenses non justifiées, perte de fonds. Recommandation : exiger la justification sous 15 jours, retenir sur salaire selon la procédure, et refuser toute nouvelle avance tant que la précédente n'est pas soldée."),
        ],
      },
    ],
  },
  {
    profession: "Chargé(e) de clientèle (banque)",
    title: "Chargé(e) de clientèle bancaire",
    level: "CONFIRMED",
    description: "Produits bancaires, conseil client, conformité KYC et anti-blanchiment, vente et Mobile Money.",
    skills: [
      {
        name: "Produits bancaires",
        weight: 30,
        questions: [
          mcq("Un client veut épargner et toucher des intérêts tout en gardant son argent disponible. Que lui proposez-vous ?", ["Un compte courant", "Un compte d'épargne sur livret", "Un dépôt à terme de 3 ans", "Un découvert autorisé"], 1, "Le livret rapporte des intérêts et reste disponible."),
          short("Un client place 2 000 000 FCFA sur un dépôt à terme à 4 % par an. Combien d'intérêts touche-t-il au bout d'un an, en FCFA ?", "80000", "2 000 000 × 4 % = 80 000 FCFA.", 90),
          tf("Un découvert autorisé est un crédit et génère des intérêts.", true, "Le découvert est une forme de crédit à court terme."),
        ],
      },
      {
        name: "Conformité (KYC, lutte anti-blanchiment)",
        weight: 35,
        questions: [
          mcq("Que signifie KYC ?", ["Keep Your Cash", "Know Your Customer : connaître son client", "Key Yearly Credit", "Un logiciel bancaire"], 1, "Le KYC impose de vérifier l'identité et l'activité du client."),
          mcq("Un nouveau client dépose 25 000 000 FCFA en espèces sans pouvoir expliquer l'origine des fonds. Que faites-vous ?", ["Vous acceptez, c'est un bon client", "Vous demandez des justificatifs et alertez le responsable conformité", "Vous lui conseillez de déposer en plusieurs fois", "Vous refusez sans rien noter"], 1, "L'origine des fonds doit être justifiée ; le doute se signale au responsable conformité."),
          tf("Il faut prévenir le client qu'il fait l'objet d'une déclaration de soupçon.", false, "Avertir le client est interdit : la déclaration de soupçon est confidentielle."),
          tf("La pièce d'identité du client doit être vérifiée et conservée à l'ouverture du compte.", true, "C'est une obligation de base du KYC."),
        ],
      },
      {
        name: "Relation et conseil client",
        weight: 35,
        questions: [
          mcq("Un client est furieux car un prélèvement a été fait deux fois. Quelle est la première chose à faire ?", ["Lui dire que ce n'est pas votre faute", "L'écouter, vérifier son compte et lui dire ce que vous allez faire et quand", "Lui demander de revenir demain", "Lui proposer un nouveau produit"], 1, "Écouter, vérifier, puis s'engager sur une solution et un délai."),
          open("SCENARIO", "Une commerçante du marché veut un crédit pour acheter du stock mais n'a pas de comptabilité. Comment l'accompagnez-vous ?", [["Analyse l'activité réelle (ventes, flux, Mobile Money, relevés)", 3], ["Adapte le produit et le montant à la capacité de remboursement", 3], ["Explique clairement les conditions (taux, échéances, garanties)", 2]], "J'évalue son activité à partir de ses relevés de compte et de Mobile Money, je visite son étal et j'estime ses ventes. Je lui propose un crédit de stock adapté avec des échéances calées sur ses rentrées, et je lui explique le coût total et les garanties avant toute signature.", 360),
          mcq("Quelle attitude favorise la fidélisation d'un client ?", ["Vendre le maximum de produits à chaque visite", "Le rappeler pour faire le point sur ses besoins et répondre vite à ses demandes", "Ne le contacter qu'en cas d'impayé", "Lui donner des informations différentes à chaque fois"], 1, "La fidélité vient du suivi et de la réactivité."),
        ],
      },
    ],
  },
  {
    profession: "Réceptionniste",
    title: "Réceptionniste — accueil et standard",
    level: "BEGINNER",
    description: "Accueil des visiteurs, standard téléphonique, réservations, courtoisie et gestion des urgences.",
    skills: [
      {
        name: "Accueil des visiteurs",
        weight: 35,
        questions: [
          mcq("Un visiteur arrive pendant que vous êtes au téléphone. Que faites-vous ?", ["Vous l'ignorez jusqu'à la fin de l'appel", "Vous lui faites signe de vous attendre, puis l'accueillez dès que possible", "Vous raccrochez immédiatement", "Vous lui demandez de revenir plus tard"], 1, "Un signe montre au visiteur qu'il est vu, sans abandonner l'appel."),
          tf("Il faut enregistrer les visiteurs et leur remettre un badge si l'entreprise le prévoit.", true, "C'est une règle de sécurité courante."),
          mcq("Le directeur est en réunion et un visiteur sans rendez-vous insiste pour le voir. Que faites-vous ?", ["Vous le laissez entrer", "Vous prenez ses coordonnées et l'objet de sa visite, puis transmettez au directeur", "Vous le renvoyez sèchement", "Vous dérangez la réunion"], 1, "On filtre poliment et on transmet l'information."),
        ],
      },
      {
        name: "Standard téléphonique",
        weight: 35,
        questions: [
          mcq("Quelle est la meilleure façon de répondre au téléphone ?", ["« Allô ? »", "« Société X, bonjour, [prénom] à l'appareil, que puis-je pour vous ? »", "« Oui, c'est qui ? »", "Attendre que l'appelant parle"], 1, "On annonce l'entreprise, on se présente et on propose son aide."),
          open("FREE_TEXT", "Le responsable est absent. Rédigez le message que vous lui laissez après l'appel d'un client.", [["Nom et coordonnées de l'appelant", 2], ["Date, heure et objet de l'appel", 2], ["Action attendue (rappeler, envoyer un document…)", 2]], "Mardi 10 h 15 — M. Ngaïkoua, société Bangui Matériaux (75 00 00 00) a appelé au sujet de la facture n° 245. Il souhaite être rappelé avant midi.", 240),
          tf("On peut mettre un appelant en attente plusieurs minutes sans le prévenir.", false, "On demande l'accord de l'appelant et on revient vers lui régulièrement."),
        ],
      },
      {
        name: "Gestion des urgences",
        weight: 30,
        questions: [
          mcq("Un visiteur fait un malaise dans le hall. Quelle est votre première action ?", ["Lui donner un médicament", "Alerter les secours et le référent secourisme, et rester près de lui", "Continuer votre travail", "Le faire sortir du bâtiment"], 1, "On alerte et on reste auprès de la victime sans lui donner de médicament."),
          tf("La réceptionniste doit connaître les numéros d'urgence et le plan d'évacuation.", true, "L'accueil joue souvent un rôle clé en cas d'urgence."),
          open("SCENARIO", "L'alarme incendie se déclenche. Huit visiteurs sont dans le bâtiment. Que faites-vous ?", [["Guide les visiteurs vers la sortie selon le plan d'évacuation", 3], ["Prend le registre des visiteurs pour vérifier que tous sont sortis", 3], ["Reste calme et suit les consignes du responsable sécurité", 2]], "Je prends le registre des visiteurs, je les guide calmement vers la sortie de secours la plus proche et le point de rassemblement, je fais l'appel avec le registre et je signale tout absent au responsable sécurité.", 300),
        ],
      },
    ],
  },
  {
    profession: "Agent de saisie",
    title: "Agent de saisie de données",
    level: "BEGINNER",
    description: "Saisie rapide et précise, Excel, contrôle qualité des données et confidentialité.",
    skills: [
      {
        name: "Saisie rapide et précise",
        weight: 35,
        questions: [
          mcq("Sur une fiche papier, le numéro de téléphone est illisible. Que faites-vous ?", ["Vous inventez un numéro proche", "Vous laissez le champ vide et signalez la fiche", "Vous saisissez 00000000", "Vous jetez la fiche"], 1, "On ne devine jamais : on signale pour correction."),
          short("Vous saisissez 60 fiches par heure. Combien de fiches saisissez-vous en 7 heures de travail ?", "420", "60 × 7 = 420 fiches.", 60),
          tf("Pour une date, il faut toujours respecter le format demandé (par exemple JJ/MM/AAAA).", true, "Un format homogène évite les erreurs de calcul et de tri."),
        ],
      },
      {
        name: "Excel",
        weight: 35,
        questions: [
          mcq("Quelle formule calcule la somme des cellules A2 à A50 ?", ["=TOTAL(A2-A50)", "=SOMME(A2:A50)", "=A2+A50", "=ADD(A2;A50)"], 1, "SOMME additionne une plage de cellules."),
          mcq("Quelle fonction compte le nombre de cellules contenant « Bangui » dans la colonne B ?", ["=NB.SI(B:B;\"Bangui\")", "=SOMME(B:B)", "=MOYENNE(B:B)", "=NBVAL(\"Bangui\")"], 0, "NB.SI compte les cellules qui répondent à un critère."),
          tf("Le filtre automatique supprime définitivement les lignes masquées.", false, "Le filtre masque les lignes sans les supprimer."),
        ],
      },
      {
        name: "Contrôle qualité des données",
        weight: 30,
        questions: [
          mcq("Dans une liste de bénéficiaires, le même nom apparaît deux fois avec le même numéro d'identité. Que faites-vous ?", ["Vous gardez les deux lignes", "Vous signalez le doublon au superviseur avant de supprimer", "Vous supprimez au hasard une ligne", "Vous changez le numéro d'une ligne"], 1, "Un doublon se vérifie et se signale ; il peut cacher une erreur ou une fraude."),
          tf("Un âge de 150 ans dans une base de données doit être vérifié.", true, "C'est une valeur aberrante, probablement une erreur de saisie."),
          open("FREE_TEXT", "Citez trois contrôles simples que vous faites avant de rendre un fichier saisi.", [["Contrôle des champs obligatoires vides", 2], ["Contrôle des doublons", 2], ["Contrôle des valeurs aberrantes ou des formats", 2]], "1) Je filtre chaque colonne obligatoire pour trouver les cellules vides. 2) Je recherche les doublons sur l'identifiant. 3) Je trie les colonnes chiffrées pour repérer les valeurs impossibles (âge, montants) et je vérifie les formats de date.", 240),
        ],
      },
    ],
  },
  {
    profession: "Juriste",
    title: "Juriste — droit des affaires et du travail",
    level: "CONFIRMED",
    description: "Droit OHADA, droit du travail, rédaction de contrats, contentieux et argumentation.",
    skills: [
      {
        name: "Droit des affaires OHADA",
        weight: 35,
        questions: [
          mcq("Combien d'États sont aujourd'hui membres de l'OHADA ?", ["8", "14", "17", "25"], 2, "L'OHADA compte 17 États membres, dont la République centrafricaine."),
          mcq("Quelle juridiction est compétente en dernier ressort pour l'application des Actes uniformes OHADA ?", ["La Cour suprême de chaque pays", "La Cour commune de justice et d'arbitrage (CCJA) d'Abidjan", "La Cour internationale de justice", "Le tribunal de commerce de Bangui"], 1, "La CCJA, installée à Abidjan, assure l'interprétation uniforme du droit OHADA."),
          tf("Une SARL peut, selon l'Acte uniforme OHADA, être créée par un seul associé.", true, "La SARL unipersonnelle est prévue par l'Acte uniforme sur les sociétés commerciales."),
          mcq("Où une société commerciale doit-elle être immatriculée ?", ["Au Registre du commerce et du crédit mobilier (RCCM)", "À la mairie", "Au ministère du Travail", "À la banque"], 0, "L'immatriculation au RCCM donne la personnalité juridique à la société."),
        ],
      },
      {
        name: "Rédaction de contrats",
        weight: 35,
        questions: [
          mcq("Quelle clause prévoit ce qui se passe si une partie ne respecte pas ses obligations ?", ["La clause de confidentialité", "La clause résolutoire ou de pénalités", "La clause d'objet", "Le préambule"], 1, "La clause résolutoire et les pénalités sanctionnent l'inexécution."),
          tf("Une clause de force majeure peut libérer une partie de ses obligations en cas d'événement imprévisible et irrésistible.", true, "C'est la définition classique de la force majeure."),
          open("FREE_TEXT", "Rédigez une clause de règlement des litiges pour un contrat entre une entreprise centrafricaine et un fournisseur camerounais.", [["Prévoit d'abord une tentative de règlement amiable avec un délai", 2], ["Désigne clairement le mode de règlement (arbitrage CCJA ou tribunal compétent)", 3], ["Précise le droit applicable et la langue", 2], ["Rédaction claire et sans ambiguïté", 1]], "Tout différend sera d'abord soumis à une tentative de règlement amiable pendant 30 jours à compter de sa notification écrite. À défaut, il sera tranché définitivement par arbitrage selon le Règlement d'arbitrage de la CCJA. Le contrat est régi par le droit OHADA et, à titre complémentaire, par le droit centrafricain. La langue de la procédure est le français.", 420),
        ],
      },
      {
        name: "Droit du travail",
        weight: 30,
        questions: [
          tf("Un employeur peut licencier un salarié sans motif, à condition de lui payer son salaire du mois.", false, "Le licenciement doit reposer sur un motif légitime et respecter la procédure (préavis, indemnités)."),
          mcq("Quel document doit prouver la relation de travail et ses conditions ?", ["Le contrat de travail écrit", "Une simple poignée de main", "La facture", "Le relevé bancaire"], 0, "Le contrat écrit précise poste, salaire, durée et conditions."),
          open("SCENARIO", "Un salarié a des absences répétées sans justification. Le directeur veut le licencier demain. Que lui conseillez-vous ?", [["Rassembler les preuves des absences", 2], ["Respecter la procédure disciplinaire (demande d'explication, sanctions graduées)", 3], ["Respecter le préavis, les indemnités et informer si nécessaire l'inspection du travail", 3]], "Je conseille de ne pas agir dans la précipitation : rassembler les preuves des absences, envoyer une demande d'explication écrite, puis appliquer des sanctions graduées. Si les absences continuent, engager la procédure de licenciement en respectant le préavis, les indemnités prévues et les règles de l'inspection du travail.", 420),
        ],
      },
    ],
  },
  {
    profession: "Mécanicien(ne)",
    title: "Mécanicien(ne) automobile",
    level: "CONFIRMED",
    description: "Diagnostic de pannes, moteurs diesel et essence, entretien préventif, électricité et sécurité à l'atelier.",
    skills: [
      {
        name: "Diagnostic de pannes",
        weight: 35,
        questions: [
          mcq("Un moteur diesel dégage une épaisse fumée noire à l'accélération. Quelle cause est la plus probable ?", ["Excès de carburant ou manque d'air (filtre à air colmaté, injecteurs)", "Batterie déchargée", "Pneus sous-gonflés", "Liquide de frein bas"], 0, "La fumée noire indique une combustion incomplète : trop de gazole ou pas assez d'air."),
          mcq("Le démarreur ne fait qu'un « clic » et le moteur ne tourne pas. Que vérifiez-vous d'abord ?", ["La pression des pneus", "La charge de la batterie et les cosses", "Le niveau d'huile de boîte", "Les plaquettes de frein"], 1, "Un simple clic vient le plus souvent d'une batterie faible ou de cosses oxydées."),
          tf("Une fumée blanche abondante et une baisse du niveau de liquide de refroidissement peuvent indiquer un joint de culasse défectueux.", true, "Le liquide de refroidissement brûlé dans les cylindres produit cette fumée blanche."),
          open("SCENARIO", "Un pick-up de mission chauffe en montée et le voyant de température s'allume. Décrivez votre diagnostic.", [["Contrôle moteur froid du niveau de liquide et recherche de fuites", 2], ["Vérifie radiateur, ventilateur, courroie, thermostat et pompe à eau", 3], ["Donne des consignes de sécurité (ne pas ouvrir le bouchon à chaud)", 2], ["Raisonne par ordre de probabilité", 1]], "J'attends que le moteur refroidisse avant d'ouvrir le bouchon. Je contrôle le niveau et les fuites (durites, radiateur). Je vérifie que le radiateur n'est pas bouché par la poussière, que le ventilateur et la courroie fonctionnent, puis le thermostat et la pompe à eau. Si le liquide disparaît sans fuite visible, je soupçonne le joint de culasse.", 420),
        ],
      },
      {
        name: "Entretien préventif",
        weight: 35,
        questions: [
          mcq("Sur les pistes poussiéreuses, que faut-il faire plus souvent ?", ["Changer les essuie-glaces", "Nettoyer ou remplacer le filtre à air", "Changer les ampoules", "Refaire la peinture"], 1, "La poussière colmate le filtre à air et use le moteur."),
          short("Une vidange est prévue tous les 5 000 km. La dernière a été faite à 132 000 km. À quel kilométrage faut-il faire la prochaine ?", "137000", "132 000 + 5 000 = 137 000 km.", 60),
          tf("On peut mélanger n'importe quelle huile moteur sans tenir compte des préconisations du constructeur.", false, "Il faut respecter la viscosité et la norme indiquées par le constructeur."),
        ],
      },
      {
        name: "Sécurité à l'atelier",
        weight: 30,
        questions: [
          mcq("Avant de travailler sous un véhicule levé, que devez-vous faire ?", ["Le laisser uniquement sur le cric", "Le poser sur des chandelles adaptées, sur un sol stable", "Demander à un collègue de le tenir", "Mettre le moteur en marche"], 1, "Un cric seul peut céder : on utilise toujours des chandelles."),
          tf("Les huiles usagées peuvent être versées dans le caniveau.", false, "Elles polluent : on les stocke dans des fûts pour recyclage ou élimination."),
          mcq("Quelle précaution avant d'intervenir sur le circuit électrique ?", ["Débrancher la borne négative de la batterie", "Laisser le contact mis", "Mouiller les câbles", "Retirer le fusible principal en roulant"], 0, "Débrancher la borne négative évite les courts-circuits."),
        ],
      },
    ],
  },
  {
    profession: "Électricien(ne)",
    title: "Électricien(ne) bâtiment et solaire",
    level: "CONFIRMED",
    description: "Installation électrique, lecture de schémas, sécurité, énergie solaire, dépannage et groupes électrogènes.",
    skills: [
      {
        name: "Installation électrique",
        weight: 30,
        questions: [
          short("Un appareil consomme 2 200 W sous 220 V. Quelle intensité, en ampères, absorbe-t-il ?", "10", "I = P / U = 2 200 / 220 = 10 A.", 90),
          mcq("Quel est le rôle d'un disjoncteur différentiel 30 mA ?", ["Protéger les personnes contre les électrocutions", "Augmenter la tension", "Économiser l'énergie", "Protéger contre la foudre uniquement"], 0, "Il coupe le courant en cas de fuite vers la terre, ce qui protège les personnes."),
          mcq("Quelle est la couleur normalisée du conducteur de protection (terre) ?", ["Bleu", "Rouge", "Vert et jaune", "Noir"], 2, "Le vert-jaune est réservé à la terre ; le bleu au neutre."),
          tf("Une prise de courant sans raccordement à la terre est sans danger pour un appareil à carcasse métallique.", false, "Sans terre, une fuite peut mettre la carcasse sous tension."),
        ],
      },
      {
        name: "Énergie solaire",
        weight: 35,
        questions: [
          mcq("Dans une installation solaire autonome, quel appareil gère la charge des batteries ?", ["L'onduleur", "Le régulateur de charge", "Le disjoncteur", "Le compteur"], 1, "Le régulateur protège les batteries contre la surcharge et la décharge profonde."),
          short("Un local consomme 1 200 Wh par jour. Avec 5 heures d'ensoleillement utile, quelle puissance minimale de panneaux faut-il, en watts (sans pertes) ?", "240", "1 200 / 5 = 240 W ; en pratique on ajoute une marge pour les pertes.", 120),
          mcq("Quel est le rôle de l'onduleur ?", ["Transformer le courant continu des batteries en courant alternatif 220 V", "Stocker l'énergie", "Orienter les panneaux", "Mesurer l'ensoleillement"], 0, "L'onduleur alimente les appareils en 220 V alternatif."),
          tf("Il vaut mieux orienter les panneaux vers le sud dans l'hémisphère nord, avec une faible inclinaison près de l'équateur.", true, "À Bangui (environ 4° N), une orientation sud et une inclinaison d'environ 10 à 15° permettent aussi l'auto-nettoyage par la pluie."),
        ],
      },
      {
        name: "Diagnostic et dépannage",
        weight: 35,
        questions: [
          mcq("Le différentiel saute dès qu'on branche une machine à laver. Que suspectez-vous ?", ["Un défaut d'isolement (fuite à la terre) dans la machine", "Une tension trop faible", "Une ampoule grillée", "Un compteur trop petit"], 0, "Le différentiel détecte une fuite de courant, souvent due à l'appareil."),
          tf("On peut vérifier l'absence de tension avec un tournevis testeur seulement.", false, "On utilise un vérificateur d'absence de tension (VAT) adapté, conformément aux règles de sécurité."),
          open("SCENARIO", "Le client signale que la moitié des prises d'une maison ne fonctionnent plus. Décrivez votre démarche de dépannage, en sécurité.", [["Contrôle le tableau (disjoncteurs, différentiel) et identifie le circuit", 3], ["Consigne le circuit et vérifie l'absence de tension avant d'intervenir", 3], ["Recherche le défaut (connexion desserrée, câble endommagé) et teste après réparation", 2]], "Je regarde au tableau quel disjoncteur a déclenché et quel circuit est concerné. Je le consigne et vérifie l'absence de tension au VAT. Je contrôle les connexions de la première prise du circuit et les boîtes de dérivation, je recherche un câble abîmé, je répare, puis je remets sous tension et teste chaque prise.", 420),
        ],
      },
    ],
  },
  {
    profession: "Technicien(ne) télécom",
    title: "Technicien(ne) télécom — sites et réseaux",
    level: "CONFIRMED",
    description: "Réseaux mobiles, transmission, énergie des sites, maintenance préventive et sécurité en hauteur.",
    skills: [
      {
        name: "Réseaux mobiles (2G/3G/4G)",
        weight: 35,
        questions: [
          mcq("Comment s'appelle l'équipement radio d'un site 4G ?", ["BTS", "NodeB", "eNodeB", "Routeur Wi-Fi"], 2, "En 4G (LTE), la station de base s'appelle eNodeB ; BTS en 2G, NodeB en 3G."),
          tf("La 4G offre en général des débits de données plus élevés que la 2G.", true, "La 2G est surtout adaptée à la voix et aux SMS."),
          mcq("Un site est « down » et toutes les cellules sont hors service. Que vérifiez-vous en premier ?", ["Le paramétrage des antennes", "L'alimentation électrique du site", "La couleur du pylône", "Le nombre d'abonnés"], 1, "Une panne totale vient souvent de l'énergie (secteur, batteries, groupe)."),
        ],
      },
      {
        name: "Énergie des sites (solaire, groupes)",
        weight: 35,
        questions: [
          mcq("Les équipements télécom sont souvent alimentés en courant continu. Quelle tension est la plus courante ?", ["12 V", "-48 V", "220 V", "380 V"], 1, "La tension de -48 V continu est la norme dans les sites télécom."),
          short("Un site consomme 1 500 W. Un banc de batteries stocke 9 kWh utilisables. Combien d'heures d'autonomie, environ ?", "6", "9 000 Wh / 1 500 W = 6 heures.", 120),
          tf("La température élevée réduit la durée de vie des batteries.", true, "La chaleur accélère le vieillissement des batteries, d'où l'importance de la climatisation."),
        ],
      },
      {
        name: "Sécurité en hauteur",
        weight: 30,
        questions: [
          mcq("Quel équipement est obligatoire pour monter sur un pylône ?", ["Un casque audio", "Un harnais antichute avec double longe et un casque", "Des gants de cuisine", "Une simple corde"], 1, "Le harnais avec double longe permet d'être toujours attaché."),
          tf("On peut monter seul sur un pylône si l'intervention est courte.", false, "Le travail en hauteur se fait à deux, avec une personne au sol capable d'alerter."),
          open("SCENARIO", "Vous arrivez sur un site pour changer une antenne, le ciel se couvre et l'orage approche. Que faites-vous ?", [["Ne monte pas ou redescend immédiatement (risque de foudre)", 3], ["Informe le centre de supervision et reporte l'intervention", 2], ["Rédige ou met à jour le rapport d'intervention", 1]], "Je ne monte pas : un pylône attire la foudre. J'informe le NOC, je sécurise le matériel et j'attends la fin de l'orage. Si le délai est trop long, je reporte l'intervention et je le note dans le rapport.", 300),
        ],
      },
    ],
  },
  {
    profession: "Développeur / Développeuse web",
    title: "Développeur(se) web",
    level: "CONFIRMED",
    description: "HTML, CSS et JavaScript, SQL, back-end, Git, sécurité des applications et résolution de problèmes.",
    skills: [
      {
        name: "HTML, CSS et JavaScript",
        weight: 30,
        questions: [
          mcq("Que renvoie l'expression JavaScript [1, 2, 3].map((x) => x * 2) ?", ["[1, 2, 3]", "[2, 4, 6]", "12", "undefined"], 1, "map applique la fonction à chaque élément et renvoie un nouveau tableau."),
          mcq("Quelle propriété CSS permet d'aligner facilement des éléments sur une ligne et de les répartir ?", ["display: flex", "position: absolute", "float: none", "z-index"], 0, "Flexbox sert à aligner et répartir des éléments."),
          tf("En JavaScript, 0 == \"0\" vaut true mais 0 === \"0\" vaut false.", true, "== convertit les types, === les compare sans conversion."),
        ],
      },
      {
        name: "Bases de données SQL",
        weight: 35,
        questions: [
          mcq("Quelle requête liste les candidats dont le score est supérieur à 70 ?", ["SELECT * FROM candidats WHERE score > 70;", "GET candidats IF score > 70;", "SELECT candidats > 70;", "FIND score > 70 IN candidats;"], 0, "WHERE filtre les lignes selon une condition."),
          mcq("Quelle clause regroupe des lignes pour calculer un total par ville ?", ["ORDER BY", "GROUP BY", "LIMIT", "DISTINCT"], 1, "GROUP BY permet d'agréger (COUNT, SUM…) par groupe."),
          tf("Une clé étrangère permet de relier une table à une autre.", true, "Elle référence la clé primaire d'une autre table."),
        ],
      },
      {
        name: "Sécurité des applications",
        weight: 35,
        questions: [
          mcq("Comment se protéger contre l'injection SQL ?", ["En concaténant les saisies de l'utilisateur dans la requête", "En utilisant des requêtes paramétrées", "En cachant le nom des tables", "En utilisant uniquement le HTTPS"], 1, "Les requêtes paramétrées séparent le code SQL des données saisies."),
          tf("Les mots de passe doivent être stockés hachés avec un algorithme adapté (bcrypt, argon2), jamais en clair.", true, "Même en cas de fuite, les mots de passe ne sont pas directement lisibles."),
          mcq("Où ranger une clé d'API secrète dans un projet ?", ["Dans le code source sur GitHub", "Dans une variable d'environnement non versionnée", "Dans le code JavaScript envoyé au navigateur", "Dans le README"], 1, "Les secrets ne doivent jamais être commités ni exposés au navigateur."),
          open("SCENARIO", "Un utilisateur signale qu'en modifiant le numéro dans l'adresse /factures/124 en /factures/125, il voit la facture d'une autre entreprise. Que faites-vous ?", [["Identifie la faille (contrôle d'accès manquant, IDOR)", 2], ["Corrige en vérifiant côté serveur que la ressource appartient à l'utilisateur", 3], ["Vérifie les autres routes similaires, ajoute un test et évalue la fuite", 3]], "C'est une faille de contrôle d'accès (IDOR). Je corrige tout de suite côté serveur : chaque requête vérifie que la facture appartient à l'entreprise de l'utilisateur connecté. Je contrôle toutes les routes du même type, j'ajoute des tests automatiques et je regarde dans les journaux si la faille a été exploitée pour informer les personnes concernées.", 420),
        ],
      },
    ],
  },
];

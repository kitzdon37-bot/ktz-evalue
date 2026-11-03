// Modèles supplémentaires de la bibliothèque (série 2), rédigés avec Claude Code.
// Les noms de compétences reprennent ceux du catalogue de suggestions (src/lib/tests/suggestions.ts)
// pour que l'assemblage automatique d'un test à partir des compétences choisies les retrouve.
import { mcq, open, short, tf } from "./templates.mjs";

export const TEMPLATES_2 = [
  {
    profession: "Infirmier / Infirmière",
    title: "Infirmier(ère) — soins courants",
    level: "CONFIRMED",
    description: "Soins infirmiers, administration des médicaments, hygiène et prise en charge des pathologies courantes en RCA.",
    skills: [
      {
        name: "Soins infirmiers",
        weight: 35,
        questions: [
          mcq("Un adulte a une température axillaire de 38,6 °C. Comment qualifiez-vous cette mesure ?", ["Température normale", "Hypothermie", "Fièvre", "Mesure impossible"], 2, "Au-delà de 38 °C, on parle de fièvre."),
          mcq("Quel est le traitement de première intention d'un paludisme simple confirmé chez l'adulte ?", ["Une combinaison thérapeutique à base d'artémisinine (CTA)", "La chloroquine seule", "Un antibiotique à large spectre", "Du paracétamol seul"], 0, "Les CTA sont le traitement recommandé du paludisme simple."),
          tf("Avant de poser une perfusion, il faut vérifier l'identité du patient et la prescription.", true, "C'est la base de la sécurité des soins."),
          open("SCENARIO", "Un enfant de 3 ans arrive avec une diarrhée depuis deux jours, il est très fatigué et boit avidement. Que faites-vous ?", [["Évalue les signes de déshydratation", 2], ["Met en place la réhydratation orale (SRO) et le zinc selon le protocole", 3], ["Recherche les signes de danger et réfère si besoin", 2], ["Conseille la mère (allaitement, hygiène, signes d'alerte)", 1]], "J'évalue la déshydratation (yeux enfoncés, pli cutané, état de conscience). L'enfant boit avidement : déshydratation modérée, je donne des SRO selon le plan B et du zinc. Je surveille, je réfère s'il y a un signe de danger, et j'explique à la mère comment continuer à la maison.", 360),
        ],
      },
      {
        name: "Administration des médicaments",
        weight: 35,
        questions: [
          short("Le paracétamol est prescrit à 15 mg/kg par prise. Combien de milligrammes donnez-vous à un enfant de 20 kg ?", "300", "15 × 20 = 300 mg.", 90),
          mcq("Que signifie la règle des « 5 B » ?", ["Le bon patient, le bon médicament, la bonne dose, la bonne voie, le bon moment", "Bien laver, bien sécher, bien piquer, bien jeter, bien noter", "Les cinq médicaments essentiels", "Les cinq étapes de la toilette"], 0, "C'est la règle de sécurité de l'administration des médicaments."),
          tf("Un médicament périmé peut être donné s'il n'y a plus d'autre stock.", false, "Un médicament périmé ne doit jamais être administré."),
          short("Une perfusion de 1 000 mL doit passer en 8 heures. Quel est le débit, en mL par heure ?", "125", "1 000 / 8 = 125 mL/h.", 90),
          mcq("Après une injection, le patient a des démangeaisons, un gonflement du visage et respire mal. De quoi faut-il suspecter ?", ["Une simple fatigue", "Une réaction allergique grave (choc anaphylactique)", "Une crise de paludisme", "Une déshydratation"], 1, "Ce sont les signes d'une réaction allergique grave : urgence vitale."),
        ],
      },
      {
        name: "Hygiène et prévention des infections",
        weight: 30,
        questions: [
          mcq("Où jetez-vous une aiguille usagée ?", ["Dans la poubelle du service", "Dans une boîte de sécurité pour objets piquants", "Dans un sachet plastique", "Vous la recapuchonnez avant de la jeter"], 1, "Les objets piquants vont directement dans la boîte de sécurité, sans recapuchonner."),
          tf("Le port de gants dispense de l'hygiène des mains.", false, "On se lave ou se frictionne les mains avant et après le port de gants."),
          mcq("Combien de « moments » compte l'hygiène des mains recommandée par l'OMS ?", ["2", "3", "5", "10"], 2, "L'OMS définit 5 moments pour l'hygiène des mains."),
        ],
      },
    ],
  },
  {
    profession: "Enseignant(e)",
    title: "Enseignant(e) — primaire et secondaire",
    level: "CONFIRMED",
    description: "Préparation de cours, gestion de classe, évaluation des élèves et relation avec les parents.",
    skills: [
      {
        name: "Pédagogie et préparation de cours",
        weight: 35,
        questions: [
          mcq("Quel est l'élément indispensable d'une fiche de préparation de cours ?", ["La liste des élèves", "L'objectif d'apprentissage de la séance", "La date de la prochaine réunion", "Le règlement intérieur"], 1, "Tout part de l'objectif : ce que l'élève saura faire à la fin."),
          short("Un élève a résolu les trois quarts des 32 exercices donnés. Combien d'exercices a-t-il résolus ?", "24", "32 × 3/4 = 24.", 90),
          open("FREE_TEXT", "Expliquez comment vous feriez comprendre la notion de fraction à des élèves de CM1, avec un exemple concret.", [["Part d'une situation concrète et familière", 3], ["Explication juste de la notion (partage en parts égales)", 3], ["Fait manipuler ou participer les élèves", 2]], "Je partage un pain ou une mangue en 4 parts égales devant la classe : chaque part est un quart. Je fais ensuite plier des feuilles en 2, en 4, et je demande aux élèves de colorier 3 parts sur 4 pour écrire 3/4."),
        ],
      },
      {
        name: "Gestion de classe",
        weight: 35,
        questions: [
          mcq("Deux élèves se disputent violemment pendant le cours. Quelle est votre première réaction ?", ["Les ignorer pour ne pas perdre de temps", "Les séparer calmement et rétablir la sécurité", "Punir toute la classe", "Quitter la salle"], 1, "La sécurité d'abord, puis on traite le conflit à froid."),
          tf("Des règles de classe établies avec les élèves sont généralement mieux respectées.", true, "Les élèves respectent mieux des règles qu'ils comprennent et ont aidé à définir."),
          open("SCENARIO", "Dans une classe de 80 élèves, une partie ne suit plus après 20 minutes de cours. Que faites-vous concrètement ?", [["Varie les activités (questions, travail en groupe, au tableau)", 3], ["Implique les élèves en difficulté", 2], ["Garde un climat calme et bienveillant", 2], ["Vérifie la compréhension avant de continuer", 1]], "Je coupe le cours magistral par une activité courte : questions rapides, exercice en binôme, passage au tableau. Je circule dans les rangs, j'interroge les élèves du fond et je vérifie avec 2 ou 3 questions que la notion est comprise avant d'avancer.", 360),
        ],
      },
      {
        name: "Évaluation des élèves",
        weight: 30,
        questions: [
          mcq("À quoi sert principalement une évaluation formative ?", ["À classer les élèves", "À repérer les difficultés pour adapter l'enseignement", "À décider du passage en classe supérieure", "À occuper les élèves"], 1, "L'évaluation formative aide à apprendre, elle ne sanctionne pas."),
          short("Un élève obtient 12, 15 et 9 sur 20 à trois devoirs de même coefficient. Quelle est sa moyenne sur 20 ?", "12", "(12 + 15 + 9) / 3 = 12.", 90),
          tf("Il est utile d'expliquer à l'élève ses erreurs, pas seulement de lui donner sa note.", true, "Le retour sur les erreurs permet de progresser."),
          mcq("Un élève n'obtient jamais la moyenne en lecture. Quelle est la meilleure démarche ?", ["Le faire redoubler sans rien changer", "Repérer précisément ses difficultés et lui proposer des exercices adaptés", "Le placer au fond de la classe", "Ne plus l'interroger"], 1, "On diagnostique la difficulté pour y répondre de façon ciblée."),
          mcq("Comment informer utilement les parents des progrès de leur enfant ?", ["Uniquement à la fin de l'année", "Par des échanges réguliers, en donnant des exemples concrets et des conseils", "Seulement en cas de problème", "Par l'intermédiaire des autres élèves"], 1, "Des échanges réguliers et concrets impliquent les parents."),
          tf("Pour un même exercice, tous les élèves doivent être évalués avec les mêmes critères.", true, "Des critères communs rendent l'évaluation équitable."),
        ],
      },
    ],
  },
  {
    profession: "Chargé(e) de programme",
    title: "Chargé(e) de programme — ONG",
    level: "EXPERT",
    description: "Cycle de projet, cadre logique, suivi budgétaire et relations avec les bailleurs de fonds.",
    skills: [
      {
        name: "Gestion du cycle de projet",
        weight: 35,
        questions: [
          mcq("Dans un cadre logique, quel niveau décrit le changement à long terme auquel le projet contribue ?", ["Les activités", "Les produits (outputs)", "L'objectif global (impact)", "Les intrants"], 2, "L'objectif global est l'impact à long terme."),
          mcq("Lequel est un indicateur SMART ?", ["Améliorer la santé des enfants", "Former beaucoup d'agents", "% d'enfants de 0 à 5 ans vaccinés contre la rougeole dans la zone X d'ici décembre", "Sensibiliser la population"], 2, "Il est spécifique, mesurable, limité dans le temps et dans l'espace."),
          tf("Une hypothèse (risque) du cadre logique est un facteur extérieur dont dépend la réussite du projet.", true, "Les hypothèses sont hors du contrôle direct du projet."),
          mcq("Dans quel ordre se déroule le cycle de projet ?", ["Mise en œuvre, identification, évaluation, formulation", "Identification, formulation, mise en œuvre et suivi, évaluation", "Évaluation, formulation, identification, clôture", "Formulation, évaluation, identification, mise en œuvre"], 1, "On identifie le besoin, on formule le projet, on le met en œuvre et on le suit, puis on l'évalue."),
          mcq("À quoi sert une évaluation à mi-parcours ?", ["À clôturer le projet", "À vérifier l'avancement et corriger la stratégie si nécessaire", "À recruter le personnel", "À remplacer les rapports au bailleur"], 1, "Elle permet d'ajuster le projet pendant qu'il est encore temps."),
        ],
      },
      {
        name: "Gestion budgétaire",
        weight: 35,
        questions: [
          short("Une ligne budgétaire de 12 000 000 FCFA a consommé 9 000 000 FCFA. Quel est le taux d'exécution, en % ?", "75", "9 / 12 = 75 %.", 90),
          mcq("À mi-parcours, une ligne est sous-consommée de 40 %. Quelle est la bonne démarche ?", ["Dépenser vite le reste avant la fin", "Analyser les causes et proposer au bailleur une réallocation si nécessaire", "Transférer l'argent sans rien dire", "Ne rien faire"], 1, "Les réallocations se font dans les règles et avec l'accord du bailleur."),
          tf("Une dépense sans pièce justificative peut être déclarée au bailleur si elle est petite.", false, "Toute dépense déclarée doit être justifiée."),
          short("Le budget total d'un projet est de 80 000 000 FCFA et les coûts administratifs autorisés sont de 7 %. Quel est le montant maximal des coûts administratifs, en FCFA ?", "5600000", "80 000 000 × 7 % = 5 600 000 FCFA.", 120),
          mcq("Qui doit approuver une dépense importante sur un projet ?", ["La personne qui achète, seule", "Les personnes désignées selon le circuit d'approbation prévu", "N'importe quel membre de l'équipe", "Le fournisseur"], 1, "La séparation des tâches et le circuit d'approbation protègent les fonds."),
        ],
      },
      {
        name: "Relations avec les bailleurs",
        weight: 30,
        questions: [
          mcq("Le rapport intermédiaire doit être remis au bailleur dans 5 jours mais des données manquent. Que faites-vous ?", ["Vous inventez des chiffres plausibles", "Vous prévenez le bailleur, remettez le rapport avec les données disponibles et indiquez quand le reste arrivera", "Vous ne rendez rien", "Vous attendez la fin du projet"], 1, "La transparence préserve la confiance du bailleur."),
          open("FREE_TEXT", "Rédigez le paragraphe de synthèse d'un rapport au bailleur pour un trimestre où une activité clé a pris du retard à cause de l'insécurité.", [["Présente les résultats atteints de façon factuelle", 2], ["Explique le retard et sa cause sans détour", 2], ["Propose des mesures correctives et un nouveau calendrier", 3], ["Ton professionnel et concis", 1]], "Au cours du trimestre, 3 des 4 distributions prévues ont été réalisées (1 850 ménages servis sur 2 400). La distribution de Kaga-Bandoro a été reportée en raison de l'insécurité sur l'axe. En accord avec les autorités locales, nous proposons de la réaliser le mois prochain par voie aérienne pour une partie des intrants ; le calendrier révisé est joint en annexe.", 420),
        ],
      },
    ],
  },
  {
    profession: "Chargé(e) de suivi-évaluation (MEAL)",
    title: "Chargé(e) de suivi-évaluation (MEAL)",
    level: "CONFIRMED",
    description: "Indicateurs, collecte de données (KoBo, ODK), analyse et redevabilité envers les communautés.",
    skills: [
      {
        name: "Indicateurs et cadre logique",
        weight: 30,
        questions: [
          mcq("Lequel est un indicateur de résultat (et non d'activité) ?", ["Nombre de formations organisées", "Nombre de kits distribués", "% de ménages qui utilisent correctement les moustiquaires reçues", "Nombre de réunions tenues"], 2, "Il mesure un changement de pratique, pas une activité réalisée."),
          tf("La valeur de référence (baseline) d'un indicateur se mesure au début du projet.", true, "Elle sert de point de comparaison."),
          short("1 250 ménages sont ciblés et 1 000 ont été servis. Quel est le taux de couverture, en % ?", "80", "1 000 / 1 250 = 80 %.", 90),
        ],
      },
      {
        name: "Collecte de données (KoBo, ODK)",
        weight: 35,
        questions: [
          mcq("Comment limiter les erreurs de saisie dans un formulaire KoBo ?", ["En laissant toutes les questions en texte libre", "En ajoutant des contraintes et des choix fermés", "En supprimant les questions obligatoires", "En collectant sur papier puis en recopiant"], 1, "Les contraintes et les listes de choix évitent beaucoup d'erreurs."),
          tf("On peut collecter le nom et le téléphone de bénéficiaires sans leur consentement si c'est pour le projet.", false, "Le consentement éclairé est obligatoire et les données personnelles doivent être protégées."),
          open("SCENARIO", "Les données d'un enquêteur montrent des entretiens de 3 minutes alors que le questionnaire en prend 25. Que faites-vous ?", [["Analyse les données suspectes (durées, GPS, réponses identiques)", 2], ["Échange avec l'enquêteur de façon factuelle", 2], ["Vérifie sur le terrain (rappels, contre-visites)", 2], ["Corrige la procédure (supervision, formation, exclusion des données invalides)", 2]], "Je compare les durées, les coordonnées GPS et les réponses : beaucoup sont identiques. J'en parle à l'enquêteur, je fais rappeler un échantillon de ménages, j'exclus les entretiens non valides et je renforce la supervision avec des contrôles ponctuels quotidiens.", 360),
        ],
      },
      {
        name: "Redevabilité envers les communautés",
        weight: 35,
        questions: [
          mcq("Quel est le rôle d'un mécanisme de plaintes et de retours ?", ["Punir les bénéficiaires mécontents", "Permettre aux communautés de signaler des problèmes et d'obtenir une réponse", "Remplacer le suivi des indicateurs", "Collecter des fonds"], 1, "Il permet d'écouter, de répondre et d'améliorer l'aide."),
          mcq("Une plainte signale un abus commis par un membre du personnel. Que faites-vous ?", ["Vous la classez sans suite", "Vous la traitez de façon confidentielle et la transmettez immédiatement au point focal désigné", "Vous en parlez à toute l'équipe", "Vous confrontez publiquement la personne"], 1, "Les plaintes sensibles suivent une procédure confidentielle et rapide."),
          tf("Il faut informer les communautés de la suite donnée à leurs retours.", true, "Boucler la boucle est essentiel à la confiance."),
          mcq("Quel canal de retour est le plus accessible pour des personnes qui ne savent pas lire ?", ["Un formulaire en ligne", "Une boîte à suggestions écrite", "Une ligne téléphonique gratuite et des points d'écoute avec des agents", "Un e-mail"], 2, "Les canaux oraux et de proximité sont accessibles à tous."),
          open("FREE_TEXT", "Expliquez en quelques lignes comment vous présenteriez les résultats d'une enquête de satisfaction à la communauté.", [["Messages simples et compréhensibles par tous", 2], ["Choix d'un format adapté (réunion, radio communautaire, langue locale)", 2], ["Présente aussi ce qui va changer suite aux retours", 3], ["Laisse la place aux questions de la communauté", 1]], "J'organise une réunion avec les leaders et la population, en sango. Je présente 3 ou 4 chiffres clés avec des images simples, j'explique ce que le projet va changer (horaires de distribution, nouveaux sites) et je laisse du temps pour les questions."),
        ],
      },
    ],
  },
  {
    profession: "Agent de crédit (microfinance)",
    title: "Agent(e) de crédit — microfinance",
    level: "CONFIRMED",
    description: "Analyse de dossiers de crédit, capacité de remboursement, recouvrement et relation client.",
    skills: [
      {
        name: "Analyse de dossier de crédit",
        weight: 35,
        questions: [
          mcq("Quel élément est le plus important pour accorder un crédit à une commerçante ?", ["Sa tenue vestimentaire", "Sa capacité de remboursement prouvée par son activité", "Le montant qu'elle demande", "Son quartier"], 1, "On prête sur la capacité de remboursement."),
          tf("Visiter l'activité du client fait partie d'une bonne analyse de crédit.", true, "La visite permet de vérifier les informations déclarées."),
          open("SCENARIO", "Un client demande 1 500 000 FCFA pour agrandir sa boutique mais ne tient aucun cahier de comptes. Comment menez-vous l'analyse ?", [["Reconstitue les revenus et charges (visite, stock, ventes journalières)", 3], ["Évalue la capacité de remboursement et les garanties", 2], ["Propose un montant adapté, éventuellement progressif", 2], ["Conseille le client sur la tenue de comptes", 1]], "Je visite la boutique, j'estime les ventes journalières, le stock et les charges, je recoupe avec les relevés Mobile Money. Si la marge permet de rembourser 1 500 000, je valide ; sinon je propose un premier crédit plus petit et je l'aide à tenir un cahier de recettes et dépenses.", 360),
        ],
      },
      {
        name: "Évaluation de la capacité de remboursement",
        weight: 35,
        questions: [
          short("Crédit de 500 000 FCFA à un taux de 2 % par mois (intérêts fixes) sur 6 mois. Quel est le montant total des intérêts, en FCFA ?", "60000", "500 000 × 2 % × 6 = 60 000 FCFA.", 120),
          short("Un client dégage un bénéfice mensuel de 300 000 FCFA. Si l'échéance ne doit pas dépasser le tiers de ce bénéfice, quelle est l'échéance maximale, en FCFA ?", "100000", "300 000 / 3 = 100 000 FCFA.", 90),
          tf("Un client qui a déjà trois crédits en cours dans d'autres institutions présente un risque plus élevé.", true, "Le surendettement augmente le risque de défaut."),
          short("Un crédit de 1 200 000 FCFA (intérêts compris) est remboursé en 12 mensualités égales. Quel est le montant d'une mensualité, en FCFA ?", "100000", "1 200 000 / 12 = 100 000 FCFA.", 90),
          mcq("Pourquoi demander une caution ou une garantie ?", ["Pour enrichir l'institution", "Pour réduire la perte en cas de non-remboursement", "Parce que c'est obligatoire pour tous les crédits", "Pour décourager les clients"], 1, "La garantie limite le risque, elle ne remplace pas l'analyse de la capacité de remboursement."),
        ],
      },
      {
        name: "Recouvrement",
        weight: 30,
        questions: [
          mcq("Que mesure le « portefeuille à risque » (PAR 30) ?", ["Le total des crédits accordés", "La part de l'encours dont une échéance a plus de 30 jours de retard", "Les intérêts encaissés en 30 jours", "Le nombre de nouveaux clients"], 1, "C'est l'indicateur clé de la qualité du portefeuille."),
          mcq("Un client a 10 jours de retard. Quelle est la bonne première action ?", ["Saisir immédiatement ses biens", "Le contacter rapidement pour comprendre la cause et convenir d'une solution", "Attendre 3 mois", "Prévenir publiquement son entourage"], 1, "Un suivi rapide et respectueux limite les impayés."),
          short("Encours total : 40 000 000 FCFA. Encours des crédits ayant plus de 30 jours de retard : 2 000 000 FCFA. Quel est le PAR 30, en % ?", "5", "2 000 000 / 40 000 000 = 5 %.", 120),
          tf("Menacer un client ou l'humilier devant ses voisins est une méthode de recouvrement acceptable.", false, "Le recouvrement doit rester respectueux et légal."),
        ],
      },
    ],
  },
  {
    profession: "Caissier / Caissière",
    title: "Caissier(ère)",
    level: "BEGINNER",
    description: "Gestion de caisse, rendu de monnaie, Mobile Money, accueil client et honnêteté.",
    skills: [
      {
        name: "Gestion de caisse",
        weight: 40,
        questions: [
          short("Un client paie 7 350 FCFA avec un billet de 10 000 FCFA. Combien lui rendez-vous, en FCFA ?", "2650", "10 000 − 7 350 = 2 650 FCFA.", 60),
          short("Fond de caisse : 50 000 FCFA. Ventes en espèces de la journée : 185 500 FCFA. Combien doit-il y avoir dans la caisse à la fermeture, en FCFA ?", "235500", "50 000 + 185 500 = 235 500 FCFA.", 90),
          mcq("À la clôture, il manque 2 000 FCFA dans la caisse. Que faites-vous ?", ["Vous complétez avec votre argent sans rien dire", "Vous recomptez, vérifiez les tickets et signalez l'écart à votre responsable", "Vous modifiez le total des ventes", "Vous ignorez l'écart, il est petit"], 1, "Tout écart se vérifie et se signale, même petit."),
          short("Un client achète 3 articles à 1 250 FCFA chacun et 1 article à 2 500 FCFA. Quel est le total à payer, en FCFA ?", "6250", "3 × 1 250 + 2 500 = 6 250 FCFA.", 90),
          short("Vous avez en caisse 12 billets de 5 000 FCFA, 25 billets de 1 000 FCFA et 40 pièces de 100 FCFA. Quel est le total, en FCFA ?", "89000", "60 000 + 25 000 + 4 000 = 89 000 FCFA.", 120),
          tf("Il faut vérifier les gros billets pour repérer les faux.", true, "Vérifier les billets protège la caisse."),
        ],
      },
      {
        name: "Mobile Money (Orange Money, Moov)",
        weight: 30,
        questions: [
          mcq("Un client dit avoir payé par Mobile Money mais vous ne voyez pas le message de confirmation. Que faites-vous ?", ["Vous lui donnez la marchandise", "Vous vérifiez la réception sur le téléphone ou le compte du magasin avant de valider", "Vous lui demandez de payer en espèces en plus", "Vous refusez de le servir"], 1, "On ne valide qu'après avoir vérifié la réception du paiement."),
          tf("On peut communiquer le code secret du compte Mobile Money du magasin à un collègue pour aller plus vite.", false, "Un code secret ne se partage jamais."),
          mcq("Un inconnu vous appelle en se disant « du service Mobile Money » et vous demande votre code pour « débloquer » le compte. Que faites-vous ?", ["Vous lui donnez le code", "Vous refusez, raccrochez et prévenez votre responsable : c'est une arnaque", "Vous lui donnez seulement une partie du code", "Vous lui envoyez un transfert de test"], 1, "Aucun opérateur ne demande jamais le code secret."),
        ],
      },
      {
        name: "Accueil client",
        weight: 30,
        questions: [
          mcq("Un client s'énerve parce que la file est longue. Comment réagissez-vous ?", ["Vous lui répondez sur le même ton", "Vous restez calme, vous vous excusez de l'attente et le servez dès que possible", "Vous l'ignorez", "Vous le faites passer devant tout le monde"], 1, "Calme et courtoisie désamorcent la plupart des tensions."),
          open("SCENARIO", "Vous remarquez qu'un collègue garde parfois de la monnaie des clients pour lui. Que faites-vous ?", [["Ne participe pas et ne couvre pas la faute", 2], ["Signale les faits à la hiérarchie de façon factuelle", 3], ["Reste respectueux, sans accusation publique", 2]], "Je ne participe pas et je ne le couvre pas. Je note ce que j'ai vu (dates, montants) et j'en parle discrètement à mon responsable, qui décidera de la suite.", 240),
        ],
      },
    ],
  },
  {
    profession: "Secrétaire de direction",
    title: "Secrétaire de direction",
    level: "CONFIRMED",
    description: "Rédaction professionnelle, gestion d'agenda, confidentialité et organisation d'événements.",
    skills: [
      {
        name: "Rédaction professionnelle",
        weight: 35,
        questions: [
          mcq("Quelle phrase est correctement écrite ?", ["Les documents que vous m'avez envoyé sont arrivés.", "Les documents que vous m'avez envoyés sont arrivés.", "Les documents que vous m'avez envoyées sont arrivés.", "Les documents que vous m'avez envoyer sont arrivés."], 1, "Accord avec le COD placé avant : « les documents » → envoyés."),
          mcq("Quel est l'objet le plus clair pour un e-mail ?", ["Important", "Réunion", "Réunion du comité de direction — jeudi 15 mai, 9 h, salle B", "Bonjour"], 2, "Un bon objet résume l'essentiel."),
          open("FREE_TEXT", "Rédigez une note interne annonçant la fermeture exceptionnelle des bureaux le vendredi 20 juin pour inventaire.", [["Informations essentielles (date, motif, qui est concerné)", 3], ["Consignes pratiques (urgences, réouverture)", 2], ["Ton et forme d'une note interne", 2], ["Orthographe correcte", 1]], "Note à l'attention de l'ensemble du personnel. Objet : fermeture exceptionnelle le vendredi 20 juin. Les bureaux seront fermés le vendredi 20 juin pour l'inventaire annuel. Les urgences pourront être adressées au 72 00 00 00. Réouverture le lundi 23 juin à 7 h 30. La Direction."),
        ],
      },
      {
        name: "Gestion d'agenda",
        weight: 35,
        questions: [
          mcq("Deux rendez-vous importants du directeur se chevauchent. Que faites-vous ?", ["Vous annulez celui que vous préférez", "Vous informez le directeur et lui proposez des solutions de report", "Vous laissez les deux personnes venir", "Vous ne faites rien"], 1, "On informe et on propose ; le directeur décide."),
          short("Un vol part à 10 h 05 et il faut arriver 2 h 30 avant. Le trajet jusqu'à l'aéroport dure 45 minutes. À quelle heure le chauffeur doit-il partir ? (format HH:MM)", "06:50", "10 h 05 − 2 h 30 = 7 h 35 ; 7 h 35 − 45 min = 6 h 50.", 120),
          tf("Il est utile de prévoir un temps de battement entre deux rendez-vous.", true, "Cela absorbe les retards et laisse le temps de préparer."),
        ],
      },
      {
        name: "Confidentialité",
        weight: 30,
        questions: [
          mcq("Un employé vous demande le montant du salaire d'un collègue. Que répondez-vous ?", ["Vous lui donnez le montant", "Vous refusez poliment : ces informations sont confidentielles", "Vous lui donnez une estimation", "Vous lui dites de regarder dans le classeur"], 1, "Les informations sur la paie sont confidentielles."),
          tf("Laisser un document confidentiel sur l'imprimante partagée ne pose pas de problème si on revient vite.", false, "Un document confidentiel se récupère immédiatement."),
          mcq("Que faites-vous des brouillons de documents confidentiels ?", ["Vous les jetez à la poubelle", "Vous les détruisez (broyeur ou déchirés finement)", "Vous les réutilisez comme papier brouillon", "Vous les donnez aux visiteurs"], 1, "Les brouillons confidentiels se détruisent."),
          mcq("Un journaliste appelle pour obtenir des informations sur un litige de l'entreprise. Que faites-vous ?", ["Vous lui racontez ce que vous savez", "Vous prenez ses coordonnées et transmettez la demande à la direction ou au service communication", "Vous lui raccrochez au nez", "Vous lui envoyez les documents du dossier"], 1, "Seules les personnes autorisées s'expriment au nom de l'entreprise."),
          tf("Verrouiller son ordinateur quand on quitte son bureau est une bonne pratique.", true, "Cela empêche l'accès aux documents en votre absence."),
          open("SCENARIO", "Le directeur vous demande d'organiser en une semaine une réunion avec 3 partenaires venant de l'extérieur de Bangui. Comment vous y prenez-vous ?", [["Fixe la date avec les participants et réserve la salle", 2], ["Organise la logistique (transport, hébergement, restauration, matériel)", 2], ["Prépare et envoie l'ordre du jour et les documents", 2], ["Prévoit le compte rendu et le suivi", 2]], "Je propose deux dates aux partenaires et je confirme la plus pratique, je réserve la salle et le vidéoprojecteur, je vérifie les vols ou le transport et l'hôtel, j'envoie l'ordre du jour trois jours avant, et je prépare la liste de présence et le modèle de compte rendu.", 360),
        ],
      },
    ],
  },
  {
    profession: "Chargé(e) des ressources humaines",
    title: "Chargé(e) des ressources humaines",
    level: "CONFIRMED",
    description: "Recrutement, administration du personnel, paie et gestion des conflits.",
    skills: [
      {
        name: "Recrutement",
        weight: 35,
        questions: [
          mcq("Quelle question est à éviter en entretien d'embauche ?", ["Parlez-moi de votre dernière expérience.", "Êtes-vous enceinte ou prévoyez-vous de l'être ?", "Comment avez-vous géré une situation difficile ?", "Pourquoi ce poste vous intéresse-t-il ?"], 1, "Les questions sur la grossesse ou la vie privée sont discriminatoires."),
          tf("Évaluer tous les candidats avec la même grille rend le recrutement plus juste.", true, "Une grille commune limite les biais."),
          open("SCENARIO", "Le directeur veut recruter son neveu sans processus pour un poste de comptable. Comment réagissez-vous ?", [["Rappelle la procédure de recrutement et ses raisons", 2], ["Propose que le neveu postule comme les autres candidats", 3], ["Reste respectueux et diplomate", 2], ["Documente la décision finale", 1]], "Je rappelle au directeur que la procédure protège l'entreprise et la réputation de son neveu. Je propose qu'il passe le même test et le même entretien que les autres candidats, avec un jury élargi. Je garde une trace écrite de la décision.", 360),
        ],
      },
      {
        name: "Administration du personnel",
        weight: 35,
        questions: [
          mcq("Que doit contenir au minimum un contrat de travail ?", ["Le poste, la date d'embauche, le salaire et la durée du travail", "Uniquement la signature de l'employé", "Le numéro de téléphone du directeur", "La liste des collègues"], 0, "Ce sont les mentions essentielles d'un contrat de travail."),
          tf("La période d'essai permet à l'employeur comme au salarié de mettre fin au contrat plus facilement.", true, "Elle sert à vérifier que le poste convient aux deux parties."),
          short("Un salarié gagne un salaire brut de 400 000 FCFA. Les retenues salariales s'élèvent à 12 %. Quel est son salaire net avant impôt, en FCFA ?", "352000", "400 000 × (1 − 0,12) = 352 000 FCFA.", 120),
          mcq("Où conserve-t-on les documents d'un salarié (contrat, diplômes, évaluations) ?", ["Dans un dossier individuel du personnel, rangé en lieu sûr", "Sur le bureau du directeur", "Dans un tiroir ouvert à tous", "On ne les conserve pas"], 0, "Le dossier du personnel est individuel et protégé."),
        ],
      },
      {
        name: "Gestion des conflits",
        weight: 30,
        questions: [
          mcq("Deux chefs d'équipe sont en conflit ouvert. Quelle est la meilleure première démarche ?", ["Sanctionner les deux", "Les écouter séparément, puis organiser un échange encadré", "Muter l'un d'eux immédiatement", "Laisser le conflit se régler seul"], 1, "On écoute chacun, puis on cherche une solution ensemble."),
          tf("Un avertissement disciplinaire doit être notifié par écrit au salarié.", true, "L'écrit protège les deux parties et permet de prouver la procédure."),
          mcq("Un salarié se plaint de harcèlement de la part de son chef. Que faites-vous ?", ["Vous lui conseillez de changer de service", "Vous prenez la plainte au sérieux, l'enregistrez et ouvrez une enquête confidentielle selon la procédure", "Vous en parlez au chef pour qu'il s'excuse", "Vous attendez une deuxième plainte"], 1, "Toute plainte de harcèlement se traite rapidement, de façon confidentielle et équitable."),
          open("FREE_TEXT", "Expliquez à un nouveau salarié, en quelques lignes, ce qu'il doit faire s'il est malade et ne peut pas venir travailler.", [["Prévenir l'employeur le plus tôt possible", 2], ["Fournir un justificatif (certificat médical) dans le délai prévu", 2], ["Indiquer à qui s'adresser", 2], ["Message clair et bienveillant", 2]], "Si vous êtes malade, prévenez votre responsable dès que possible, par téléphone ou WhatsApp, avant l'heure de début. Faites-vous consulter et transmettez le certificat médical aux ressources humaines dans les 48 heures. En cas de doute, appelez-moi au service RH."),
        ],
      },
    ],
  },
  {
    profession: "Gestionnaire de stock / Magasinier",
    title: "Gestionnaire de stock / Magasinier",
    level: "BEGINNER",
    description: "Gestion des stocks, réception des marchandises, fiches de stock et sécurité de l'entrepôt.",
    skills: [
      {
        name: "Gestion des stocks (FIFO, inventaires)",
        weight: 40,
        questions: [
          mcq("Que signifie la méthode FIFO ?", ["Le dernier entré est le premier sorti", "Le premier entré est le premier sorti", "On sort les articles les plus chers d'abord", "On sort au hasard"], 1, "FIFO : First In, First Out — premier entré, premier sorti."),
          short("Stock de départ : 120 sacs. Entrées : 80 sacs. Sorties : 150 sacs. Quel est le stock final ?", "50", "120 + 80 − 150 = 50 sacs.", 90),
          short("Consommation : 10 cartons par jour. Délai de livraison : 7 jours. Stock de sécurité : 20 cartons. À partir de combien de cartons faut-il recommander ?", "90", "10 × 7 + 20 = 90 cartons.", 120),
        ],
      },
      {
        name: "Réception et contrôle des marchandises",
        weight: 30,
        questions: [
          mcq("À la livraison, 3 cartons sur 50 sont abîmés. Que faites-vous ?", ["Vous signez le bon sans rien noter", "Vous notez les réserves sur le bon de livraison avant de signer", "Vous refusez toute la livraison", "Vous jetez les cartons abîmés"], 1, "Les réserves écrites permettent de réclamer auprès du fournisseur."),
          tf("Il faut comparer la livraison avec le bon de commande.", true, "On vérifie quantités, références et état."),
          mcq("Des médicaments ou aliments arrivent avec une date de péremption très proche. Que faites-vous ?", ["Vous les rangez au fond du magasin", "Vous le signalez avant d'accepter et, si acceptés, vous les placez pour qu'ils sortent en premier", "Vous les jetez immédiatement", "Vous effacez la date"], 1, "On signale, puis on applique la règle : premier périmé, premier sorti."),
          mcq("Où ranger les produits lourds dans un magasin ?", ["Sur les étagères du haut", "En bas, près du sol", "Dans le couloir", "N'importe où"], 1, "Les charges lourdes en bas limitent les risques d'accident."),
        ],
      },
      {
        name: "Tenue des fiches de stock",
        weight: 30,
        questions: [
          mcq("Quand faut-il mettre à jour la fiche de stock ?", ["Une fois par mois", "À chaque entrée et à chaque sortie", "Seulement lors de l'inventaire", "Quand le chef le demande"], 1, "La fiche est fiable si elle est mise à jour à chaque mouvement."),
          tf("Une sortie de stock doit être justifiée par un document signé (bon de sortie).", true, "Le bon de sortie permet de suivre chaque mouvement."),
          short("Un article coûte 2 500 FCFA l'unité. Il reste 46 unités en stock. Quelle est la valeur du stock de cet article, en FCFA ?", "115000", "46 × 2 500 = 115 000 FCFA.", 90),
          open("SCENARIO", "Lors de l'inventaire, il manque 15 sacs de riz par rapport à la fiche de stock. Que faites-vous ?", [["Recompte et vérifie les fiches et bons de sortie", 3], ["Informe le responsable par écrit", 2], ["Propose des mesures pour éviter la répétition", 2]], "Je recompte avec un témoin, je vérifie tous les bons de sortie et les livraisons du mois. Si l'écart persiste, j'informe mon responsable par écrit et je propose un inventaire tournant chaque semaine et un contrôle des sorties signé par deux personnes.", 300),
        ],
      },
    ],
  },
  {
    profession: "Agent de sécurité",
    title: "Agent(e) de sécurité",
    level: "BEGINNER",
    description: "Surveillance, contrôle des accès, gestion des incidents et premiers secours.",
    skills: [
      {
        name: "Contrôle des accès",
        weight: 35,
        questions: [
          mcq("Un visiteur sans rendez-vous insiste pour entrer. Que faites-vous ?", ["Vous le laissez entrer pour éviter un conflit", "Vous l'enregistrez et appelez la personne qu'il veut voir avant de le laisser passer", "Vous le faites entrer par une autre porte", "Vous le repoussez physiquement"], 1, "On vérifie et on enregistre avant toute entrée."),
          tf("Un employé qui a oublié son badge peut entrer sans vérification si vous le connaissez bien.", false, "La procédure s'applique à tout le monde."),
          mcq("Que doit contenir le registre des visiteurs ?", ["Seulement le prénom", "Le nom, l'heure d'entrée et de sortie, la personne visitée", "La couleur des vêtements", "Rien, il est facultatif"], 1, "Ces informations permettent la traçabilité."),
        ],
      },
      {
        name: "Gestion des incidents",
        weight: 35,
        questions: [
          mcq("Quel extincteur utilise-t-on sur un feu d'origine électrique ?", ["Un extincteur à eau", "Un extincteur à CO2", "Un seau de sable mouillé", "N'importe lequel"], 1, "L'eau conduit l'électricité ; le CO2 est adapté aux feux électriques."),
          mcq("Une personne fait un malaise et ne répond plus à l'entrée du bâtiment. Quelle est votre première action ?", ["La laisser se reposer", "Alerter les secours, vérifier qu'elle respire et la mettre en position latérale de sécurité si elle respire", "Lui donner à boire", "La transporter vous-même à l'hôpital"], 1, "Alerter, vérifier la respiration, protéger : c'est la base des premiers secours."),
          tf("En cas d'évacuation, il faut prendre l'ascenseur pour aller plus vite.", false, "Pendant une évacuation, on n'utilise jamais l'ascenseur."),
          mcq("Un véhicule inconnu reste garé longtemps devant l'entrée, moteur allumé. Que faites-vous ?", ["Vous l'ignorez", "Vous observez, notez la plaque et la description, et informez votre chef de poste", "Vous frappez à la vitre pour faire partir le conducteur", "Vous quittez votre poste pour aller voir"], 1, "On observe, on note et on rend compte sans s'exposer."),
          open("SCENARIO", "Pendant votre ronde de nuit, vous trouvez une porte du magasin forcée. Que faites-vous ?", [["Assure sa propre sécurité et n'entre pas seul", 2], ["Alerte immédiatement le responsable et/ou la police", 3], ["Protège les lieux sans toucher aux traces", 2], ["Consigne les faits dans la main courante", 1]], "Je n'entre pas seul. J'alerte immédiatement mon chef de poste et la police, je surveille l'accès en restant à distance, je ne touche à rien, puis je note l'heure et les faits dans la main courante.", 300),
        ],
      },
      {
        name: "Rédaction de la main courante",
        weight: 30,
        questions: [
          mcq("Comment écrire dans la main courante ?", ["Avec des suppositions et des opinions", "Des faits précis : date, heure, lieu, personnes, actions", "Le moins possible", "Au crayon pour pouvoir effacer"], 1, "La main courante rapporte des faits datés et précis."),
          tf("On peut arracher une page de la main courante en cas d'erreur.", false, "On barre proprement et on écrit la correction ; on n'arrache jamais de page."),
          open("FREE_TEXT", "Rédigez l'inscription de la main courante pour cette situation : à 22 h 15, un livreur s'est présenté sans bon de livraison ; vous avez refusé l'entrée et appelé le responsable logistique.", [["Date et heure précises", 2], ["Faits décrits sans jugement", 2], ["Actions menées et personnes prévenues", 2], ["Signature ou identification de l'agent", 1]], "04/11, 22 h 15 — Un livreur (société X, camion immatriculé …) s'est présenté au portail principal sans bon de livraison. Entrée refusée conformément aux consignes. 22 h 20 : appel au responsable logistique, M. Y, qui confirme qu'aucune livraison n'était prévue. 22 h 30 : départ du véhicule. Agent : Z."),
        ],
      },
    ],
  },
];

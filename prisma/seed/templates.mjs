// Modèles de la bibliothèque de tests (section 4 du cahier des charges).
// Format compact : `answer` = indice du bon choix (QCM), true/false (vrai/faux),
// { value, tolerance } (réponse courte) ; `rubric` = [[critère, points], …] pour les questions ouvertes.

export const mcq = (prompt, choices, answer, explanation, time = 60) => ({ type: "MCQ_SINGLE", prompt, choices, answer, explanation, time, points: 1 });
export const tf = (prompt, answer, explanation, time = 45) => ({ type: "TRUE_FALSE", prompt, answer, explanation, time, points: 1 });
export const short = (prompt, value, explanation, time = 120, tolerance = null) => ({ type: "SHORT_ANSWER", prompt, answer: { value, tolerance }, explanation, time, points: 2 });
export const open = (type, prompt, rubric, example, time = 300) => ({
  type,
  prompt,
  rubric,
  example,
  explanation: null,
  time,
  points: rubric.reduce((a, [, p]) => a + p, 0),
});

export const TEMPLATES = [
  {
    profession: "Comptable",
    title: "Comptable — SYSCOHADA",
    level: "CONFIRMED",
    description: "Écritures courantes SYSCOHADA, TVA, amortissements, rapprochement bancaire et rigueur de contrôle.",
    skills: [
      {
        name: "Comptabilité OHADA",
        weight: 40,
        questions: [
          mcq("Dans le plan comptable SYSCOHADA, quelle classe regroupe les comptes de tiers (fournisseurs, clients, personnel) ?", ["Classe 2", "Classe 4", "Classe 6", "Classe 7"], 1, "La classe 4 regroupe les comptes de tiers."),
          mcq("L'entreprise achète à crédit des fournitures de bureau pour 150 000 FCFA HT. Quel compte est crédité ?", ["401 Fournisseurs", "521 Banques", "411 Clients", "571 Caisse"], 0, "L'achat à crédit crée une dette envers le fournisseur : on crédite le compte 401."),
          tf("La dotation aux amortissements d'un véhicule est une charge enregistrée en classe 6.", true, "Les dotations aux amortissements (compte 681) sont des charges de classe 6."),
          short("Un ordinateur acheté 900 000 FCFA est amorti en linéaire sur 3 ans. Quel est le montant de la dotation annuelle, en FCFA ?", "300000", "900 000 / 3 = 300 000 FCFA."),
        ],
      },
      {
        name: "Fiscalité et paie",
        weight: 30,
        questions: [
          short("Une facture s'élève à 2 000 000 FCFA HT, avec une TVA de 19 %. Quel est le montant TTC, en FCFA ?", "2380000", "2 000 000 × 1,19 = 2 380 000 FCFA."),
          tf("La TVA s'applique aux salaires versés aux employés.", false, "Les salaires ne sont pas soumis à la TVA ; ils supportent des cotisations sociales et l'impôt sur le revenu."),
          mcq("Quel document justifie le paiement d'un fournisseur ?", ["Le bon de commande seul", "Le devis", "La facture du fournisseur, rapprochée du bon de réception", "Le relevé bancaire"], 2, "On paie sur facture, après avoir vérifié que la livraison a bien été reçue."),
        ],
      },
      {
        name: "Contrôle et rigueur",
        weight: 30,
        questions: [
          mcq("Lors du rapprochement bancaire, un chèque émis de 75 000 FCFA n'apparaît pas encore sur le relevé. Que faites-vous ?", ["Vous annulez le chèque en comptabilité", "Vous le déduisez du solde du relevé dans l'état de rapprochement", "Vous l'ajoutez au solde comptable", "Vous l'ignorez"], 1, "C'est un chèque non encore débité : il se déduit du solde bancaire dans l'état de rapprochement.", 90),
          open("SCENARIO", "En fin de mois, la caisse physique contient 45 000 FCFA de moins que le solde comptable. Que faites-vous, étape par étape ?", [["Recompte la caisse et vérifie les pièces justificatives", 2], ["Recherche la cause et informe la hiérarchie", 2], ["Enregistre l'écart selon la procédure (compte d'attente ou charge) sans le masquer", 2], ["Propose une mesure pour éviter que cela se reproduise", 2]], "Je recompte la caisse avec un témoin, je vérifie les pièces du mois et les dernières sorties. Si l'écart persiste, j'informe mon responsable par écrit, je l'enregistre en compte d'attente le temps de l'enquête, puis je propose un contrôle de caisse hebdomadaire contradictoire.", 360),
          open("FREE_TEXT", "Expliquez en quelques lignes, à un responsable qui n'est pas comptable, la différence entre le résultat et la trésorerie, avec un exemple.", [["Distinction claire entre résultat (richesse créée) et trésorerie (argent disponible)", 3], ["Exemple concret et juste", 3], ["Langage simple, sans jargon", 2]], "Le résultat mesure si l'activité de l'année a créé de la richesse ; la trésorerie, c'est l'argent réellement disponible. Exemple : une vente de 5 millions faite en décembre mais payée en février augmente le résultat de l'année, mais pas la trésorerie de décembre."),
        ],
      },
    ],
  },
  {
    profession: "Assistant administratif",
    title: "Assistant(e) administratif(ve)",
    level: "BEGINNER",
    description: "Organisation, gestion du courrier, rédaction professionnelle et outils bureautiques de base.",
    skills: [
      {
        name: "Organisation et classement",
        weight: 35,
        questions: [
          mcq("Un courrier urgent d'un ministère arrive alors que votre responsable est en mission. Quelle est votre première action ?", ["Le laisser sur son bureau", "L'enregistrer au registre du courrier et prévenir votre responsable par téléphone ou WhatsApp", "L'ouvrir et y répondre vous-même", "Attendre son retour"], 1, "On enregistre puis on informe rapidement la personne concernée."),
          mcq("Quelle méthode de classement est la plus adaptée pour les dossiers du personnel ?", ["Par ordre alphabétique des noms", "Par couleur de chemise", "Par date d'arrivée du dernier courrier", "Sans ordre particulier"], 0, "Le classement alphabétique permet de retrouver vite le dossier d'une personne."),
          short("Une réunion commence à 14 h 30 et dure 1 h 45. À quelle heure se termine-t-elle ? (format HH:MM)", "16:15", "14 h 30 + 1 h 45 = 16 h 15.", 90),
        ],
      },
      {
        name: "Communication écrite",
        weight: 35,
        questions: [
          tf("Un compte rendu de réunion doit indiquer les décisions prises et les personnes chargées de chaque action.", true, "C'est l'essentiel d'un compte rendu utile."),
          mcq("Quelle formule de politesse convient à une lettre officielle adressée à un directeur ?", ["Cordialement", "À bientôt", "Veuillez agréer, Monsieur le Directeur, l'expression de ma haute considération.", "Bien à toi"], 2, "Une lettre officielle demande une formule complète et respectueuse."),
          open("FREE_TEXT", "Rédigez un e-mail au fournisseur pour signaler que la livraison de papier prévue lundi n'est pas arrivée.", [["Objet clair", 1], ["Rappel de la commande et de la date prévue", 2], ["Demande précise (nouvelle date de livraison)", 2], ["Ton courtois et professionnel", 2], ["Orthographe correcte", 1]], "Objet : Commande n° 245 — livraison non reçue. Madame, Monsieur, la livraison de 20 rames de papier prévue lundi 14 n'est pas arrivée. Pourriez-vous nous indiquer d'ici demain la nouvelle date de livraison ? Nous vous remercions par avance. Cordialement, …"),
        ],
      },
      {
        name: "Outils bureautiques",
        weight: 30,
        questions: [
          mcq("Dans Excel, quelle formule calcule le total des cellules B2 à B10 ?", ["=TOTAL(B2-B10)", "=SOMME(B2:B10)", "=B2+B10", "=AJOUTER(B2;B10)"], 1, "La fonction SOMME avec une plage B2:B10."),
          mcq("Vous envoyez le même e-mail à 40 partenaires sans que chacun voie les adresses des autres. Vous mettez les adresses dans :", ["À", "Cc", "Cci", "Répondre à tous"], 2, "La copie cachée (Cci) masque les adresses aux autres destinataires."),
          tf("On peut donner le mot de passe de la messagerie du service à un visiteur pour qu'il imprime un document.", false, "Un mot de passe ne se partage jamais."),
          open("SCENARIO", "Trois visiteurs attendent à l'accueil, le téléphone sonne et votre chef vous demande un document urgent. Comment vous organisez-vous ?", [["Priorise de façon justifiée", 3], ["Informe les visiteurs du temps d'attente avec courtoisie", 2], ["Traite l'appel (prise de message)", 2], ["Assure le suivi ensuite", 1]], "Je réponds au téléphone et je prends un message, je dis aux visiteurs que je suis à eux dans quelques minutes, je remets le document urgent au chef, puis je reçois les visiteurs dans l'ordre d'arrivée et je rappelle la personne du téléphone."),
        ],
      },
    ],
  },
  {
    profession: "Commercial",
    title: "Commercial(e) terrain",
    level: "CONFIRMED",
    description: "Prospection, négociation, calculs de marge et suivi de la relation client.",
    skills: [
      {
        name: "Prospection et vente",
        weight: 40,
        questions: [
          mcq("Quel est le premier objectif d'un premier rendez-vous avec un prospect ?", ["Présenter tout le catalogue", "Comprendre ses besoins en lui posant des questions", "Obtenir une remise", "Parler du prix en premier"], 1, "On découvre les besoins avant de proposer."),
          tf("Un logiciel de gestion de la relation client (CRM) permet de suivre l'historique des échanges avec chaque client.", true, "C'est sa fonction principale."),
          open("FREE_TEXT", "Rédigez un message WhatsApp de relance à un prospect (une pharmacie de Bangui) rencontré il y a une semaine.", [["Message personnalisé (rappel de la rencontre)", 2], ["Rappel de la valeur pour le client", 2], ["Appel à l'action clair", 2], ["Ton professionnel et concis", 2]], "Bonjour Dr Ngaïkosset, c'est Paul de SOCADI. Suite à notre échange de mardi, je vous confirme la livraison sous 48 h et le paiement Orange Money. Puis-je passer jeudi à 10 h pour finaliser votre première commande ?", 240),
        ],
      },
      {
        name: "Négociation",
        weight: 30,
        questions: [
          mcq("Un client vous dit : « C'est trop cher. » Quelle est la meilleure réponse ?", ["Baisser tout de suite le prix de 20 %", "Lui dire que ce n'est pas cher", "Reformuler, chercher à comprendre par rapport à quoi, puis rappeler la valeur", "Mettre fin à l'entretien"], 2, "On traite l'objection avant de parler de remise."),
          tf("Accorder une remise sans demander de contrepartie est une bonne pratique de négociation.", false, "Toute concession doit être échangée contre une contrepartie (volume, délai, paiement)."),
          open("SCENARIO", "Une ONG veut acheter 50 motos, mais son budget est 20 % inférieur à votre prix. Comment menez-vous la négociation ?", [["Explore les besoins et les contraintes du bailleur", 2], ["Propose des options (échelonnement, volume, autre modèle)", 3], ["Demande des contreparties à chaque concession", 2], ["Conclut avec un engagement écrit", 1]], "Je demande ce qui est prioritaire pour l'ONG et les règles de son bailleur, je propose un modèle moins cher ou une livraison en deux lots, une remise limitée contre un paiement rapide, et je confirme l'accord par écrit.", 360),
        ],
      },
      {
        name: "Suivi client et chiffres",
        weight: 30,
        questions: [
          short("Un produit est acheté 8 000 FCFA et revendu 10 000 FCFA. Quel est le taux de marque sur le prix d'achat, en % ?", "25", "(10 000 − 8 000) / 8 000 = 25 %."),
          short("L'objectif du mois est de 5 000 000 FCFA ; vous avez réalisé 3 750 000 FCFA. Quel est votre taux de réalisation, en % ?", "75", "3 750 000 / 5 000 000 = 75 %.", 90),
          mcq("Un client mécontent d'un retard de livraison publie un message sur Facebook. Quelle est votre première action ?", ["Le contacter rapidement en privé, vous excuser et proposer une solution", "Lui répondre publiquement qu'il ment", "Ignorer le message", "Demander à vos amis de le contredire"], 0, "On désamorce rapidement et en privé."),
          mcq("Quel indicateur mesure le mieux la fidélité des clients ?", ["Le nombre d'appels passés", "Le taux de réachat", "Le nombre de prospectus distribués", "Le chiffre d'affaires d'une seule journée"], 1, "Un client fidèle rachète."),
        ],
      },
    ],
  },
  {
    profession: "Logisticien",
    title: "Logisticien(ne)",
    level: "CONFIRMED",
    description: "Gestion de stock, réapprovisionnement, transport sur les axes difficiles et procédures de réception.",
    skills: [
      {
        name: "Gestion des stocks",
        weight: 40,
        questions: [
          mcq("Que signifie la méthode FEFO ?", ["Premier entré, premier sorti", "Premier expiré, premier sorti", "Dernier entré, premier sorti", "Sortie au hasard"], 1, "First Expired, First Out : on sort d'abord ce qui périme en premier."),
          short("Stock initial : 1 200 sacs. Entrées : 800. Sorties : 1 450. Quel est le stock final ?", "550", "1 200 + 800 − 1 450 = 550."),
          short("Consommation : 40 cartons par semaine. Délai de réapprovisionnement : 3 semaines. Stock de sécurité : 30 cartons. À quel niveau de stock faut-il commander ?", "150", "40 × 3 + 30 = 150 cartons."),
          mcq("À l'inventaire, le stock physique ne correspond pas à la fiche de stock. Quelle est votre première action ?", ["Corriger la fiche directement", "Recompter et vérifier les derniers mouvements avant toute correction", "Ignorer l'écart", "Accuser le magasinier"], 1, "On vérifie avant de corriger, et on documente."),
        ],
      },
      {
        name: "Transport et approvisionnement",
        weight: 35,
        questions: [
          mcq("Avant d'envoyer un convoi vers Bambari en saison des pluies, quel est le point le plus important à vérifier ?", ["La couleur des camions", "L'état des routes et des ponts et la situation sécuritaire de l'axe", "Le prix du carburant à Bangui", "Le planning des congés"], 1, "Praticabilité et sécurité de l'axe d'abord."),
          mcq("Quel document accompagne la marchandise entre l'entrepôt et le site de distribution ?", ["La facture proforma", "Le bordereau de livraison (waybill)", "Le contrat de travail", "Le relevé bancaire"], 1, "Le bordereau de livraison assure la traçabilité."),
          open("SCENARIO", "Votre convoi de deux camions de vivres est bloqué près de Bambari par un pont effondré ; la distribution est prévue demain. Que faites-vous ?", [["Met l'équipe et la marchandise en sécurité", 2], ["Informe la hiérarchie et les partenaires", 2], ["Cherche des solutions (autre itinéraire, transbordement, report)", 2], ["Documente l'incident", 2]], "Je fais stationner les camions dans un lieu sûr, j'informe la coordination par téléphone satellite, je vérifie avec les partenaires un itinéraire de contournement ou un transbordement sur des véhicules plus légers, et je préviens les équipes de distribution du report éventuel. Je rédige un rapport d'incident.", 360),
        ],
      },
      {
        name: "Sécurité et procédures",
        weight: 25,
        questions: [
          tf("Un bon de livraison doit être signé par la personne qui réceptionne la marchandise.", true, "La signature prouve la réception."),
          tf("On peut stocker des médicaments à même le sol s'ils sont dans leurs cartons.", false, "On stocke sur palettes, à l'abri de l'humidité et de la chaleur."),
          open("FREE_TEXT", "Décrivez la procédure de réception d'une livraison de 200 kits d'hygiène.", [["Vérifie les documents par rapport à la commande", 2], ["Contrôle la quantité et l'état des kits", 2], ["Émet des réserves en cas de problème", 2], ["Enregistre l'entrée en stock", 2]], "Je compare le bordereau au bon de commande, je compte les kits et j'ouvre un échantillon, j'écris les réserves sur le bordereau en cas de manque ou de dommage, je signe, puis j'enregistre l'entrée sur la fiche de stock et dans le système."),
        ],
      },
    ],
  },
  {
    profession: "Chauffeur",
    title: "Chauffeur",
    level: "BEGINNER",
    description: "Code de la route, entretien courant du véhicule et sécurité sur les axes de province.",
    skills: [
      {
        name: "Code de la route et conduite",
        weight: 40,
        questions: [
          mcq("Au feu orange fixe, que devez-vous faire ?", ["Accélérer pour passer", "Vous arrêter, sauf si l'arrêt est dangereux", "Klaxonner", "Continuer dans tous les cas"], 1, "Le feu orange impose l'arrêt sauf impossibilité."),
          tf("Téléphoner en conduisant, même avec un kit mains libres, reste une source de distraction.", true, "La conversation détourne l'attention."),
          short("Votre véhicule consomme 12 litres aux 100 km. Combien de litres faut-il pour un trajet de 350 km ?", "42", "350 × 12 / 100 = 42 litres.", 90),
          mcq("Vous crevez un pneu sur une route nationale. Quelle est la première chose à faire ?", ["Changer la roue au milieu de la route", "Vous garer en sécurité, allumer les feux de détresse et placer le triangle", "Continuer jusqu'à la ville", "Appeler votre famille"], 1, "Sécuriser d'abord."),
        ],
      },
      {
        name: "Entretien du véhicule",
        weight: 30,
        questions: [
          mcq("Avant un long trajet, que vérifiez-vous en priorité ?", ["La radio", "Les niveaux (huile, eau), les pneus et les freins", "La propreté des sièges", "Le désodorisant"], 1, "Les éléments de sécurité et le moteur."),
          tf("Le niveau d'huile se vérifie moteur en marche.", false, "On vérifie moteur arrêté, véhicule à plat, de préférence moteur froid."),
          mcq("Le voyant de température du moteur passe au rouge. Que faites-vous ?", ["Vous accélérez pour arriver plus vite", "Vous vous arrêtez dès que possible et coupez le moteur", "Vous ouvrez immédiatement le radiateur bouillant", "Vous ignorez le voyant"], 1, "On évite la casse moteur ; ne jamais ouvrir un radiateur chaud."),
          mcq("À quoi sert le carnet de bord du véhicule ?", ["À noter les trajets, le kilométrage, le carburant et les incidents", "À noter les recettes du bureau", "À rien", "À noter les adresses des passagers"], 0, "Il assure le suivi et la transparence."),
        ],
      },
      {
        name: "Sécurité et comportement",
        weight: 30,
        questions: [
          mcq("Vous transportez du personnel d'une ONG. À un barrage non officiel, des hommes armés exigent de l'argent. Quelle est la bonne conduite ?", ["Forcer le passage", "Rester calme, appliquer les consignes de sécurité de l'organisation, ne pas résister, puis signaler l'incident", "Insulter les hommes", "Sortir seul pour négocier longuement"], 1, "La sécurité des personnes passe avant tout ; on suit les procédures."),
          open("SCENARIO", "Votre responsable vous demande de partir à 17 h pour un trajet de 4 heures sur une piste réputée dangereuse la nuit. Que faites-vous ?", [["Identifie le risque", 2], ["S'exprime de façon respectueuse", 2], ["Propose une alternative (départ le lendemain matin)", 2], ["Se réfère aux règles de sécurité", 2]], "Je signale respectueusement que la circulation de nuit sur cet axe est interdite par les règles de sécurité, et je propose de partir demain à 6 h pour arriver avant midi."),
        ],
      },
    ],
  },
  {
    profession: "Agent de terrain humanitaire",
    title: "Agent(e) de terrain humanitaire",
    level: "CONFIRMED",
    description: "Principes humanitaires, protection, collecte de données et communication avec les communautés.",
    skills: [
      {
        name: "Principes humanitaires et protection",
        weight: 35,
        questions: [
          mcq("Quels sont les quatre principes humanitaires fondamentaux ?", ["Humanité, neutralité, impartialité, indépendance", "Rapidité, efficacité, visibilité, rentabilité", "Solidarité, fraternité, égalité, liberté", "Neutralité, discrétion, ponctualité, loyauté"], 0, "Ce sont les principes reconnus par l'ensemble des acteurs humanitaires."),
          tf("On peut servir en priorité une famille parce qu'elle appartient à la même communauté que le chef de village.", false, "Le principe d'impartialité impose de servir selon les besoins seulement."),
          mcq("Un bénéficiaire vous signale un abus commis par un membre de l'équipe. Que faites-vous ?", ["Vous menez l'enquête vous-même", "Vous écoutez, garantissez la confidentialité et transmettez par le mécanisme de signalement de l'organisation", "Vous ignorez le signalement", "Vous en parlez au village"], 1, "On protège la personne et on utilise le canal officiel."),
          mcq("Avant de photographier des bénéficiaires, que devez-vous faire ?", ["Rien de particulier", "Obtenir leur consentement éclairé", "Leur promettre une aide supplémentaire", "Demander au chef de quartier seulement"], 1, "Le consentement de la personne est obligatoire."),
        ],
      },
      {
        name: "Collecte de données et suivi",
        weight: 35,
        questions: [
          short("1 250 ménages sont ciblés ; 1 000 ont été servis. Quel est le taux de couverture, en % ?", "80", "1 000 / 1 250 = 80 %.", 90),
          mcq("Quelle est la bonne pratique pour garantir la qualité des données collectées sur KoBo ?", ["Attendre la fin de l'enquête pour regarder les données", "Contrôler les formulaires chaque jour et faire des vérifications ponctuelles auprès des ménages", "Supprimer les réponses incohérentes sans vérifier", "Laisser chaque enquêteur corriger ses propres données"], 1, "Le contrôle quotidien permet de corriger vite."),
          tf("Les données personnelles des bénéficiaires peuvent être partagées dans un groupe WhatsApp de l'équipe élargie.", false, "Les données personnelles sont protégées et ne circulent que par des canaux sécurisés et limités."),
          mcq("Lequel est un indicateur de résultat (et non d'activité) ?", ["Nombre de kits distribués", "Nombre de sessions de sensibilisation", "Pourcentage de ménages ayant une consommation alimentaire acceptable", "Nombre de véhicules loués"], 2, "Il mesure un changement chez les bénéficiaires."),
        ],
      },
      {
        name: "Communication communautaire",
        weight: 30,
        questions: [
          open("SCENARIO", "Pendant une distribution à Kaga-Bandoro, une foule de personnes non enregistrées se presse et la tension monte. Que faites-vous ?", [["Assure la sécurité de l'équipe et des bénéficiaires", 2], ["Communique calmement et de façon transparente sur les critères", 2], ["Se coordonne avec les responsables et les leaders communautaires", 2], ["Suspend si nécessaire et rend compte", 2]], "Je fais reculer l'équipe derrière le point de distribution, j'explique avec les leaders les critères et le mécanisme de plainte, je note les demandes, et si la tension continue je suspends la distribution et j'informe ma coordination.", 360),
          open("FREE_TEXT", "Expliquez en mots simples à un chef de quartier les critères de sélection d'un programme de transferts monétaires.", [["Explication claire", 2], ["Transparence et équité des critères", 2], ["Présente le mécanisme de plainte", 2], ["Ton respectueux", 2]], "Chef, ce programme aide d'abord les ménages qui n'ont pas de revenus réguliers, ceux qui accueillent des déplacés et ceux dirigés par une personne âgée ou handicapée. Une équipe passera dans chaque maison avec la même fiche. Si quelqu'un n'est pas d'accord, il peut appeler le numéro vert ou déposer une plainte dans la boîte au marché."),
        ],
      },
    ],
  },
  {
    profession: "Informaticien",
    title: "Technicien(ne) informatique",
    level: "CONFIRMED",
    description: "Support utilisateurs, réseaux, sécurité informatique et continuité de service malgré les coupures.",
    skills: [
      {
        name: "Support et réseaux",
        weight: 40,
        questions: [
          mcq("Un utilisateur n'a plus Internet, alors que ses collègues l'ont. Que vérifiez-vous d'abord ?", ["Vous changez le routeur", "Le câble ou le Wi-Fi et la configuration IP de son poste", "Vous réinstallez Windows", "Vous appelez le fournisseur d'accès"], 1, "Le problème est local au poste."),
          mcq("Quelle commande teste la connexion vers une adresse IP ?", ["ipconfig", "ping", "format", "dir"], 1, "ping envoie des paquets ICMP vers l'adresse."),
          tf("192.168.1.10 est une adresse IP privée.", true, "La plage 192.168.0.0/16 est réservée aux réseaux privés."),
          short("Combien d'adresses d'hôtes utilisables contient un réseau /24 ?", "254", "256 adresses moins l'adresse réseau et l'adresse de diffusion."),
        ],
      },
      {
        name: "Sécurité informatique",
        weight: 30,
        questions: [
          mcq("Un e-mail annonce « Votre compte va être suspendu, cliquez ici » avec un lien étrange. De quoi s'agit-il probablement ?", ["D'une mise à jour", "D'un hameçonnage (phishing)", "D'une publicité", "D'un message du directeur"], 1, "Urgence + lien suspect : signes typiques d'hameçonnage."),
          tf("Le mot de passe « 123456 » est acceptable si l'ordinateur ne quitte pas le bureau.", false, "Un mot de passe faible est dangereux partout."),
          open("FREE_TEXT", "Rédigez une note courte aux employés présentant 3 règles de sécurité numérique.", [["Trois règles pertinentes", 3], ["Clarté", 2], ["Conseils concrets", 2], ["Ton adapté à tous les employés", 1]], "1. Ne cliquez jamais sur un lien reçu par e-mail ou WhatsApp sans vérifier l'expéditeur. 2. Utilisez un mot de passe long et différent pour chaque compte. 3. Verrouillez votre ordinateur (Windows + L) dès que vous quittez votre bureau."),
        ],
      },
      {
        name: "Systèmes et continuité",
        weight: 30,
        questions: [
          mcq("Quelle stratégie de sauvegarde est recommandée ?", ["Une seule copie sur le serveur", "3 copies, sur 2 supports différents, dont 1 hors du bureau", "Une clé USB dans le tiroir", "Aucune, le serveur est fiable"], 1, "La règle 3-2-1."),
          mcq("Le bureau subit des coupures d'électricité fréquentes. Comment protéger le serveur ?", ["Le débrancher la nuit", "Un onduleur avec arrêt automatique propre", "Une multiprise", "Rien"], 1, "L'onduleur évite les arrêts brutaux et la perte de données."),
          open("SCENARIO", "À 9 h, le serveur de fichiers ne répond plus ; 20 employés sont bloqués et le directeur vous demande un délai. Que faites-vous ?", [["Diagnostic méthodique", 3], ["Communique un délai et une solution de contournement", 2], ["Restaure si besoin à partir des sauvegardes", 2], ["Rédige un rapport après l'incident", 1]], "Je vérifie l'alimentation, le réseau puis les services du serveur ; j'annonce au directeur un premier point dans 30 minutes et je propose de travailler en local ou sur le partage de secours ; si le disque est en panne, je restaure la dernière sauvegarde ; ensuite je rédige un rapport avec les causes et les mesures.", 360),
        ],
      },
    ],
  },
];

// Modules prêts à l'emploi, série 2 : français écrit, bureautique et sécurité numérique,
// anglais professionnel. Ajoutables à n'importe quel test (étape « Compétences »).
// Rédigés avec Claude Code. Le nom de métier commence par « Module : » (repère des modules).
import { mcq, open, order, short, tf } from "./templates.mjs";

export const MODULES_2 = [
  {
    profession: "Module : Français écrit",
    title: "Français écrit et rédaction professionnelle",
    level: "CONFIRMED",
    description: "Orthographe, accords, conjugaison, courriers et emails professionnels : indispensable pour tous les postes de bureau.",
    skills: [
      {
        name: "Orthographe et grammaire",
        weight: 50,
        questions: [
          mcq(
            "Quelle phrase est correcte ?",
            ["Les dossiers que j'ai envoyé sont complets.", "Les dossiers que j'ai envoyés sont complets.", "Les dossiers que j'ai envoyées sont complets.", "Les dossiers que j'ai envoyer sont complets."],
            1,
            "Avec l'auxiliaire avoir, le participe passé s'accorde avec le complément placé avant : « que » = les dossiers (masculin pluriel).",
          ),
          mcq("Complétez : « Il faut que vous ___ le rapport avant lundi. »", ["finissez", "finirez", "finissiez", "finiriez"], 2, "Après « il faut que », on emploie le subjonctif : que vous finissiez."),
          mcq("Quelle formule est correctement écrite ?", ["Je vous pris d'agréer…", "Je vous prie d'agréer…", "Je vous prit d'agréer…", "Je vous pries d'agréer…"], 1, "Verbe prier au présent, 1re personne du singulier : je prie."),
          mcq("Complétez : « Les candidats se sont ___ à l'heure. »", ["présenté", "présentés", "présentées", "présenter"], 1, "Verbe pronominal : le participe s'accorde ici avec le sujet « les candidats » (masculin pluriel)."),
          mcq("Quel est le pluriel de « un travail » ?", ["des travails", "des travaux", "des travaus", "des travailles"], 1, "Travail fait travaux au pluriel (comme journal → journaux)."),
          tf("Dans un courrier soigné, on peut écrire « malgré que » à la place de « bien que ».", false, "« Malgré que » est déconseillé : on écrit « bien que » ou « quoique »."),
          short("Écrivez en lettres le nombre 80, comme sur un chèque.", "quatre-vingts", "Quatre-vingts prend un s quand il n'est suivi d'aucun autre nombre.", 90),
          order(
            "Remettez dans l'ordre les parties d'une lettre professionnelle.",
            ["Coordonnées de l'expéditeur", "Objet de la lettre", "Formule d'appel (Madame, Monsieur,)", "Corps de la lettre", "Formule de politesse", "Signature"],
            "On présente qui écrit et le sujet, on s'adresse au destinataire, on développe, puis on conclut et on signe.",
            90,
          ),
        ],
      },
      {
        name: "Rédaction professionnelle",
        weight: 50,
        questions: [
          mcq(
            "Quelle formule convient pour terminer un courrier formel ?",
            ["Bisous", "Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.", "À plus tard", "Merci de me répondre vite"],
            1,
            "C'est la formule de politesse classique d'un courrier administratif.",
          ),
          mcq("Que doit contenir l'objet d'un email professionnel ?", ["Rien, il est facultatif", "Un résumé court et précis du sujet", "Le texte entier du message", "Votre numéro de téléphone"], 1, "L'objet permet au destinataire de comprendre le sujet avant d'ouvrir le message."),
          tf("Écrire un email professionnel entièrement en majuscules le rend plus facile à lire.", false, "Les majuscules sont difficiles à lire et donnent l'impression de crier."),
          mcq("Quel mot convient dans un rapport : « Les résultats du trimestre sont ___. »", ["super", "top", "satisfaisants", "trop bien"], 2, "Un rapport utilise un vocabulaire neutre et précis."),
          open(
            "FREE_TEXT",
            "Rédigez un email court à un fournisseur : une livraison de 50 cartons est arrivée hier avec 5 cartons abîmés.",
            [
              ["Objet clair", 1],
              ["Faits précis : date, quantités, problème", 2],
              ["Demande claire (remplacement ou avoir) et délai", 2],
              ["Ton courtois, formules adaptées", 2],
              ["Orthographe correcte", 1],
            ],
            "Objet : Livraison du 3 novembre — 5 cartons abîmés. Madame, Monsieur, nous avons reçu hier les 50 cartons de la commande n° 245. Cinq d'entre eux sont arrivés écrasés et leur contenu est inutilisable (photos jointes). Merci de nous les remplacer d'ici vendredi ou de nous établir un avoir. Cordialement, Grâce Ndomaté, service logistique.",
            420,
          ),
        ],
      },
    ],
  },
  {
    profession: "Module : Bureautique et numérique",
    title: "Bureautique et sécurité numérique",
    level: "BEGINNER",
    description: "Excel, Word, raccourcis utiles, arnaques par email et bons réflexes de sécurité : les bases du travail sur ordinateur.",
    skills: [
      {
        name: "Excel et tableurs",
        weight: 40,
        questions: [
          mcq("Quelle formule calcule la moyenne des cellules B2 à B10 ?", ["=MOYENNE(B2:B10)", "=SOMME(B2:B10)/2", "=MOY(B2;B10)", "=MOYENNE(B2+B10)"], 0, "MOYENNE fait la moyenne d'une plage de cellules."),
          short("Dans Excel, A1 contient 200 000 et B1 contient 15 %. Quel est le résultat de =A1*B1 ?", "30000", "200 000 × 15 % = 30 000.", 90),
          mcq("À quoi sert le symbole $ dans la formule =$A$1 ?", ["À afficher le résultat en dollars", "À figer la référence quand on recopie la formule", "À additionner les cellules", "À trier la colonne"], 1, "Le $ bloque la colonne et la ligne : la référence ne bouge pas quand on recopie."),
          mcq(
            "Quelle formule affiche « Admis » si C2 vaut au moins 10, et « Refusé » sinon ?",
            ['=SI(C2>=10;"Admis";"Refusé")', "=SOMME.SI(C2;10)", "=NB.SI(C2>=10)", "=RECHERCHEV(C2;10)"],
            0,
            "SI(condition ; valeur si vrai ; valeur si faux).",
          ),
          tf("Trier une seule colonne sans sélectionner tout le tableau peut mélanger les informations des lignes.", true, "Chaque ligne doit rester entière : on trie tout le tableau."),
        ],
      },
      {
        name: "Word et documents",
        weight: 30,
        questions: [
          mcq("Quel raccourci enregistre un document sous Windows ?", ["Ctrl + S", "Ctrl + P", "Ctrl + Z", "Ctrl + E"], 0, "Ctrl + S enregistre ; Ctrl + P imprime."),
          mcq("Quel raccourci annule la dernière action ?", ["Ctrl + Y", "Ctrl + Z", "Ctrl + X", "Ctrl + A"], 1, "Ctrl + Z annule ; Ctrl + Y rétablit."),
          mcq("Quel format choisir pour envoyer un document qui ne doit pas être modifié ?", ["DOCX", "PDF", "TXT", "XLSX"], 1, "Le PDF garde la mise en page et se modifie difficilement."),
          order(
            "Remettez dans l'ordre les étapes pour copier un texte d'un document vers un autre.",
            ["Sélectionner le texte", "Copier (Ctrl + C)", "Placer le curseur dans l'autre document", "Coller (Ctrl + V)"],
            "Sélectionner, copier, se placer, coller.",
            60,
            1,
          ),
        ],
      },
      {
        name: "Sécurité numérique",
        weight: 30,
        questions: [
          mcq(
            "Vous recevez l'email : « Votre compte bancaire est bloqué, cliquez ici et donnez votre code ». Que faites-vous ?",
            ["Vous cliquez vite pour débloquer le compte", "Vous ne cliquez pas et vous signalez le message : c'est sans doute une arnaque (hameçonnage)", "Vous répondez avec votre code", "Vous le transférez à vos collègues"],
            1,
            "Une banque ne demande jamais un code par email : c'est de l'hameçonnage.",
          ),
          mcq("Quel mot de passe est le plus sûr ?", ["123456", "motdepasse", "Bangui2024", "T7#qL9!vR2m@"], 3, "Long, avec majuscules, minuscules, chiffres et symboles, sans mot du dictionnaire."),
          tf("On peut partager son mot de passe professionnel avec un collègue de confiance.", false, "Un mot de passe est personnel : chacun doit avoir son propre accès."),
          tf("Faire des sauvegardes régulières protège contre la perte de données.", true, "Panne, vol ou virus : une sauvegarde permet de tout récupérer."),
          mcq(
            "Que signifie le cadenas (https) à côté de l'adresse d'un site ?",
            ["Le site est forcément honnête", "La connexion entre vous et le site est chiffrée", "Le site est gratuit", "Le site appartient à l'État"],
            1,
            "Le cadenas protège la connexion, mais ne garantit pas que le site soit honnête.",
          ),
        ],
      },
    ],
  },
  {
    profession: "Module : Anglais professionnel",
    title: "Anglais professionnel",
    level: "CONFIRMED",
    description: "Vocabulaire du travail, grammaire de base et emails en anglais, pour les postes en contact avec des partenaires internationaux.",
    skills: [
      {
        name: "Anglais : compréhension et vocabulaire",
        weight: 50,
        questions: [
          mcq("Que signifie « deadline » ?", ["La date limite", "Une ligne morte", "Un retard", "Une réunion"], 0, "A deadline is the latest date to finish a task."),
          mcq("« Please find attached the report. » signifie :", ["Veuillez trouver le rapport en pièce jointe.", "Veuillez attacher le rapport.", "Le rapport est perdu.", "Merci de lire le rapport demain."], 0, "Formule courante pour annoncer une pièce jointe."),
          mcq("Quelle phrase est correcte ?", ["She don't work on Monday.", "She doesn't work on Monday.", "She not work on Monday.", "She doesn't works on Monday."], 1, "À la 3e personne du singulier : doesn't + verbe sans s."),
          mcq("Complétez : « I ___ in Bangui since 2019. »", ["live", "am living", "have lived", "lived"], 2, "« Since » + action qui dure jusqu'à maintenant : present perfect (have lived)."),
          mcq("« Could you call me back? » signifie :", ["Pouvez-vous me rappeler ?", "Pouvez-vous revenir ?", "Pouvez-vous m'appeler plus tôt ?", "Pouvez-vous m'envoyer un email ?"], 0, "To call back = rappeler."),
          short("Traduisez en anglais le mot « réunion » (au travail).", "meeting", "A meeting.", 60),
        ],
      },
      {
        name: "Anglais : communication écrite",
        weight: 50,
        questions: [
          mcq("Quel est le meilleur début d'email à une personne que vous ne connaissez pas ?", ["Hey buddy,", "Dear Sir or Madam,", "Yo,", "Hi dude,"], 1, "« Dear Sir or Madam, » est la formule formelle quand on ne connaît pas le nom."),
          mcq("« The meeting has been postponed. » signifie :", ["La réunion a été avancée.", "La réunion a été reportée.", "La réunion est annulée définitivement.", "La réunion a commencé."], 1, "To postpone = reporter à plus tard."),
          tf("« Best regards » est une formule correcte pour terminer un email professionnel.", true, "Comme « Kind regards » ou « Sincerely »."),
          order(
            "Remettez dans l'ordre cet email court.",
            ["Dear Mr. Smith,", "Thank you for your quick reply.", "Please find attached the signed contract.", "Best regards,", "Grace Ndomaté"],
            "Salutation, remerciement, objet du message, formule de fin, signature.",
            90,
          ),
          open(
            "FREE_TEXT",
            "Write 3 or 4 sentences in English to introduce yourself to a new international partner: your name, your job, your organisation and what you do.",
            [
              ["Gives all the key information", 3],
              ["Correct grammar and spelling", 2],
              ["Professional and polite tone", 2],
            ],
            "Dear Ms. Johnson, my name is Grace Ndomaté and I am the logistics officer at KTZ Group in Bangui. I manage the purchase and delivery of supplies for our projects in the Central African Republic. I look forward to working with you.",
            420,
          ),
        ],
      },
    ],
  },
];

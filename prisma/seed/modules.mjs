// Modules prêts à l'emploi, ajoutables à n'importe quel test (étape « Compétences ») ou
// utilisables seuls depuis la bibliothèque : culture générale, raisonnement, programmation.
// Rédigés avec Claude Code. Le nom de métier commence par « Module : » (repère des modules).
import { code, img, mcq, order, short, tf } from "./templates.mjs";

const starter = (signature) => `function ${signature} {\n  // Votre code ici\n}\n`;

export const MODULES = [
  {
    profession: "Module : Culture générale",
    title: "Culture générale — Centrafrique, Afrique et monde",
    level: "BEGINNER",
    description: "Histoire et institutions de la RCA, géographie africaine, monde et sciences : pour évaluer l'ouverture d'esprit des candidats.",
    skills: [
      {
        name: "Culture générale (Centrafrique et Afrique)",
        weight: 50,
        questions: [
          img(mcq("À quel pays appartient ce drapeau ?", ["Cameroun", "République centrafricaine", "Gabon", "Congo"], 1, "Bleu, blanc, vert, jaune, une bande rouge verticale et une étoile jaune : le drapeau centrafricain.", 45), "drapeau-rca.svg"),
          mcq("En quelle année la République centrafricaine est-elle devenue indépendante ?", ["1958", "1960", "1965", "1979"], 1, "L'indépendance a été proclamée le 13 août 1960."),
          mcq("Qui est considéré comme le père fondateur de la République centrafricaine ?", ["Barthélemy Boganda", "David Dacko", "Jean-Bedel Bokassa", "André Kolingba"], 0, "Barthélemy Boganda a proclamé la République le 1er décembre 1958 ; il est mort en 1959."),
          mcq("Quelles sont les langues officielles de la République centrafricaine ?", ["Le français et l'anglais", "Le français et le sango", "Le sango et l'arabe", "Le français seulement"], 1, "Le français et le sango sont les deux langues officielles."),
          mcq("Au bord de quelle rivière se trouve Bangui ?", ["Le Chari", "L'Oubangui", "La Sangha", "Le Niger"], 1, "Bangui est sur la rive de l'Oubangui, face à la RD Congo."),
          mcq("Dans quelle ville se trouve le siège de la Commission de la CEMAC ?", ["Libreville", "Yaoundé", "Bangui", "N'Djamena"], 2, "La Commission de la CEMAC siège à Bangui."),
          mcq("Où se trouve le siège de l'Union africaine ?", ["Addis-Abeba", "Abuja", "Le Caire", "Dakar"], 0, "L'Union africaine siège à Addis-Abeba, en Éthiopie."),
          order(
            "Classez ces événements du plus ancien au plus récent.",
            ["Indépendance de la République centrafricaine", "Création de l'Organisation de l'unité africaine (OUA)", "Signature du traité de l'OHADA", "Création de l'Union africaine"],
            "1960, puis 1963, 1993 et 2002.",
          ),
          tf("Le franc CFA utilisé en Afrique centrale est émis par la BEAC (Banque des États de l'Afrique centrale).", true, "La BEAC émet le franc CFA (XAF) des six pays de la CEMAC."),
          mcq("Quel est le plus long fleuve d'Afrique ?", ["Le Congo", "Le Niger", "Le Nil", "Le Zambèze"], 2, "Le Nil est le plus long fleuve d'Afrique."),
        ],
      },
      {
        name: "Culture générale (monde et sciences)",
        weight: 50,
        questions: [
          mcq("Quelle est la planète la plus proche du Soleil ?", ["Vénus", "Mercure", "Mars", "La Terre"], 1, "Mercure est la planète la plus proche du Soleil."),
          mcq("Dans quelle ville se trouve le siège de l'Organisation des Nations unies (ONU) ?", ["Genève", "Paris", "New York", "Bruxelles"], 2, "Le siège de l'ONU est à New York."),
          tf("Au niveau de la mer, l'eau pure bout à 100 °C.", true, "C'est la température d'ébullition de l'eau à la pression atmosphérique normale."),
          mcq("Quel organe pompe le sang dans tout le corps ?", ["Le foie", "Les poumons", "Le cœur", "Les reins"], 2, "Le cœur est la pompe de la circulation sanguine."),
          mcq("Quelle est la capitale du Cameroun ?", ["Douala", "Yaoundé", "Garoua", "Bafoussam"], 1, "Yaoundé est la capitale ; Douala est la capitale économique."),
          short("Combien de jours compte une année bissextile ?", "366", "Une année bissextile a un 29 février : 366 jours.", 60),
          order("Classez ces unités de longueur de la plus petite à la plus grande.", ["Millimètre", "Centimètre", "Mètre", "Kilomètre"], "1 mm < 1 cm < 1 m < 1 km.", 60, 1),
          mcq("Quel gaz les plantes absorbent-elles pour faire la photosynthèse ?", ["L'oxygène", "Le dioxyde de carbone", "L'azote", "L'hydrogène"], 1, "Les plantes absorbent le dioxyde de carbone et rejettent de l'oxygène."),
          tf("Le paludisme est transmis par la piqûre de certains moustiques (les anophèles femelles).", true, "Le parasite du paludisme est transmis par les moustiques anophèles."),
        ],
      },
    ],
  },
  {
    profession: "Module : Raisonnement logique",
    title: "Raisonnement logique et calcul",
    level: "CONFIRMED",
    description: "Suites de figures et de nombres, logique, codes, lecture de graphiques et calcul pratique, avec des illustrations.",
    skills: [
      {
        name: "Raisonnement logique",
        weight: 50,
        questions: [
          img(mcq("Quelle figure complète la suite ?", ["Un cercle", "Un hexagone (6 côtés)", "Un triangle", "Un carré"], 1, "Chaque figure a un côté de plus : 3, 4, 5, puis 6 côtés.", 60), "suite-polygones.svg"),
          img(mcq("Combien de points faut-il dans la case vide ?", ["3", "4", "5", "6"], 2, "Dans chaque ligne et chaque colonne, on ajoute un point : 3, 4, puis 5.", 75), "matrice-points.svg"),
          img(mcq("Quelle flèche complète la suite ?", ["Une flèche vers le haut", "Une flèche vers la gauche", "Une flèche vers la droite", "Une flèche vers le bas"], 1, "La flèche tourne d'un quart de tour dans le sens des aiguilles d'une montre : haut, droite, bas, puis gauche.", 60), "suite-fleches.svg"),
          short("Quel nombre complète la suite : 2, 6, 12, 20, 30, … ?", "42", "Les écarts augmentent de 2 : +4, +6, +8, +10, puis +12. 30 + 12 = 42.", 120),
          short("Quel nombre complète la suite : 3, 9, 27, 81, … ?", "243", "Chaque nombre est multiplié par 3 : 81 × 3 = 243.", 90),
          short("Quelle lettre complète la suite : A, C, F, J, … ?", "O", "On avance de 2, 3, 4, puis 5 lettres : J + 5 = O.", 120),
          tf("« Tous les chauffeurs de l'entreprise ont un permis. Paul a un permis. Donc Paul est chauffeur de l'entreprise. » Ce raisonnement est juste.", false, "Avoir un permis ne suffit pas : beaucoup de personnes ont un permis sans être chauffeurs de l'entreprise.", 60),
          mcq("Quel mot ne va pas avec les autres ?", ["Manioc", "Igname", "Patate douce", "Mangue"], 3, "La mangue est un fruit ; les autres sont des tubercules.", 45),
          short("Dans un code secret, CHAT s'écrit DIBU. Comment s'écrit LION ?", "MJPO", "Chaque lettre est remplacée par la lettre suivante de l'alphabet.", 120),
        ],
      },
      {
        name: "Calcul et lecture de données",
        weight: 50,
        questions: [
          img(mcq("Quelle heure indique cette horloge ?", ["6 h 20", "4 h 30", "5 h 30", "4 h 06"], 1, "La petite aiguille est entre 4 et 5, la grande aiguille sur le 6 : il est 4 h 30.", 45), "horloge-4h30.svg"),
          img(mcq("D'après le graphique, quel mois a eu les ventes les plus élevées ?", ["Mars", "Avril", "Mai", "Janvier"], 2, "Mai : 300 000 FCFA.", 45), "graphique-ventes.svg"),
          img(short("D'après le graphique, de combien de pour cent les ventes ont-elles augmenté entre février et mars ?", "25", "(250 − 200) / 200 = 0,25, soit 25 %.", 150), "graphique-ventes.svg"),
          order("Classez ces nombres du plus petit au plus grand.", ["0,5", "2/3", "0,7", "3/4"], "0,5 < 2/3 (≈ 0,67) < 0,7 < 3/4 (0,75).", 90),
          short("Un robinet remplit une cuve en 6 heures, un second robinet en 3 heures. Ouverts ensemble, en combien d'heures remplissent-ils la cuve ?", "2", "En une heure : 1/6 + 1/3 = 1/2 cuve. Il faut donc 2 heures.", 180),
          short("Un article coûte 12 000 FCFA. Il est soldé à −25 %. Quel est son nouveau prix, en FCFA ?", "9000", "12 000 × 0,75 = 9 000 FCFA.", 90),
          mcq("5 ouvriers construisent un mur en 10 jours. Au même rythme, combien de jours faut-il à 10 ouvriers ?", ["20 jours", "10 jours", "5 jours", "2 jours"], 2, "Deux fois plus d'ouvriers : deux fois moins de temps.", 75),
          order(
            "Remettez dans l'ordre les étapes pour résoudre un problème au travail.",
            ["Comprendre le problème", "Rassembler les informations utiles", "Choisir une solution", "Appliquer la solution", "Vérifier le résultat"],
            "On comprend, on s'informe, on choisit, on agit, puis on vérifie.",
            90,
          ),
        ],
      },
    ],
  },
  {
    profession: "Module : Programmation",
    title: "Programmation — JavaScript",
    level: "CONFIRMED",
    description: "Exercices de code corrigés automatiquement : le candidat écrit une fonction, l'exécute sur des exemples, puis des tests cachés la vérifient.",
    skills: [
      {
        name: "Algorithmique et code (JavaScript)",
        weight: 70,
        questions: [
          code(
            "Écrivez la fonction somme(tableau) qui renvoie la somme des nombres du tableau (0 si le tableau est vide).",
            { functionName: "somme", starter: starter("somme(tableau)"), tests: [{ args: [[1, 2, 3]], expected: 6 }, { args: [[]], expected: 0 }, { args: [[-5, 10, 2.5]], expected: 7.5, hidden: true }, { args: [[100]], expected: 100, hidden: true }] },
            "Une boucle qui additionne chaque élément, ou tableau.reduce((a, b) => a + b, 0).",
            420,
            4,
          ),
          code(
            "Écrivez la fonction ttc(montantHT) qui renvoie le montant TTC avec une TVA de 19 %, arrondi au franc près (Math.round).",
            { functionName: "ttc", starter: starter("ttc(montantHT)"), tests: [{ args: [1000], expected: 1190 }, { args: [2000000], expected: 2380000 }, { args: [15], expected: 18, hidden: true }, { args: [0], expected: 0, hidden: true }] },
            "return Math.round(montantHT * 1.19);",
            420,
            4,
          ),
          code(
            "Écrivez la fonction inverser(texte) qui renvoie le texte écrit à l'envers. Exemple : « Bangui » devient « iugnaB ».",
            { functionName: "inverser", starter: starter("inverser(texte)"), tests: [{ args: ["Bangui"], expected: "iugnaB" }, { args: [""], expected: "" }, { args: ["KTZ Évalue"], expected: "eulavÉ ZTK", hidden: true }] },
            "return texte.split('').reverse().join('');",
            420,
            4,
          ),
          code(
            "Écrivez la fonction compterVoyelles(texte) qui renvoie le nombre de voyelles (a, e, i, o, u, y), en majuscules comme en minuscules.",
            { functionName: "compterVoyelles", starter: starter("compterVoyelles(texte)"), tests: [{ args: ["Bangui"], expected: 3 }, { args: ["RCA"], expected: 1 }, { args: ["Oubangui-Chari"], expected: 7, hidden: true }, { args: [""], expected: 0, hidden: true }] },
            "Parcourir les lettres en minuscules et compter celles qui sont dans « aeiouy ».",
          ),
          code(
            "Écrivez la fonction estPalindrome(mot) qui renvoie true si le mot se lit pareil dans les deux sens (sans tenir compte des majuscules), sinon false.",
            { functionName: "estPalindrome", starter: starter("estPalindrome(mot)"), tests: [{ args: ["kayak"], expected: true }, { args: ["Bangui"], expected: false }, { args: ["Radar"], expected: true, hidden: true }, { args: ["a"], expected: true, hidden: true }] },
            "Comparer le mot en minuscules avec son inverse.",
          ),
          code(
            "Écrivez la fonction plusGrand(tableau) qui renvoie le plus grand nombre d'un tableau non vide, sans utiliser Math.max.",
            { functionName: "plusGrand", starter: starter("plusGrand(tableau)"), tests: [{ args: [[3, 9, 2]], expected: 9 }, { args: [[-4, -1, -7]], expected: -1 }, { args: [[5]], expected: 5, hidden: true }, { args: [[2, 8, 8, 1]], expected: 8, hidden: true }] },
            "Garder le premier élément comme maximum provisoire, puis le remplacer par tout élément plus grand. Attention aux nombres négatifs.",
          ),
          code(
            "Écrivez la fonction classer(scores) qui renvoie un nouveau tableau des scores rangés du plus grand au plus petit.",
            { functionName: "classer", starter: starter("classer(scores)"), tests: [{ args: [[12, 5, 18]], expected: [18, 12, 5] }, { args: [[]], expected: [] }, { args: [[3, 3, 1, 10]], expected: [10, 3, 3, 1], hidden: true }, { args: [[100, 9, 25]], expected: [100, 25, 9], hidden: true }] },
            "return [...scores].sort((a, b) => b - a); — sans la fonction de comparaison, sort() classe comme du texte (100 avant 25).",
          ),
        ],
      },
      {
        name: "Bases du JavaScript",
        weight: 30,
        questions: [
          mcq("Que renvoie typeof [] en JavaScript ?", ['"array"', '"object"', '"list"', '"undefined"'], 1, "Les tableaux sont des objets : typeof renvoie « object » (Array.isArray permet de les reconnaître)."),
          mcq("Quelle méthode ajoute un élément à la fin d'un tableau ?", ["push", "pop", "shift", "slice"], 0, "push ajoute à la fin ; pop retire le dernier élément."),
          tf("En JavaScript, une variable déclarée avec const ne peut pas être réassignée.", true, "const empêche la réassignation (le contenu d'un objet reste modifiable)."),
          mcq("Que vaut 7 % 3 en JavaScript ?", ["1", "2", "0", "2,33"], 0, "% donne le reste de la division entière : 7 = 2 × 3 + 1."),
          short('Que vaut "5" + 2 en JavaScript ? Écrivez le résultat sans guillemets.', "52", "Avec une chaîne, + colle les valeurs : « 52 ».", 90),
        ],
      },
    ],
  },
];

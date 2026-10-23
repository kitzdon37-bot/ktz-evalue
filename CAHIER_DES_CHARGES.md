# KTZ Évalue — Cahier des charges de la version 1

23 octobre 2026

## 1. Présentation du projet

KTZ Évalue permet à une entreprise de générer par IA, en quelques minutes, un test adapté à une offre d'emploi, de l'envoyer aux candidats par lien et de recevoir un classement fiable avant l'entretien.

**Le problème.** En Afrique centrale, les recruteurs reçoivent beaucoup de candidatures et jugent sur CV, sans moyen simple de vérifier les compétences. Les outils existants (TestGorilla, Testlify, AssessFirst) coûtent de 139 à plus de 500 $ par mois, souvent avec un engagement annuel, sont pensés en anglais et pour une bonne connexion, et se paient par carte bancaire.

**Objectifs de la version 1**

- Générer un test complet à partir d'une offre d'emploi, relu et validé par le recruteur.
- Faire passer le test sur téléphone, avec une connexion faible, sans compte candidat.
- Corriger automatiquement et classer les candidats, avec un indice de fiabilité.
- Inviter et relancer par WhatsApp, et encaisser les abonnements par Mobile Money ou carte.
- Relier les résultats à KTZ Emploi : badges « Compétence vérifiée » et KTZ Score.
- Obtenir 10 entreprises clientes actives dans les 3 mois suivant le lancement.

**Cibles.** Entreprises, ONG et organisations internationales d'Afrique francophone, en commençant par la République Centrafricaine. Le produit est un projet séparé de KTZ Emploi, mais relié à lui dès la version 1 (badges, KTZ Score, envoi d'un test depuis une candidature).

## 2. Utilisateurs et parcours

Trois types d'utilisateurs : le recruteur, qui paie et décide ; le candidat, qui passe le test sans compte ; l'administrateur KTZ, qui supervise la plateforme.

| Utilisateur | Compte | Ce qu'il fait |
| --- | --- | --- |
| Recruteur | Oui (email + mot de passe) | Crée les tests, invite les candidats, consulte les résultats |
| Membre d'équipe | Oui, invité par le recruteur | Consulte et note les résultats de son entreprise |
| Candidat | Non | Ouvre un lien, passe le test, voit un message de fin |
| Administrateur KTZ | Oui | Gère les entreprises, les abonnements et les coûts d'IA |

**Parcours du recruteur**

1. Crée son compte entreprise (nom, secteur, pays, logo).
2. Clique sur « Nouveau test », colle l'offre d'emploi ou décrit le poste.
3. Choisit la durée, le niveau et la répartition des questions.
4. Relit les questions générées, en modifie, en ajoute ou en supprime, puis valide.
5. Invite les candidats par email, ou copie un lien à partager sur WhatsApp.
6. Suit qui a commencé et terminé le test.
7. Consulte le classement, ouvre le détail d'un candidat, exporte les résultats.

**Parcours du candidat**

1. Reçoit le lien et l'ouvre sur son téléphone.
2. Voit le nom de l'entreprise, le poste, la durée et les règles du test.
3. Saisit son nom, son email ou son téléphone, et accepte les conditions.
4. Répond aux questions une par une, avec un chronomètre.
5. Termine le test et voit un message de confirmation ; le recruteur est prévenu.

## 3. Périmètre

Toutes les fonctionnalités prévues sont dans la version 1, y compris celles qui étaient d'abord prévues pour plus tard. La V1 sera donc plus longue à construire (environ 16 semaines au lieu de 8, voir section 15) et un peu plus chère à faire tourner.

| Fonctionnalité | Version 1 | Détail |
| --- | --- | --- |
| Compte entreprise, équipe (jusqu'à 3 membres) | Oui | Section 4 |
| Test généré par IA à partir d'une offre, modifiable | Oui | Section 5 |
| QCM, vrai/faux, réponse courte, texte libre, mise en situation | Oui | Section 5 |
| Questions orales enregistrées | Oui | Sections 5 et 6 |
| Lien candidat sans compte, page de test mobile | Oui | Section 6 |
| Chronomètre, ordre aléatoire, détection des sorties de page et du copier-coller | Oui | Section 7 |
| Option webcam (photos pendant le test) | Oui, activable par test | Section 7 |
| Correction automatique et notation IA des réponses écrites et orales | Oui | Section 8 |
| Classement, score par compétence, indice de fiabilité | Oui | Section 8 |
| Export CSV et Excel, rapport PDF par candidat | Oui | Section 8 |
| Bibliothèque de tests prêts à l'emploi | Oui | Section 4 |
| Invitations et relances automatiques par WhatsApp | Oui | Section 4 |
| Paiement en ligne Mobile Money et carte | Oui | Section 4 |
| Badges « Compétence vérifiée » et KTZ Score sur KTZ Emploi | Oui | Section 8 |
| Tests en français et en anglais | Oui | Section 5 |
| API, webhooks et intégrations avec des logiciels de recrutement (ATS) | Oui | Section 4 |

**Hors périmètre :** tests de programmation avec exécution de code, tests de personnalité, application mobile native.

## 4. Espace recruteur

Le recruteur doit pouvoir créer et envoyer un test en moins de 10 minutes, sans formation.

**Compte et entreprise**

- Inscription par email et mot de passe, avec vérification de l'email.
- Fiche entreprise : nom, secteur, pays, ville, logo (affiché au candidat).
- Équipe : inviter jusqu'à 3 membres par email ; rôles « Administrateur » et « Membre ».
- Mot de passe oublié, modification du profil, suppression du compte.

**Création d'un test**

- Source : coller le texte d'une offre, ou remplir intitulé, missions et compétences attendues.
- Réglages : durée totale (15, 30, 45 ou 60 min), niveau (débutant, confirmé, expert), nombre de questions (10 à 30), types de questions cochés, score minimum conseillé.
- Éditeur : liste des questions groupées par compétence ; pour chacune, modifier le texte, les réponses, la bonne réponse, le barème et le temps ; régénérer une question ; ajouter une question à la main ; supprimer ; réordonner.
- Aperçu : voir le test exactement comme le candidat, sur mobile et sur ordinateur.
- États d'un test : brouillon, publié, fermé. Un test publié ne change plus ; pour le modifier, on le duplique.

**Invitations**

- Lien unique par candidat, envoyé par email ou par WhatsApp depuis la plateforme (nom + email ou numéro).
- Import d'une liste de candidats (CSV ou Excel : nom, email, téléphone).
- Lien public du test, à coller dans une offre ou sur WhatsApp, avec un nombre maximal de passages.
- Date limite de passage ; relances automatiques par WhatsApp et email (par exemple 48 h puis 24 h avant la date limite) pour les candidats qui n'ont pas commencé ; relance manuelle possible.
- Depuis KTZ Emploi : bouton « Envoyer un test » sur une candidature, qui crée l'invitation dans KTZ Évalue.

**Suivi et résultats**

- Tableau de bord : tests en cours, nombre d'invités, commencés, terminés, en attente de correction.
- Classement des candidats d'un test (détail en section 8), statut « Retenu / À revoir / Non retenu », note interne.
- Export CSV et Excel des résultats ; rapport PDF par candidat.

**Bibliothèque de tests**

- Modèles prêts à l'emploi par métier (comptable, assistant administratif, commercial, logisticien, chauffeur, agent de terrain humanitaire, informaticien…), à utiliser tels quels ou à adapter.
- Tests de l'entreprise sauvegardés, dupliqués et réutilisés d'un recrutement à l'autre.

**Abonnement et paiement**

- Choix de l'offre et paiement en ligne par Mobile Money (Orange Money, Moov) ou carte bancaire, via un agrégateur de paiement couvrant la RCA.
- Activation automatique après paiement, facture téléchargeable, historique des paiements.
- L'administrateur peut toujours activer une offre à la main (virement, paiement en espèces).

**API et intégrations**

- Clés d'API par entreprise pour créer des invitations et récupérer les résultats depuis un autre logiciel.
- Webhooks : KTZ Évalue prévient le logiciel de l'entreprise quand un candidat termine ou quand ses scores sont prêts.
- Intégration native avec KTZ Emploi ; connecteurs pour d'autres logiciels de recrutement (ATS) selon la demande des clients.

## 5. Génération des tests par IA

L'IA propose un test structuré en moins d'une minute ; le recruteur reste seul à valider ce qui est envoyé aux candidats.

**Entrées :** texte de l'offre ou description du poste, pays, niveau, durée, nombre et types de questions, langue (français ou anglais).

**Sortie attendue** (format structuré, vérifié par le site avant affichage) :

1. Les 3 à 6 compétences clés du poste, avec leur poids dans le score.
2. Pour chaque compétence, des questions avec : type, énoncé, choix possibles, bonne(s) réponse(s), explication, temps conseillé, points.
3. Pour les questions ouvertes, une grille de notation : critères, points par critère, exemple de bonne réponse.
4. Une réserve d'environ 50 % de questions en plus, pour que chaque candidat reçoive une version différente.

**Types de questions en V1**

| Type | Exemple | Correction |
| --- | --- | --- |
| QCM, une ou plusieurs réponses | Quel document justifie un paiement fournisseur ? | Automatique |
| Vrai / faux | La TVA s'applique aux salaires. | Automatique |
| Réponse courte ou chiffrée | Calculez la marge sur ce bon de commande. | Automatique (valeur attendue + tolérance) |
| Texte libre | Rédigez un e-mail au fournisseur pour un retard. | IA, avec la grille |
| Mise en situation | Le convoi est bloqué à Bambari : que faites-vous ? | IA, avec la grille |
| Question orale (1 à 2 min enregistrées) | Présentez en anglais votre dernière mission à un bailleur. | Transcription automatique, puis IA avec la grille ; enregistrement écoutable par le recruteur |

**Règles de qualité demandées à l'IA** : privilégier les cas pratiques plutôt que les définitions ; adapter au contexte local (OHADA, FCFA, procédures des bailleurs, terrain humanitaire) ; aucune question sur l'âge, la religion, l'ethnie, la santé ou la situation familiale ; une seule bonne réponse sans ambiguïté pour les QCM.

**Contrôles automatiques avant affichage** : format complet, chaque QCM a une bonne réponse, pas de doublon, temps total cohérent avec la durée choisie. Un test non conforme est régénéré une fois, puis signalé au recruteur.

## 6. Page de test du candidat

Le test doit pouvoir se passer en entier sur un téléphone Android d'entrée de gamme, avec une connexion 3G instable.

**Accès**

- Lien unique, valable jusqu'à la date limite, utilisable une seule fois (un passage par lien).
- Lien public : le candidat saisit nom, email ou téléphone ; un même email ou téléphone ne peut passer le test qu'une fois.
- Avant de commencer : logo et nom de l'entreprise, poste, durée, nombre de questions, règles (pas de retour en arrière, sorties de page enregistrées), case à cocher d'accord sur l'utilisation des données.

**Déroulé**

- Une question par écran, une barre de progression, le temps restant (pour la question et pour le test).
- Bouton « Valider » ; pas de retour aux questions précédentes.
- Temps écoulé : la réponse en cours est enregistrée et la question suivante s'affiche.
- Fin du test : message de confirmation. Le candidat voit son score seulement si le recruteur l'a autorisé. S'il a un compte KTZ Emploi et qu'il réussit, il peut ajouter le badge obtenu à son profil.

**Connexion faible**

- Page initiale légère (moins de 200 Ko), sans image lourde ni police téléchargée.
- Chaque réponse est enregistrée dès sa validation ; si l'envoi échoue, elle est gardée sur le téléphone et renvoyée automatiquement.
- Coupure de connexion ou téléphone éteint : le candidat rouvre le lien et reprend à la question où il s'est arrêté. Le chronomètre global, lui, continue de tourner (côté serveur), pour éviter les pauses volontaires.
- Compatible avec les navigateurs Android anciens (Chrome des 4 dernières années) et Opera Mini en mode léger, à vérifier en recette.
- Accessibilité : texte lisible sans zoom, boutons assez grands pour le doigt, option de temps majoré (+50 %) activable par le recruteur pour un candidat.

**Questions orales et webcam (si le test les utilise)**

- Vérification du micro et, si besoin, de la caméra sur l'écran d'accueil, avec un essai.
- Enregistrement audio compressé, envoyé par morceaux pour supporter une connexion faible ; si l'envoi échoue, il reprend automatiquement.
- Sans micro ou caméra disponible, le candidat est prévenu avant de commencer et le recruteur en est informé.

## 7. Anti-triche et indice de fiabilité

On ne bloque pas le candidat (un navigateur ne le permet pas) : on rend la triche difficile, on enregistre les signaux et on les montre au recruteur, qui décide.

**Prévention**

- Version différente par candidat : questions tirées de la réserve, ordre des questions et des réponses mélangé.
- Temps limité par question, sans retour en arrière.
- Copier-coller désactivé dans les champs de réponse ; énoncés non sélectionnables.
- Plein écran demandé au début sur ordinateur.
- Avertissement avant de quitter ou de recharger la page.
- Les bonnes réponses ne sont jamais envoyées au téléphone du candidat : la correction se fait uniquement sur le serveur.

**Signaux enregistrés** (avec l'heure et la question concernée)

| Signal | Comment il est détecté | Poids dans l'indice |
| --- | --- | --- |
| Sortie de l'onglet ou de l'application | La page n'est plus visible | Moyen, plus fort au-delà de 10 secondes |
| Sortie du plein écran (ordinateur) | Fin du mode plein écran | Faible |
| Texte collé dans une réponse | Tentative de collage | Fort |
| Réponse anormalement rapide | Moins de 20 % du temps conseillé sur une question longue | Moyen |
| Changement d'appareil en cours de test | Autre navigateur ou appareil détecté | Moyen |
| Texte très proche de celui d'un autre candidat | Comparaison des réponses écrites d'un même test | Fort |

**Indice de fiabilité** : « Élevée », « À vérifier » ou « Faible », avec la liste des signaux, par exemple « 2 sorties d'onglet (14 s et 3 s), 1 texte collé ». Aucun candidat n'est exclu automatiquement. Le rapport suggère 2 ou 3 questions à reposer en entretien.

Le candidat est prévenu avant de commencer que ces signaux sont enregistrés.

**Option webcam** (activable par test, désactivée par défaut)

- Une photo légère toutes les 30 à 60 secondes, plutôt qu'une vidéo, pour économiser les données mobiles.
- Signaux ajoutés à l'indice : aucun visage visible, plusieurs personnes visibles, caméra coupée.
- Le recruteur consulte les photos dans la fiche du candidat ; elles sont supprimées automatiquement 90 jours après le test.
- Accord explicite du candidat demandé avant le test ; aucune reconnaissance faciale.

## 8. Correction, scores et résultats

**Correction**

- QCM, vrai/faux et réponses courtes à valeur exacte : corrigés automatiquement par le serveur, sans IA, dès l'envoi.
- Réponses écrites et études de cas : notées par l'IA à partir de la grille de correction validée par le recruteur. Pour chaque réponse, l'IA donne une note, une justification de 2 ou 3 phrases et les points de la grille atteints ou manqués.
- Si l'IA est indisponible, ces réponses passent dans une file d'attente et sont corrigées dès son retour. Le résultat affiche « Correction en cours » en attendant.
- Le recruteur peut modifier toute note donnée par l'IA ; la modification est enregistrée avec son nom.

**Scores**

- Score global sur 100, calculé avec le poids de chaque compétence défini à la création du test.
- Score par compétence, affiché en barres.
- Seuil de réussite choisi par le recruteur (60 par défaut) : « Réussi » ou « Non réussi ».

**Résultats côté recruteur**

- Classement des candidats d'un test, triable par score global, par compétence, par fiabilité ou par date.
- Fiche candidat : scores, indice de fiabilité, temps passé par question, chaque réponse avec la note et la justification de l'IA, enregistrements oraux et photos webcam.
- Statuts : « À examiner », « Retenu », « Entretien », « Écarté ».
- Comparaison côte à côte de 2 à 4 candidats.
- Export CSV et Excel du classement, rapport PDF d'un candidat (logo de l'entreprise, scores, fiabilité, points forts et points à vérifier en entretien).

**Côté candidat** : message de fin et confirmation par email ou WhatsApp. L'affichage du score au candidat est un choix du recruteur.

**Badges et KTZ Score sur KTZ Emploi**

- Un candidat qui atteint le seuil sur une compétence obtient un badge « Compétence vérifiée » (par exemple « Comptabilité OHADA — vérifiée par KTZ Évalue »), avec la date.
- Le KTZ Score résume les badges et scores obtenus ; il apparaît sur le profil KTZ Emploi du candidat et dans la CVthèque des recruteurs.
- Le candidat choisit d'afficher ou non chaque badge ; rien n'est publié sans son accord, et l'entreprise qui a fait passer le test peut refuser que ses tests donnent des badges.
- Chaque badge a une page de vérification publique, pour qu'un recruteur puisse le contrôler.

## 9. Liste des écrans

| # | Écran | Pour qui | Contenu principal |
| --- | --- | --- | --- |
| 1 | Accueil (site public) | Visiteurs | Présentation, exemples de tests, tarifs, bouton « Essayer gratuitement » |
| 2 | Tarifs | Visiteurs | Offres en XAF, comparaison, questions fréquentes |
| 3 | Inscription / connexion | Recruteurs | Email + mot de passe, nom de l'entreprise, lien magique |
| 4 | Tableau de bord | Recruteurs | Tests en cours, invitations envoyées, tests terminés à examiner, crédits restants |
| 5 | Créer un test — étape 1 | Recruteurs | Poste, niveau, offre d'emploi collée ou téléversée, durée, langue, ou départ d'un modèle |
| 6 | Créer un test — étape 2 | Recruteurs | Compétences proposées par l'IA, poids, types de questions (dont orales) |
| 7 | Créer un test — étape 3 | Recruteurs | Relecture des questions et grilles : modifier, régénérer, supprimer, ajouter |
| 8 | Paramètres du test | Recruteurs | Seuil de réussite, anti-triche, webcam, date limite, score visible ou non, badges |
| 9 | Inviter des candidats | Recruteurs | Emails ou numéros WhatsApp, import CSV/Excel, lien partageable, relances automatiques |
| 10 | Résultats d'un test | Recruteurs | Classement, filtres, statuts, export CSV/Excel |
| 11 | Fiche résultat candidat | Recruteurs | Scores, fiabilité, réponses, enregistrements, photos webcam, notes IA modifiables, rapport PDF |
| 12 | Comparaison | Recruteurs | 2 à 4 candidats côte à côte |
| 13 | Bibliothèque de tests | Recruteurs | Modèles par métier, tests sauvegardés, duplication |
| 14 | Entreprise et équipe | Recruteurs | Logo, couleurs, membres invités, rôles |
| 15 | Abonnement et paiement | Recruteurs | Choix de l'offre, paiement Mobile Money ou carte, factures, consommation |
| 16 | API et intégrations | Recruteurs | Clés d'API, webhooks, connexion KTZ Emploi et autres logiciels |
| 17 | Accueil du test | Candidats | Nom de l'entreprise, durée, règles, consentement, essai micro et caméra |
| 18 | Passage du test | Candidats | Une question à la fois, minuteur, barre de progression, sauvegarde automatique, enregistrement oral |
| 19 | Fin du test | Candidats | Confirmation d'envoi, score si autorisé, ajout du badge à KTZ Emploi |
| 20 | Vérification d'un badge | Public | Nom du candidat, compétence, date, entreprise qui a fait passer le test |
| 21 | Administration | Équipe KTZ | Entreprises, paiements, consommation IA, file de correction, envois WhatsApp, incidents |

## 10. Données à enregistrer

| Élément | Informations principales |
| --- | --- |
| Entreprise | Nom, logo, couleurs, pays, offre souscrite, crédits restants |
| Membre | Nom, email, mot de passe chiffré, rôle (propriétaire, recruteur, lecteur), entreprise |
| Test | Titre, poste, niveau, langue, durée, seuil de réussite, réglages anti-triche et webcam, badges autorisés, statut (brouillon, actif, archivé) |
| Modèle de bibliothèque | Métier, niveau, langue, compétences et questions de départ |
| Compétence | Nom, poids dans le score, test concerné |
| Question | Type, énoncé, choix, bonne réponse ou grille de correction, difficulté, temps conseillé, compétence, origine (IA, banque, manuelle) |
| Invitation | Email ou téléphone du candidat, canal (email, WhatsApp, KTZ Emploi), lien à usage unique, date d'expiration, relances envoyées, statut |
| Passage | Candidat, questions tirées et leur ordre, heure de début et de fin, appareil, scores, indice de fiabilité, statut recruteur |
| Réponse | Question, contenu ou enregistrement audio et sa transcription, temps passé, note, justification IA, note modifiée par le recruteur et par qui |
| Événement d'intégrité | Type (sortie d'onglet, collage, aucun visage…), heure, durée, question |
| Photo webcam | Passage, heure, fichier, date de suppression prévue |
| Badge | Candidat, compétence, score, date, test d'origine, visible ou non, adresse de vérification |
| Message WhatsApp / email | Destinataire, modèle, date, statut d'envoi |
| Abonnement / paiement | Offre, période, montant en XAF, moyen de paiement, référence de transaction, facture |
| Clé d'API / webhook | Entreprise, clé chiffrée, adresse du webhook, derniers appels |
| Consommation IA | Opération (génération, correction, transcription), entreprise, fournisseur, tokens ou minutes, coût estimé, succès ou échec |

**Conservation** : les réponses et événements d'un candidat sont supprimés 12 mois après le test, les photos webcam et enregistrements audio après 90 jours, ou plus tôt à la demande du candidat ou de l'entreprise. Les badges restent tant que le candidat les garde.

## 11. Architecture technique

KTZ Évalue est un projet séparé de KTZ Emploi : son propre dépôt GitHub, son propre projet Vercel et sa propre base de données. Une panne ou une surcharge de l'un n'affecte pas l'autre.

| Brique | Choix | Rôle |
| --- | --- | --- |
| Site et application | Next.js + Tailwind, hébergé sur Vercel Pro | Pages publiques, espace recruteur, page de test, API |
| Base de données | Nouveau projet Supabase Pro (Postgres) avec Prisma | Tests, questions, passages, résultats, badges |
| IA principale | Claude (Anthropic) | Génération des tests et correction des réponses écrites et orales |
| IA de secours | Un second fournisseur configuré à l'avance | Prend le relais si Claude ne répond pas |
| Transcription audio | Service de reconnaissance vocale (à choisir) | Transforme les réponses orales en texte avant correction |
| Emails | Resend | Invitations, rappels, confirmations, factures |
| WhatsApp | WasenderAPI (déjà utilisé par KTZ Emploi) ou l'API WhatsApp Business officielle | Invitations, relances, confirmations |
| Paiement | Agrégateur Mobile Money et carte couvrant la RCA (à choisir) | Encaissement des abonnements, confirmation automatique |
| Fichiers | Vercel Blob | Logos, offres téléversées, rapports PDF, enregistrements audio, photos webcam |
| Tâches de fond | Tâche planifiée Vercel (cron) | File de correction, relances, expiration des liens, suppression des données anciennes |
| Lien avec KTZ Emploi | API sécurisée entre les deux sites | Envoi d'un test depuis une candidature, badges et KTZ Score sur les profils |

**Flux principal**

1. Le recruteur décrit le poste ou part d'un modèle → le serveur appelle l'IA → les questions sont enregistrées en base.
2. Le recruteur relit et valide → les invitations partent par email, WhatsApp ou depuis KTZ Emploi.
3. Le candidat passe le test : la page charge une question à la fois et envoie chaque réponse (texte, audio, photos) au serveur.
4. Le serveur corrige les questions fermées tout de suite ; les réponses orales sont transcrites, puis les réponses écrites et orales passent dans la file de correction IA.
5. Le recruteur consulte le classement dès que les scores sont prêts ; les webhooks préviennent ses autres logiciels ; les badges sont proposés aux candidats qui ont réussi.

L'IA n'intervient qu'aux étapes 1 et 4. Le passage du test (étape 3) n'en dépend jamais.

## 12. Exigences non fonctionnelles

**Performance (connexions lentes et téléphones Android d'entrée de gamme)**

- Page de test : moins de 200 Ko au premier chargement, affichée en moins de 3 secondes en 3G.
- Une question à la fois ; chaque réponse est sauvegardée dès qu'elle est saisie. Une coupure réseau ne fait rien perdre : le candidat reprend où il en était, le minuteur continue côté serveur.
- Pages publiques mises en cache ; très peu de calcul serveur par visite, pour éviter les dépassements de consommation vus sur KTZ Emploi.

**Sécurité et confidentialité**

- Liens de test à usage unique, avec date d'expiration.
- Chaque entreprise ne voit que ses tests et ses candidats, contrôlé côté serveur sur chaque requête et sur chaque appel d'API.
- Bonnes réponses et grilles jamais envoyées au navigateur du candidat.
- Consentement du candidat avant le test, séparé pour la webcam et le micro ; politique de confidentialité et droit de suppression.
- Photos et enregistrements accessibles uniquement à l'entreprise concernée, par liens temporaires.
- Paiements : aucune donnée de carte stockée par KTZ Évalue ; confirmation de paiement vérifiée auprès de l'agrégateur.
- Aucune clé secrète dans le code ; mots de passe et clés d'API chiffrés ; limitation du nombre de tentatives de connexion et d'appels d'API.

**Coûts**

- Plafond de dépense IA par entreprise et plafond mensuel global.
- Alerte quand le crédit IA passe sous un seuil.

**Accessibilité et langue** : interface en français, utilisable au doigt sur petit écran, textes lisibles et contrastes suffisants. Tests possibles en français ou en anglais.

## 13. Fonctionnement en cas de panne de l'IA

| Situation | Ce qui se passe | Ce que voit l'utilisateur |
| --- | --- | --- |
| L'IA ne répond pas pendant la création d'un test | 2 nouvelles tentatives, puis bascule sur le fournisseur de secours | Un message « Génération plus longue que prévu » |
| Les deux fournisseurs sont indisponibles | Proposition de partir d'un modèle de la banque de questions ou d'écrire les questions à la main | « L'IA est momentanément indisponible. Utilisez un modèle ou réessayez plus tard. » |
| Panne pendant qu'un candidat passe le test | Aucun effet : les questions sont déjà en base | Rien |
| Panne au moment de la correction | Les réponses écrites attendent dans la file et sont corrigées au retour de l'IA | « Correction en cours » dans les résultats |
| Crédit IA épuisé | Alerte à l'équipe KTZ avant épuisement ; plafond de dépense qui empêche les mauvaises surprises | Recruteurs : génération suspendue, tests existants utilisables |
| Réponse de l'IA incorrecte ou mal formée | Vérification automatique du format ; question rejetée et régénérée | Rien |

**Garde-fous permanents**

- Le recruteur relit et valide chaque test avant l'envoi : une question fausse ne part jamais sans lui.
- Les notes de l'IA sont modifiables par le recruteur.
- La banque de questions grandit avec chaque test validé (sans les données des entreprises) : plus le service tourne, moins il dépend de l'IA.

Ce fonctionnement évite ce qui s'est passé sur le chatbot de KTZ Emploi quand le crédit Anthropic s'est épuisé.

## 14. Critères de réussite et recette

**La V1 est acceptée quand :**

- Un recruteur crée un test complet à partir d'une offre d'emploi en moins de 10 minutes, relecture comprise.
- 9 questions générées sur 10 sont jugées utilisables sans modification, sur 5 métiers testés (comptable, assistant administratif, commercial, logisticien, informaticien), en français et en anglais.
- Un candidat passe le test sur un Android d'entrée de gamme en 3G sans blocage ; après une coupure réseau, il reprend sans perte, y compris pendant une réponse orale.
- Les notes de l'IA sur les réponses écrites et orales diffèrent de moins de 15 points de celles d'un recruteur sur un échantillon de 30 réponses.
- Une sortie d'onglet, un collage et, avec la webcam, un visage absent apparaissent bien dans le rapport du recruteur.
- IA coupée volontairement : les tests en cours continuent, la correction reprend seule au retour.
- Une entreprise ne peut ni voir ni modifier les données d'une autre (essai avec deux comptes, sur le site et par l'API).
- Le lien d'un candidat ne marche qu'une fois et expire à la date prévue.
- Une invitation et une relance WhatsApp arrivent bien ; un paiement Mobile Money réel active l'offre sans intervention.
- Un test envoyé depuis KTZ Emploi revient avec ses résultats, et le badge obtenu s'affiche sur le profil du candidat seulement après son accord.
- Un webhook de test reçoit bien les résultats.

**Pilote** : 3 à 5 entreprises partenaires (par exemple des recruteurs déjà présents sur KTZ Emploi) utilisent KTZ Évalue gratuitement pendant un mois, sur de vrais recrutements, en échange de leurs retours.

**Indicateurs suivis après le lancement** : tests créés, taux de candidats qui terminent le test, temps moyen de création, satisfaction des recruteurs, coût IA par test, entreprises payantes.

## 15. Planning, budget mensuel et prérequis

**Planning indicatif (environ 16 semaines)**

| Semaines | Travail | Résultat |
| --- | --- | --- |
| 1 | Mise en place : dépôt, projet Vercel, base de données, comptes recruteurs | Connexion et tableau de bord vides |
| 2–3 | Création de test avec l'IA, relecture, bibliothèque de modèles | Un recruteur peut créer et valider un test |
| 4–5 | Invitations par email et WhatsApp, relances, page de test candidat | Un candidat peut passer un test sur téléphone |
| 6–7 | Correction, scores, anti-triche, indice de fiabilité, exports CSV/Excel/PDF | Classement et fiche résultat |
| 8–9 | Questions orales, transcription, option webcam | Tests oraux et surveillance par photos |
| 10 | Tests en anglais, secours IA, file de correction | Service robuste |
| 11–12 | Paiement Mobile Money et carte, factures, site public et tarifs | Abonnements payés en ligne |
| 13 | Lien avec KTZ Emploi : envoi de test, badges, KTZ Score | Résultats visibles sur KTZ Emploi |
| 14 | API, webhooks, premiers connecteurs | Intégration avec d'autres logiciels |
| 15 | Recette (section 14) et corrections | V1 acceptée |
| 16 | Pilote avec 3 à 5 entreprises | Retours pour ajuster avant le lancement payant |

**Budget mensuel estimé (à confirmer)**

| Poste | Coût |
| --- | --- |
| Vercel Pro (déjà payé pour KTZ Emploi, peut accueillir ce projet) | 20 $ (partagés) |
| Supabase Pro, nouveau projet | 25 $ |
| IA (génération + correction), selon le nombre de tests | quelques centimes à quelques dizaines de centimes par test ; plafond mensuel à fixer |
| Transcription des réponses orales | quelques centimes par minute d'audio ; plafond à fixer |
| Stockage des enregistrements et photos (Vercel Blob) | faible au début, augmente avec la webcam et l'oral |
| WhatsApp (WasenderAPI) | abonnement existant de KTZ Emploi ou second numéro, à vérifier |
| Paiement en ligne | pas d'abonnement en général, une commission sur chaque paiement reçu |
| Resend (emails) | gratuit au début, payant au-delà du quota gratuit |
| Nom de domaine ktzevalue.com | 11,25 $ par an |

**Prérequis avant de commencer**

- Recharger le crédit Anthropic (aujourd'hui épuisé) et fixer un plafond de dépense.
- Créer le nouveau projet Supabase (séparé de celui de KTZ Emploi).
- Décider de l'achat du domaine.
- Choisir le fournisseur d'IA de secours et le service de transcription.
- Choisir l'agrégateur de paiement et ouvrir le compte marchand (documents de l'entreprise demandés, délai de validation à prévoir).
- Décider du numéro WhatsApp utilisé pour les invitations.
- Trouver les entreprises du pilote.

## 16. Questions ouvertes

| # | Question | Proposition | Décision |
| --- | --- | --- | --- |
| 1 | Prix en XAF des offres | Essai gratuit (1 test, 5 candidats), puis offres par nombre de candidats évalués par mois ; webcam et oral réservés aux offres supérieures | À décider |
| 2 | Objectif commercial | 10 entreprises payantes dans les 3 mois après le lancement | À confirmer |
| 3 | Nom de domaine | Acheter ktzevalue.com (11,25 $/an) | À décider |
| 4 | Le candidat voit-il son score ? | Choix du recruteur, « non » par défaut | À confirmer |
| 5 | Fournisseur d'IA de secours et de transcription | À choisir selon le prix et la qualité en français | À décider |
| 6 | Langues des tests | Français et anglais ; sango plus tard ? | À confirmer |
| 7 | Agrégateur de paiement | À choisir parmi ceux qui couvrent Orange Money et Moov en RCA | À décider |
| 8 | Numéro WhatsApp | Même numéro que KTZ Emploi ou numéro dédié à KTZ Évalue | À décider |
| 9 | Badges | Valables combien de temps (par exemple 2 ans) ? | À confirmer |

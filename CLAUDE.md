# KTZ Évalue — consignes pour Claude Code

KTZ Évalue est une plateforme de tests de recrutement générés par IA, pour les entreprises
d'Afrique francophone (d'abord la République Centrafricaine). Le cahier des charges complet
est dans `CAHIER_DES_CHARGES.md` : c'est la référence pour toutes les fonctionnalités, les
écrans (section 9), les données (section 10), l'architecture (section 11) et le planning
(section 15). Le lire avant de commencer une étape.

## Projet

- Projet séparé de KTZ Emploi (dépôt `kitzdon37-bot/ktz-emploi`) : ne jamais modifier ce
  dépôt depuis ici. Le lien entre les deux sites passe par une API (étape 13 du planning).
- Propriétaire : Donald KITEZE (kitzdon37@gmail.com). Il n'est pas développeur : expliquer
  simplement, en français, ce qui a été fait et ce qu'il doit faire lui-même.

## Pile technique

- Next.js (App Router, TypeScript) + Tailwind CSS, déployé sur Vercel.
- La version de Next.js installée peut différer de ce que tu connais : lire le guide
  concerné dans `node_modules/next/dist/docs/` avant d'écrire du code, et respecter les
  avertissements de dépréciation (par exemple `middleware` devenu `proxy`, `params` qui est une
  Promise).
- Base de données : Postgres sur un **nouveau** projet Supabase (pas celui de KTZ Emploi),
  via Prisma.
- IA : SDK Anthropic (Claude) côté serveur uniquement, avec un fournisseur de secours
  derrière une même interface (`src/lib/ai/`). Sorties de l'IA validées avec un schéma (zod)
  avant enregistrement.
- Emails : Resend. WhatsApp : WasenderAPI. Fichiers : Vercel Blob. Tâches de fond : cron Vercel.

## Règles

- Interface entièrement en français ; tests en français ou en anglais.
- Mobile d'abord : la page de test candidat doit peser moins de 200 Ko, marcher en 3G et sur
  de vieux Android, sauvegarder chaque réponse et reprendre après une coupure.
- Les bonnes réponses et les grilles de correction ne sont jamais envoyées au navigateur du
  candidat. Toute la correction se fait côté serveur.
- Chaque requête et chaque appel d'API vérifie que l'utilisateur n'accède qu'aux données de
  son entreprise.
- Aucune clé ni mot de passe dans le code : tout passe par `.env.local` (jamais commité) et
  un `.env.example` sans valeurs. Ne jamais afficher une clé secrète dans le terminal.
- Limiter le calcul serveur (cache des pages publiques, pas de requêtes inutiles) : KTZ
  Emploi a déjà été suspendu pour dépassement de consommation.
- Demander avant : de créer un compte ou un service payant, de déployer en production,
  d'acheter un domaine, ou de supprimer des données.
- Avancer étape par étape selon le planning (section 15). À la fin de chaque étape : lancer
  `npm run build` et les tests, faire un commit, puis résumer en quelques lignes ce qui
  marche et ce qui reste à faire.

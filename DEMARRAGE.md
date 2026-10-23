# Démarrer KTZ Évalue avec Claude Code (PowerShell)

## 1. Préparer le dossier

1. Décompresse `ktz-evalue.zip` dans tes Documents. Tu obtiens un dossier `ktz-evalue`
   qui contient `CLAUDE.md`, `CAHIER_DES_CHARGES.md` et ce fichier.
2. Ouvre PowerShell et tape :

```powershell
cd $HOME\Documents\ktz-evalue
claude
```

## 2. Coller ce message dans Claude Code

```text
Lis CLAUDE.md puis CAHIER_DES_CHARGES.md en entier. On démarre la conception de KTZ Évalue.

1. Propose-moi d'abord un plan technique court : structure des dossiers, liste des pages
   (section 9) et schéma Prisma complet couvrant toutes les données de la section 10.
   Attends mon accord avant de coder.
2. Ensuite, réalise l'étape 1 du planning (section 15) : crée le projet Next.js avec
   TypeScript et Tailwind dans ce dossier, installe Prisma, écris le schéma, ajoute
   l'inscription et la connexion des recruteurs, et un tableau de bord vide.
   Crée un fichier .env.example (sans valeurs) et dis-moi quelles valeurs je dois mettre
   dans .env.local et où les trouver.
3. Initialise git, fais un premier commit, puis explique-moi simplement comment voir le
   site sur mon ordinateur.
```

## 3. Ce dont Claude Code aura besoin de toi

- **Node.js** installé (Claude Code te le dira s'il manque).
- **Supabase** : crée un nouveau projet (séparé de KTZ Emploi), puis copie l'adresse de
  connexion de la base dans `.env.local` quand Claude Code te le demande.
- **Anthropic** : recharge le crédit et crée une clé d'API pour ce projet, à mettre dans
  `.env.local`.
- **GitHub et Vercel** : à l'étape du déploiement, Claude Code te demandera de créer le
  dépôt `ktz-evalue` et le projet Vercel.

Ne colle jamais une clé secrète dans la conversation : mets-la directement dans `.env.local`.

## 4. Ensuite

Quand une étape est terminée, demande la suivante, par exemple :
« Passe à l'étape 2-3 du planning : création de test avec l'IA et bibliothèque de modèles. »

# KTZ Évalue

Plateforme de tests de recrutement générés par IA. Voir `CAHIER_DES_CHARGES.md`.

## Lancer le site sur son ordinateur

1. Copier `.env.example` en `.env.local` et le remplir.
   Pour développer sans Supabase : `npx prisma dev --name ktz-evalue --detach` lance une base
   locale gratuite ; mettre l'adresse `postgres://…` qu'elle affiche dans `DATABASE_URL` et `DIRECT_URL`.
2. `npm install`
3. `npm run db:deploy` (crée les tables dans la base, une seule fois)
4. `npm run dev`, puis ouvrir http://localhost:3000

## Commandes utiles

- `npm run dev` : site en mode développement
- `npm run build` : vérifie que le site se construit sans erreur
- `npm test` : tests automatiques
- `npm run db:migrate` : après une modification de `prisma/schema.prisma`
- `npm run db:studio` : voir le contenu de la base dans le navigateur

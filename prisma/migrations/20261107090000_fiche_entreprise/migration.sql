-- Fiche entreprise enrichie : logo enregistré en base, présentation, site web, contact.
ALTER TABLE "Company" ADD COLUMN "logoData" TEXT;
ALTER TABLE "Company" ADD COLUMN "description" TEXT;
ALTER TABLE "Company" ADD COLUMN "website" TEXT;
ALTER TABLE "Company" ADD COLUMN "contactEmail" TEXT;
ALTER TABLE "Company" ADD COLUMN "contactPhone" TEXT;

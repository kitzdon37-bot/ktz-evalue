-- Nouveaux types de question : remettre dans l'ordre (interactif) et exercice de code.
ALTER TYPE "QuestionType" ADD VALUE IF NOT EXISTS 'ORDERING';
ALTER TYPE "QuestionType" ADD VALUE IF NOT EXISTS 'CODE';

-- Illustration facultative d'une question (chemin /illustrations/... ou image compressée data:image/...).
ALTER TABLE "Question" ADD COLUMN "image" TEXT;

-- Journal des connexions (espace administrateur) : lieu approximatif et activité des sessions.
ALTER TABLE "Session" ADD COLUMN "method" TEXT;
ALTER TABLE "Session" ADD COLUMN "country" TEXT;
ALTER TABLE "Session" ADD COLUMN "region" TEXT;
ALTER TABLE "Session" ADD COLUMN "city" TEXT;
ALTER TABLE "Session" ADD COLUMN "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE "LoginEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "reason" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LoginEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "LoginEvent_createdAt_idx" ON "LoginEvent"("createdAt");
CREATE INDEX "LoginEvent_userId_createdAt_idx" ON "LoginEvent"("userId", "createdAt");
CREATE INDEX "Session_lastSeenAt_idx" ON "Session"("lastSeenAt");
ALTER TABLE "LoginEvent" ADD CONSTRAINT "LoginEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

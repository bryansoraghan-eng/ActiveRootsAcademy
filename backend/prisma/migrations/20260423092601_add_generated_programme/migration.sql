-- CreateTable
CREATE TABLE "GeneratedProgramme" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "classLevel" TEXT NOT NULL,
    "totalWeeks" INTEGER NOT NULL,
    "skillFocus" TEXT NOT NULL,
    "equipment" TEXT NOT NULL,
    "weeks" TEXT NOT NULL,
    "schoolId" TEXT,
    "generatedBy" TEXT NOT NULL DEFAULT 'ai',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GeneratedProgramme_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

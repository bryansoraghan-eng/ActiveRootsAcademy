-- CreateTable
CREATE TABLE "MovementBreakSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "minBreaks" INTEGER NOT NULL DEFAULT 4,
    "duration" INTEGER NOT NULL DEFAULT 2,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MovementBreakSettings_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MovementBreakSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT,
    "teacherId" TEXT,
    "ageRange" TEXT NOT NULL DEFAULT '6-8',
    "mode" TEXT NOT NULL DEFAULT 'mixed',
    "slots" TEXT NOT NULL DEFAULT '[]',
    "generated" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MovementBreakSchedule_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "MovementBreakSettings_schoolId_key" ON "MovementBreakSettings"("schoolId");

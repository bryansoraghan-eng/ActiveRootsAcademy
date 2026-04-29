-- CreateTable
CREATE TABLE "FMSSkill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ageGroups" TEXT NOT NULL,
    "equipment" TEXT NOT NULL,
    "spaceNeeded" TEXT NOT NULL DEFAULT 'both',
    "tags" TEXT NOT NULL,
    "isScoilnet" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FMSProgression" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "skillId" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ageGroup" TEXT,
    "difficulty" INTEGER NOT NULL,
    "notes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FMSProgression_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "FMSSkill" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FMSCue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "skillId" TEXT NOT NULL,
    "cue" TEXT NOT NULL,
    "ageGroup" TEXT,
    "cueType" TEXT NOT NULL DEFAULT 'verbal',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FMSCue_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "FMSSkill" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FMSCommonError" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "skillId" TEXT NOT NULL,
    "error" TEXT NOT NULL,
    "correction" TEXT NOT NULL,
    "ageGroup" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FMSCommonError_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "FMSSkill" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LessonPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "classLevel" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "skillFocus" TEXT NOT NULL,
    "warmUp" TEXT NOT NULL,
    "mainActivity" TEXT NOT NULL,
    "coolDown" TEXT NOT NULL,
    "equipment" TEXT,
    "notes" TEXT,
    "schoolId" TEXT,
    "generatedBy" TEXT NOT NULL DEFAULT 'ai',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LessonPlan_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "FMSSkill_name_key" ON "FMSSkill"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FMSSkill_slug_key" ON "FMSSkill"("slug");

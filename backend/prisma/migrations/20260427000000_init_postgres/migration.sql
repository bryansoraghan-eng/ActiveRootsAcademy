-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "schoolCode" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "principal" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "schoolId" TEXT,
    "permissions" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "permissions" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "yearGroup" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "teacherId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgrammeBlock" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgrammeBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "coachId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "fmsScores" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "programmeId" TEXT NOT NULL,
    "coachId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coach" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "specialisation" TEXT,
    "isPlacement" BOOLEAN NOT NULL DEFAULT false,
    "permissions" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coach_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Placement" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "hours" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Placement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlacementStudent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "yeartarget" TEXT NOT NULL,
    "collegeTarget" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlacementStudent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovementBreak" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "ageGroup" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovementBreak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionLesson" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "resources" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NutritionLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionResource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NutritionResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FMSSkill" (
    "id" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FMSSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FMSProgression" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ageGroup" TEXT,
    "difficulty" INTEGER NOT NULL,
    "notes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FMSProgression_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FMSCue" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "cue" TEXT NOT NULL,
    "ageGroup" TEXT,
    "cueType" TEXT NOT NULL DEFAULT 'verbal',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FMSCue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FMSCommonError" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "error" TEXT NOT NULL,
    "correction" TEXT NOT NULL,
    "ageGroup" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FMSCommonError_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovementBreakSettings" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "minBreaks" INTEGER NOT NULL DEFAULT 4,
    "duration" INTEGER NOT NULL DEFAULT 2,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MovementBreakSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovementBreakSchedule" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT,
    "teacherId" TEXT,
    "ageRange" TEXT NOT NULL DEFAULT '6-8',
    "mode" TEXT NOT NULL DEFAULT 'mixed',
    "slots" TEXT NOT NULL DEFAULT '[]',
    "generated" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MovementBreakSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "mealTypes" TEXT NOT NULL,
    "ageGroups" TEXT NOT NULL,
    "allergens" TEXT NOT NULL,
    "preferences" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FoodItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonPlan" (
    "id" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedProgramme" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "classLevel" TEXT NOT NULL,
    "totalWeeks" INTEGER NOT NULL,
    "skillFocus" TEXT NOT NULL,
    "equipment" TEXT NOT NULL,
    "weeks" TEXT NOT NULL,
    "schoolId" TEXT,
    "generatedBy" TEXT NOT NULL DEFAULT 'ai',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeneratedProgramme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreakCompletion" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BreakCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachingClient" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "age" INTEGER,
    "startingWeight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "goals" TEXT,
    "profilePhoto" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachingClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingPlan" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingDay" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" TEXT NOT NULL,
    "weight" TEXT,
    "rpe" INTEGER,
    "notes" TEXT,
    "videoUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachingSessionLog" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'started',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachingSessionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachingExerciseLog" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "sets" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachingExerciseLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachingPersonalRecord" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "exerciseName" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "reps" INTEGER NOT NULL,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachingPersonalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachingNutritionTarget" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "protein" INTEGER NOT NULL,
    "carbs" INTEGER NOT NULL,
    "fats" INTEGER NOT NULL,
    "water" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachingNutritionTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachingNutritionLog" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "calories" INTEGER NOT NULL DEFAULT 0,
    "protein" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "carbs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fats" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "water" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoachingNutritionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachingCheckIn" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "coachId" TEXT,
    "date" TEXT NOT NULL,
    "weight" DOUBLE PRECISION,
    "bodyFat" DOUBLE PRECISION,
    "energyLevel" INTEGER,
    "sleepQuality" INTEGER,
    "mood" INTEGER,
    "notes" TEXT,
    "photos" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachingCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachingProgressEntry" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "weight" DOUBLE PRECISION,
    "bodyFat" DOUBLE PRECISION,
    "chest" DOUBLE PRECISION,
    "waist" DOUBLE PRECISION,
    "hips" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachingProgressEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachingGoal" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "trainingPlanId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startValue" DOUBLE PRECISION NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "deadline" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoachingGoal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "School_name_key" ON "School"("name");

-- CreateIndex
CREATE UNIQUE INDEX "School_schoolCode_key" ON "School"("schoolCode");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_email_key" ON "Teacher"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Coach_email_key" ON "Coach"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FMSSkill_name_key" ON "FMSSkill"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FMSSkill_slug_key" ON "FMSSkill"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "MovementBreakSettings_schoolId_key" ON "MovementBreakSettings"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "FoodItem_name_key" ON "FoodItem"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BreakCompletion_teacherId_date_key" ON "BreakCompletion"("teacherId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "CoachingClient_userId_key" ON "CoachingClient"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CoachingNutritionLog_clientId_date_key" ON "CoachingNutritionLog"("clientId", "date");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgrammeBlock" ADD CONSTRAINT "ProgrammeBlock_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "ProgrammeBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlacementStudent" ADD CONSTRAINT "PlacementStudent_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FMSProgression" ADD CONSTRAINT "FMSProgression_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "FMSSkill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FMSCue" ADD CONSTRAINT "FMSCue_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "FMSSkill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FMSCommonError" ADD CONSTRAINT "FMSCommonError_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "FMSSkill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovementBreakSettings" ADD CONSTRAINT "MovementBreakSettings_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovementBreakSchedule" ADD CONSTRAINT "MovementBreakSchedule_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPlan" ADD CONSTRAINT "LessonPlan_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedProgramme" ADD CONSTRAINT "GeneratedProgramme_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingClient" ADD CONSTRAINT "CoachingClient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingPlan" ADD CONSTRAINT "TrainingPlan_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "CoachingClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingDay" ADD CONSTRAINT "TrainingDay_planId_fkey" FOREIGN KEY ("planId") REFERENCES "TrainingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "TrainingDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingSessionLog" ADD CONSTRAINT "CoachingSessionLog_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "CoachingClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingSessionLog" ADD CONSTRAINT "CoachingSessionLog_planId_fkey" FOREIGN KEY ("planId") REFERENCES "TrainingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingSessionLog" ADD CONSTRAINT "CoachingSessionLog_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "TrainingDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingExerciseLog" ADD CONSTRAINT "CoachingExerciseLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CoachingSessionLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingExerciseLog" ADD CONSTRAINT "CoachingExerciseLog_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingExerciseLog" ADD CONSTRAINT "CoachingExerciseLog_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "CoachingClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingPersonalRecord" ADD CONSTRAINT "CoachingPersonalRecord_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "CoachingClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingNutritionTarget" ADD CONSTRAINT "CoachingNutritionTarget_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "CoachingClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingNutritionLog" ADD CONSTRAINT "CoachingNutritionLog_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "CoachingClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingCheckIn" ADD CONSTRAINT "CoachingCheckIn_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "CoachingClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingProgressEntry" ADD CONSTRAINT "CoachingProgressEntry_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "CoachingClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingGoal" ADD CONSTRAINT "CoachingGoal_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "CoachingClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingGoal" ADD CONSTRAINT "CoachingGoal_trainingPlanId_fkey" FOREIGN KEY ("trainingPlanId") REFERENCES "TrainingPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;


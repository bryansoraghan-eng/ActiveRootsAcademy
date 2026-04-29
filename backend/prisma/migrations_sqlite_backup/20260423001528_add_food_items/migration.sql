-- CreateTable
CREATE TABLE "FoodItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "mealTypes" TEXT NOT NULL,
    "ageGroups" TEXT NOT NULL,
    "allergens" TEXT NOT NULL,
    "preferences" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "FoodItem_name_key" ON "FoodItem"("name");

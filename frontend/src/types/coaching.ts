export interface CoachingClient {
  id: string;
  status: string;
  startDate?: string;
  age?: number;
  startingWeight?: number;
  height?: number;
  goals?: string;
  user?: { id?: string; name: string; email: string };
  clientGoals?: CoachingGoal[];
  trainingPlans?: TrainingPlan[];
  nutritionTargets?: NutritionTarget[];
  checkIns?: CheckIn[];
  progressEntries?: ProgressEntry[];
  personalRecords?: PersonalRecord[];
}

export interface NutritionTarget {
  id: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  water: number;
  notes?: string;
  createdAt?: string;
}

export interface NutritionLog {
  id: string;
  date: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  water?: number;
  notes?: string;
}

export interface ProgressEntry {
  id: string;
  date: string;
  weight?: number;
  bodyFat?: number;
}

export interface PersonalRecord {
  id: string;
  exerciseName: string;
  weight: number;
  reps: number;
  loggedAt?: string;
}

export interface CoachingGoal {
  id: string;
  title: string;
  type: string;
  status: string;
  startValue: number;
  targetValue: number;
  currentValue: number;
  unit: string;
  description?: string;
  deadline?: string;
}

export interface CheckIn {
  id: string;
  date: string;
  weight?: number;
  energyLevel?: number;
  sleepQuality?: number;
  mood?: number;
  notes?: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  rpe?: string;
  notes?: string;
  videoUrl?: string;
  order?: number;
}

export interface TrainingDay {
  id: string;
  name: string;
  dayOfWeek: number;
  order?: number;
  exercises?: Exercise[];
}

export interface TrainingPlan {
  id: string;
  name: string;
  isActive?: boolean;
  notes?: string;
  days?: TrainingDay[];
}

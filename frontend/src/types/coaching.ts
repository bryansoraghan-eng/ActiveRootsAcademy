export interface CoachingClient {
  id: string;
  status: string;
  startDate?: string;
  user?: { name: string; email: string };
  clientGoals?: CoachingGoal[];
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
  notes?: string;
  days?: TrainingDay[];
}

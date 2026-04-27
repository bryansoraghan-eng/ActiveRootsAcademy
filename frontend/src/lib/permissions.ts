export type ModuleKey =
  | 'schools' | 'teachers' | 'classes' | 'coaches'
  | 'programmes' | 'bookings' | 'assessments' | 'placements'
  | 'nutrition' | 'lessonPlans' | 'fmsLibrary' | 'users' | 'movementBreaks';

export interface ModulePermission {
  view: boolean;
  edit: boolean;
  assign?: boolean;
  assess?: boolean;
}

export type Permissions = Record<ModuleKey, ModulePermission>;

const ALL_ON: Permissions = {
  schools:        { view: true, edit: true, assign: true  },
  teachers:       { view: true, edit: true                },
  classes:        { view: true, edit: true, assign: true  },
  coaches:        { view: true, edit: true, assign: true  },
  programmes:     { view: true, edit: true                },
  bookings:       { view: true, edit: true, assign: true  },
  assessments:    { view: true, edit: true, assess: true  },
  placements:     { view: true, edit: true, assign: true  },
  nutrition:      { view: true, edit: true                },
  lessonPlans:    { view: true, edit: true                },
  fmsLibrary:     { view: true, edit: true                },
  users:          { view: true, edit: true                },
  movementBreaks: { view: true, edit: true                },
};

const ALL_OFF: Permissions = {
  schools:        { view: false, edit: false, assign: false },
  teachers:       { view: false, edit: false               },
  classes:        { view: false, edit: false, assign: false },
  coaches:        { view: false, edit: false, assign: false },
  programmes:     { view: false, edit: false               },
  bookings:       { view: false, edit: false, assign: false },
  assessments:    { view: false, edit: false, assess: false },
  placements:     { view: false, edit: false, assign: false },
  nutrition:      { view: false, edit: false               },
  lessonPlans:    { view: false, edit: false               },
  fmsLibrary:     { view: false, edit: false               },
  users:          { view: false, edit: false               },
  movementBreaks: { view: false, edit: false               },
};

export const DEFAULT_PERMISSIONS: Record<string, Permissions> = {
  admin: ALL_ON,

  school_admin: {
    ...ALL_OFF,
    schools:        { view: true,  edit: false              },
    teachers:       { view: true,  edit: true               },
    classes:        { view: true,  edit: true, assign: true },
    coaches:        { view: true,  edit: false              },
    programmes:     { view: true,  edit: false              },
    bookings:       { view: true,  edit: false, assign: false },
    assessments:    { view: true,  edit: false, assess: false },
    nutrition:      { view: true,  edit: true               },
    lessonPlans:    { view: true,  edit: false              },
    fmsLibrary:     { view: true,  edit: false              },
    movementBreaks: { view: true,  edit: true               },
  },

  principal: {
    ...ALL_OFF,
    schools:        { view: true,  edit: false              },
    teachers:       { view: true,  edit: false              },
    classes:        { view: true,  edit: false              },
    coaches:        { view: true,  edit: false              },
    programmes:     { view: true,  edit: false              },
    bookings:       { view: true,  edit: false, assign: false },
    assessments:    { view: true,  edit: false, assess: false },
    placements:     { view: true,  edit: false, assign: false },
    nutrition:      { view: true,  edit: false              },
    lessonPlans:    { view: true,  edit: false              },
    fmsLibrary:     { view: true,  edit: false              },
    movementBreaks: { view: true,  edit: false              },
  },

  coach: {
    ...ALL_OFF,
    classes:        { view: true,  edit: false              },
    programmes:     { view: true,  edit: false              },
    bookings:       { view: true,  edit: false, assign: false },
    assessments:    { view: true,  edit: false, assess: true },
    placements:     { view: true,  edit: false, assign: false },
    nutrition:      { view: true,  edit: false              },
    lessonPlans:    { view: true,  edit: false              },
    fmsLibrary:     { view: true,  edit: true               },
    movementBreaks: { view: true,  edit: false              },
  },

  teacher: {
    ...ALL_OFF,
    classes:        { view: true,  edit: false              },
    programmes:     { view: true,  edit: false              },
    assessments:    { view: true,  edit: false, assess: true },
    nutrition:      { view: true,  edit: true               },
    lessonPlans:    { view: true,  edit: true               },
    fmsLibrary:     { view: true,  edit: false              },
    movementBreaks: { view: true,  edit: true               },
  },
};

export function resolvePermissions(role: string, overrides: Partial<Permissions> = {}): Permissions {
  const base = DEFAULT_PERMISSIONS[role] ?? DEFAULT_PERMISSIONS['teacher'];
  const merged = { ...base };
  for (const mod of Object.keys(overrides) as ModuleKey[]) {
    merged[mod] = { ...base[mod], ...overrides[mod] };
  }
  return merged;
}

export function can(perms: Permissions, mod: ModuleKey, action: keyof ModulePermission = 'view'): boolean {
  return perms[mod]?.[action] ?? false;
}

export const ROLE_LABELS: Record<string, string> = {
  admin:        'Admin',
  school_admin: 'School Admin',
  principal:    'Principal',
  coach:        'Coach',
  teacher:      'Teacher',
  online_coach: 'Online Coach',
  client:       'Client',
};

export const ROLE_COLOURS: Record<string, { bg: string; text: string; dot: string }> = {
  admin:        { bg: 'bg-orange-500', text: 'text-orange-600', dot: 'bg-orange-500' },
  school_admin: { bg: 'bg-purple-600', text: 'text-purple-600', dot: 'bg-purple-600' },
  principal:    { bg: 'bg-purple-600', text: 'text-purple-600', dot: 'bg-purple-600' },
  coach:        { bg: 'bg-green-600',  text: 'text-green-600',  dot: 'bg-green-600'  },
  teacher:      { bg: 'bg-blue-600',   text: 'text-blue-600',   dot: 'bg-blue-600'   },
};

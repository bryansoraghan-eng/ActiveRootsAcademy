import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../db';

const router = express.Router();

// ── First-time admin setup (only works when no admin users exist) ─────────────
router.post('/setup', async (req, res) => {
  try {
    const existing = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (existing) return res.status(403).json({ error: 'Setup already complete.' });
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email and password required.' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hashed, role: 'admin', status: 'active' } });
    res.json({ message: 'Admin account created.', email: user.email });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── School code generation ────────────────────────────────────────────────────
function generateSchoolCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function uniqueSchoolCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateSchoolCode();
    const exists = await prisma.school.findUnique({ where: { schoolCode: code } });
    if (!exists) return code;
  }
  return generateSchoolCode() + Date.now().toString(36).slice(-2);
}

// ── Validate school code (public) ─────────────────────────────────────────────
router.get('/validate-school-code/:code', async (req, res) => {
  try {
    const school = await prisma.school.findUnique({
      where: { schoolCode: req.params.code.toUpperCase() },
      select: { id: true, name: true, schoolCode: true },
    });
    if (!school) return res.status(404).json({ error: 'School code not found' });
    res.json(school);
  } catch {
    res.status(500).json({ error: 'Failed to validate code' });
  }
});

// ── Public schools list (for registration dropdown) ───────────────────────────
router.get('/schools', async (_req, res) => {
  try {
    const schools = await prisma.school.findMany({
      select: { id: true, name: true, schoolCode: true },
      orderBy: { name: 'asc' },
    });
    res.json(schools);
  } catch {
    res.status(500).json({ error: 'Failed to fetch schools' });
  }
});

// ── Unified self-registration (teacher/coach/school_admin/principal) ───────────
// Teachers → Teacher table (gets teacher layout)
// All other roles → User table (gets full layout with role-based permissions)
// school_admin/principal → status: pending until admin approves
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, schoolId, schoolCode } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }

    const selfRegRoles = ['teacher', 'coach', 'school_admin', 'principal'];
    if (!selfRegRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role for self-registration' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Resolve school
    let resolvedSchoolId: string | undefined = undefined;

    if (role === 'teacher') {
      // Teachers must always supply a school code — raw schoolId is not accepted
      if (!schoolCode) {
        return res.status(400).json({ error: 'Teachers must provide a valid school code.' });
      }
      const school = await prisma.school.findUnique({
        where: { schoolCode: schoolCode.toUpperCase() },
      });
      if (!school) {
        return res.status(400).json({ error: 'School code not found. Please check the code with your administrator.' });
      }
      resolvedSchoolId = school.id;
    } else {
      resolvedSchoolId = schoolId || undefined;
      if (schoolCode && !resolvedSchoolId) {
        const school = await prisma.school.findUnique({
          where: { schoolCode: schoolCode.toUpperCase() },
        });
        if (!school) {
          return res.status(400).json({ error: 'School code not found. Please check the code with your administrator.' });
        }
        resolvedSchoolId = school.id;
      }
    }

    // Teacher → goes into Teacher table
    if (role === 'teacher') {
      const existing = await prisma.teacher.findUnique({ where: { email } });
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existing || existingUser) {
        return res.status(400).json({ error: 'An account with this email already exists' });
      }
      const hashed = await bcrypt.hash(password, 10);
      await prisma.teacher.create({
        data: { email, name, password: hashed, schoolId: resolvedSchoolId! },
      });
      return res.status(201).json({ message: 'Account created successfully. You can now sign in.' });
    }

    // All other roles → User table
    const existing = await prisma.user.findUnique({ where: { email } });
    const existingTeacher = await prisma.teacher.findUnique({ where: { email } });
    if (existing || existingTeacher) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const isPending = role === 'school_admin' || role === 'principal';
    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email, name,
        password: hashed,
        role,
        status: isPending ? 'pending' : 'active',
        schoolId: resolvedSchoolId || undefined,
      },
    });

    const message = isPending
      ? 'Account request submitted. An admin will review and approve your account shortly.'
      : 'Account created successfully. You can now sign in.';

    res.status(201).json({ message, pending: isPending });
  } catch (error) {
    console.error('Register error:', error);
    res.status(400).json({ error: 'Registration failed' });
  }
});

// ── Legacy teacher self-registration (removed — use POST /register with role: 'teacher') ──
router.post('/register-teacher', (_req, res) => {
  res.status(410).json({ error: 'This endpoint has been removed. Use POST /api/auth/register with role: "teacher".' });
});

// ── Auth failure logger ───────────────────────────────────────────────────────
function logAuthFailure(email: string, req: express.Request, reason: string) {
  const ip =
    (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0].trim() ??
    req.ip ??
    'unknown';
  console.warn(`[AUTH FAIL] ${new Date().toISOString()} | ip=${ip} | email=${email} | reason=${reason}`);
}

// ── Login ─────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check User table first
    const user = await prisma.user.findUnique({
      where: { email },
      include: { school: true },
    });

    if (user) {
      if (!(await bcrypt.compare(password, user.password))) {
        logAuthFailure(email, req, 'wrong_password');
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      if (user.status === 'pending') {
        logAuthFailure(email, req, 'account_pending');
        return res.status(403).json({ error: 'Your account is pending admin approval. You\'ll receive access once an administrator approves your request.' });
      }
      const coachingRoles = ['online_coach', 'client'];
      const userType = coachingRoles.includes(user.role) ? user.role : 'admin';
      const token = jwt.sign(
        { id: user.id, role: user.role, schoolId: user.schoolId, userType },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );
      let customPermissions: Record<string, any> = {};
      try { customPermissions = JSON.parse(user.permissions || '{}'); } catch {
        console.error(`[AUTH] Malformed permissions JSON for user ${user.id} — defaulting to empty`);
      }
      return res.json({
        token,
        userType,
        user: {
          id: user.id, email: user.email, name: user.name,
          role: user.role, school: user.school,
          permissions: customPermissions,
        },
      });
    }

    // Fall back to Teacher table
    const teacher = await prisma.teacher.findUnique({
      where: { email },
      include: { school: true },
    });

    if (!teacher || !(await bcrypt.compare(password, teacher.password))) {
      logAuthFailure(email, req, teacher ? 'wrong_password' : 'email_not_found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: teacher.id, role: 'teacher', schoolId: teacher.schoolId, userType: 'teacher' },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    return res.json({
      token,
      userType: 'teacher',
      user: { id: teacher.id, email: teacher.email, name: teacher.name, role: 'teacher', school: teacher.school },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export { uniqueSchoolCode };
export default router;

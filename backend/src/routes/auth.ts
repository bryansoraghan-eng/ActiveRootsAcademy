import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../db';

const router = express.Router();

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

    // Resolve school — either by direct schoolId or by schoolCode lookup
    let resolvedSchoolId: string | undefined = schoolId || undefined;

    if (schoolCode && !resolvedSchoolId) {
      const school = await prisma.school.findUnique({
        where: { schoolCode: schoolCode.toUpperCase() },
      });
      if (!school) {
        return res.status(400).json({ error: 'School code not found. Please check the code with your administrator.' });
      }
      resolvedSchoolId = school.id;
    }

    // Teachers must have a valid school code
    if (role === 'teacher') {
      if (!resolvedSchoolId) {
        return res.status(400).json({ error: 'Teachers must provide a valid school code or select a school.' });
      }
      // Verify the school code actually belongs to this school (if both provided)
      if (schoolCode && schoolId) {
        const school = await prisma.school.findUnique({ where: { id: schoolId } });
        if (!school || school.schoolCode !== schoolCode.toUpperCase()) {
          return res.status(400).json({ error: 'Incorrect school code for the selected school.' });
        }
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

// ── Legacy teacher self-registration (kept for backward compat) ───────────────
router.post('/register-teacher', async (req, res) => {
  try {
    const { email, password, name, schoolId, schoolCode } = req.body;

    if (!email || !password || !name || !schoolId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Server-side school code validation
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) {
      return res.status(400).json({ error: 'School not found' });
    }

    if (school.schoolCode) {
      if (!schoolCode || schoolCode.toUpperCase() !== school.schoolCode) {
        return res.status(400).json({ error: 'Incorrect school code. Please check with your school administrator.' });
      }
    } else {
      // Fallback: first 3 chars of school name (legacy behaviour while codes are being set up)
      const expectedCode = school.name.slice(0, 3).toLowerCase();
      if (!schoolCode || schoolCode.toLowerCase() !== expectedCode) {
        return res.status(400).json({ error: 'Incorrect school code. Please check with your school administrator.' });
      }
    }

    const existing = await prisma.teacher.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const teacher = await prisma.teacher.create({
      data: { email, name, password: hashed, schoolId },
      include: { school: true },
    });

    res.status(201).json({
      message: 'Account created successfully',
      teacher: { id: teacher.id, email: teacher.email, name: teacher.name, school: teacher.school },
    });
  } catch (error) {
    console.error('Teacher register error:', error);
    res.status(400).json({ error: 'Registration failed' });
  }
});

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
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      if (user.status === 'pending') {
        return res.status(403).json({ error: 'Your account is pending admin approval. You\'ll receive access once an administrator approves your request.' });
      }
      const token = jwt.sign(
        { id: user.id, role: user.role, schoolId: user.schoolId, userType: 'admin' },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );
      let customPermissions: Record<string, any> = {};
      try { customPermissions = JSON.parse(user.permissions || '{}'); } catch {}
      return res.json({
        token,
        userType: 'admin',
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

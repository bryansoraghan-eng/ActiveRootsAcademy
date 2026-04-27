import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import TeacherLayout from './components/TeacherLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Schools from './pages/Schools';
import Teachers from './pages/Teachers';
import Classes from './pages/Classes';
import Coaches from './pages/Coaches';
import Programmes from './pages/Programmes';
import LessonPlans from './pages/LessonPlans';
import FMSLibrary from './pages/FMSLibrary';
import Bookings from './pages/Bookings';
import Assessments from './pages/Assessments';
import Placements from './pages/Placements';
import Nutrition from './pages/Nutrition';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherClasses from './pages/teacher/TeacherClasses';
import TeacherAssessments from './pages/teacher/TeacherAssessments';
import TeacherMovementBreaks from './pages/teacher/TeacherMovementBreaks';
import TeacherRegister from './pages/TeacherRegister';
import Register from './pages/Register';
import Users from './pages/Users';
import MovementBreaks from './pages/MovementBreaks';

function AppRoutes() {
  const { user, userType, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading…</div>;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-teacher" element={<TeacherRegister />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  if (userType === 'teacher') {
    return (
      <Routes>
        <Route element={<TeacherLayout />}>
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/classes" element={<TeacherClasses />} />
          <Route path="/teacher/assessments" element={<TeacherAssessments />} />
          <Route path="/teacher/movement-breaks" element={<TeacherMovementBreaks />} />
        </Route>
        <Route path="*" element={<Navigate to="/teacher" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/schools" element={<Schools />} />
        <Route path="/teachers" element={<Teachers />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/coaches" element={<Coaches />} />
        <Route path="/programmes" element={<Programmes />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/assessments" element={<Assessments />} />
        <Route path="/placements" element={<Placements />} />
        <Route path="/nutrition" element={<Nutrition />} />
        <Route path="/lesson-plans" element={<LessonPlans />} />
        <Route path="/fms" element={<FMSLibrary />} />
        <Route path="/users" element={<Users />} />
        <Route path="/movement-breaks" element={<MovementBreaks />} />
        <Route path="/preview/teacher" element={<TeacherDashboard />} />
        <Route path="/preview/teacher/classes" element={<TeacherClasses />} />
        <Route path="/preview/teacher/assessments" element={<TeacherAssessments />} />
        <Route path="/preview/teacher/movement-breaks" element={<TeacherMovementBreaks />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

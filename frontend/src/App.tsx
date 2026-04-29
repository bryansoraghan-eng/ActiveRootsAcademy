import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import TeacherLayout from './components/TeacherLayout';
import CoachingLayout from './components/CoachingLayout';
import ClientLayout from './components/ClientLayout';
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
import CoachDashboard from './pages/coaching/coach/CoachDashboard';
import CoachClients from './pages/coaching/coach/CoachClients';
import CoachTraining from './pages/coaching/coach/CoachTraining';
import CoachNutrition from './pages/coaching/coach/CoachNutrition';
import CoachProgress from './pages/coaching/coach/CoachProgress';
import CoachCheckins from './pages/coaching/coach/CoachCheckins';
import ClientDashboard from './pages/coaching/client/ClientDashboard';
import ClientTraining from './pages/coaching/client/ClientTraining';
import ClientNutrition from './pages/coaching/client/ClientNutrition';
import ClientProgress from './pages/coaching/client/ClientProgress';
import ClientCheckins from './pages/coaching/client/ClientCheckins';
import ClientProfile from './pages/coaching/client/ClientProfile';

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

  if (userType === 'online_coach') {
    return (
      <ErrorBoundary>
        <Routes>
          <Route element={<CoachingLayout />}>
            <Route path="/coaching" element={<CoachDashboard />} />
            <Route path="/coaching/clients" element={<CoachClients />} />
            <Route path="/coaching/clients/:id" element={<CoachClients />} />
            <Route path="/coaching/training" element={<CoachTraining />} />
            <Route path="/coaching/nutrition" element={<CoachNutrition />} />
            <Route path="/coaching/progress" element={<CoachProgress />} />
            <Route path="/coaching/checkins" element={<CoachCheckins />} />
          </Route>
          <Route path="*" element={<Navigate to="/coaching" replace />} />
        </Routes>
      </ErrorBoundary>
    );
  }

  if (userType === 'client') {
    return (
      <ErrorBoundary>
        <Routes>
          <Route element={<ClientLayout />}>
            <Route path="/client" element={<ClientDashboard />} />
            <Route path="/client/training" element={<ClientTraining />} />
            <Route path="/client/nutrition" element={<ClientNutrition />} />
            <Route path="/client/progress" element={<ClientProgress />} />
            <Route path="/client/checkins" element={<ClientCheckins />} />
            <Route path="/client/profile" element={<ClientProfile />} />
          </Route>
          <Route path="*" element={<Navigate to="/client" replace />} />
        </Routes>
      </ErrorBoundary>
    );
  }

  if (userType === 'teacher') {
    return (
      <ErrorBoundary>
        <Routes>
          <Route element={<TeacherLayout />}>
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/teacher/classes" element={<TeacherClasses />} />
            <Route path="/teacher/assessments" element={<TeacherAssessments />} />
            <Route path="/teacher/nutrition" element={<Nutrition />} />
            <Route path="/teacher/lesson-plans" element={<LessonPlans />} />
            <Route path="/teacher/fms" element={<FMSLibrary />} />
            <Route path="/teacher/movement-breaks" element={<TeacherMovementBreaks />} />
          </Route>
          <Route path="*" element={<Navigate to="/teacher" replace />} />
        </Routes>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
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
        </Route>
        <Route element={<TeacherLayout />}>
          <Route path="/preview/teacher" element={<TeacherDashboard />} />
          <Route path="/preview/teacher/classes" element={<TeacherClasses />} />
          <Route path="/preview/teacher/assessments" element={<TeacherAssessments />} />
          <Route path="/preview/teacher/nutrition" element={<Nutrition />} />
          <Route path="/preview/teacher/lesson-plans" element={<LessonPlans />} />
          <Route path="/preview/teacher/fms" element={<FMSLibrary />} />
          <Route path="/preview/teacher/movement-breaks" element={<TeacherMovementBreaks />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
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

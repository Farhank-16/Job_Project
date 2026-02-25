import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';

// Auth Pages (eagerly loaded)
import Login from './pages/auth/Login';
import VerifyOTP from './pages/auth/VerifyOTP';
import SelectRole from './pages/auth/SelectRole';
import CompleteProfile from './pages/auth/CompleteProfile';

// Lazy loaded pages
const Home = lazy(() => import('./pages/Home'));
const SeekerDashboard = lazy(() => import('./pages/seeker/Dashboard'));
const SeekerProfile = lazy(() => import('./pages/seeker/Profile'));
const JobSearch = lazy(() => import('./pages/seeker/JobSearch'));
const JobDetails = lazy(() => import('./pages/seeker/JobDetails'));
const MyApplications = lazy(() => import('./pages/seeker/MyApplications'));
const TakeExam = lazy(() => import('./pages/seeker/TakeExam'));

const EmployerDashboard = lazy(() => import('./pages/employer/Dashboard'));
const EmployerProfile = lazy(() => import('./pages/employer/Profile'));
const PostJob = lazy(() => import('./pages/employer/PostJob'));
const EditJob = lazy(() => import('./pages/employer/EditJob'));
const MyJobs = lazy(() => import('./pages/employer/MyJobs'));
const JobApplications = lazy(() => import('./pages/employer/JobApplications'));
const CandidateSearch = lazy(() => import('./pages/employer/CandidateSearch'));
const CandidateProfile = lazy(() => import('./pages/employer/CandidateProfile'));

const Subscription = lazy(() => import('./pages/Subscription'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const ExamList = lazy(() => import('./pages/ExamList'));

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminJobs = lazy(() => import('./pages/admin/Jobs'));
const AdminSkills = lazy(() => import('./pages/admin/Skills'));
const AdminQuestions = lazy(() => import('./pages/admin/Questions'));
const AdminPayments = lazy(() => import('./pages/admin/Payments'));

// ─── Protected Route ─────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

// ─── Public Route ─────────────────────────────────────────────────────────────
// FIX: Only redirect AFTER loading is complete AND user exists.
// Old bug: loading=true, user=null → renders children → then user loads →
// re-render → redirect. This caused race condition with Dashboard loading
// before auth was confirmed, triggering 401 → force logout.
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Wait for auth check to complete before deciding anything
  if (loading) return <LoadingSpinner fullScreen />;

  // Only redirect if we KNOW user is logged in (loading is done)
  if (user) {
    if (user.role === 'admin')    return <Navigate to="/admin"    replace />;
    if (user.role === 'employer') return <Navigate to="/employer" replace />;
    return <Navigate to="/seeker" replace />;
  }

  return children;
};

function App() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        {/* Public home */}
        <Route path="/" element={<Home />} />

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          {/* FIX: /verify-otp and /select-role should NOT be inside PublicRoute
              because after verifyOTP sets user, PublicRoute redirects away
              before navigation in the component can happen */}
          <Route path="/login" element={
            <PublicRoute><Login /></PublicRoute>
          } />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/select-role" element={<SelectRole />} />
        </Route>

        {/* Complete Profile — protected but no role restriction */}
        <Route path="/complete-profile" element={
          <ProtectedRoute>
            <CompleteProfile />
          </ProtectedRoute>
        } />

        {/* Job Seeker Routes */}
        <Route path="/seeker" element={
          <ProtectedRoute roles={['job_seeker']}>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<SeekerDashboard />} />
          <Route path="profile" element={<SeekerProfile />} />
          <Route path="jobs" element={<JobSearch />} />
          <Route path="jobs/:id" element={<JobDetails />} />
          <Route path="applications" element={<MyApplications />} />
          <Route path="exams" element={<ExamList />} />
          <Route path="exams/:skillId" element={<TakeExam />} />
          <Route path="subscription" element={<Subscription />} />
        </Route>

        {/* Employer Routes */}
        <Route path="/employer" element={
          <ProtectedRoute roles={['employer']}>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<EmployerDashboard />} />
          <Route path="profile" element={<EmployerProfile />} />
          <Route path="post-job" element={<PostJob />} />
          <Route path="jobs" element={<MyJobs />} />
          <Route path="jobs/:id/edit" element={<EditJob />} />
          <Route path="jobs/:id/applications" element={<JobApplications />} />
          <Route path="candidates" element={<CandidateSearch />} />
          <Route path="candidates/:id" element={<CandidateProfile />} />
          <Route path="subscription" element={<Subscription />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="skills" element={<AdminSkills />} />
          <Route path="questions" element={<AdminQuestions />} />
          <Route path="payments" element={<AdminPayments />} />
        </Route>

        {/* Payment */}
        <Route path="/payment-success" element={
          <ProtectedRoute><PaymentSuccess /></ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
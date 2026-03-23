import { Routes, Route, Navigate } from 'react-router-dom';
import Login          from './pages/Login';
import Signup         from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword  from './pages/ResetPassword';
import Contact        from './pages/Contact';
import Help           from './pages/Help';
import Dashboard      from './pages/Dashboard';
import UploadFile     from './pages/UploadFile';
import MyFiles        from './pages/MyFiles';
import FolderView     from './pages/FolderView';
import SharedFilePage from './pages/SharedFilePage';
import Rooms          from './pages/Rooms';
import RoomView       from './pages/RoomView';
import Profile        from './pages/Profile';
import Analytics      from './pages/Analytics';
import Settings       from './pages/Settings';
import Shared         from './pages/Shared';
import Landing        from './pages/Landing';
import Pricing        from './pages/Pricing';
import Privacy        from './pages/Privacy';
import Terms          from './pages/Terms';
import ProtectedRoute from './components/ProtectedRoute';
import Layout         from './components/Layout';

export default function App() {
  return (
    <Routes>
      {/* Marketing landing page */}
      <Route path="/" element={<Landing />} />

      {/* Public share link page — no login required */}
      <Route path="/share/:token" element={<SharedFilePage />} />

      {/* Public room view — anyone with the link can see files */}
      <Route path="/rooms/:roomId" element={<RoomView />} />

      {/* Public routes */}
      <Route path="/login"  element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/help" element={<Help />} />

      {/* Protected routes – inside shared Layout (navbar + sidebar) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard"   element={<Dashboard />} />
          <Route path="/upload"      element={<UploadFile />} />
          <Route path="/my-files"    element={<MyFiles />} />
          <Route path="/folders/:id" element={<FolderView />} />
          <Route path="/rooms"       element={<Rooms />} />
          <Route path="/shared"      element={<Shared />} />
          <Route path="/analytics"   element={<Analytics />} />
          <Route path="/profile"     element={<Profile />} />
          <Route path="/settings"    element={<Settings />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

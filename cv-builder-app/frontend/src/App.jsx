import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CVBuilder from './pages/CVBuilder';
import CoverLetter from './pages/CoverLetter';

const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <GoogleOAuthProvider clientId="YOUR_CLIENT_ID_HERE">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/cv/:id" element={
            <ProtectedRoute>
              <CVBuilder />
            </ProtectedRoute>
          } />
          <Route path="/cv/new" element={
            <ProtectedRoute>
              <CVBuilder />
            </ProtectedRoute>
          } />
          <Route path="/cover-letter" element={
            <ProtectedRoute>
              <CoverLetter />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { session } from './api';
import AuthForms from './components/AuthForms';
import Layout from './components/Layout';
import CustomerView from './components/CustomerView';
import AdminView from './components/AdminView';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const token = session.getToken();
      const savedUser = session.getUser();
      
      if (token && savedUser) {
        setUser(savedUser);
      }
      setLoading(false);
    };
    
    initAuth();
  }, []);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    window.location.href = '/dashboard';
  };

  const handleLogout = () => {
    session.logout();
    setUser(null);
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            user ? <Navigate to="/dashboard" /> : <AuthForms onLogin={handleLogin} />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            !user ? (
              <Navigate to="/" />
            ) : (
              <Layout user={user} onLogout={handleLogout}>
                {user.role === 'admin' ? <AdminView /> : <CustomerView user={user} />}
              </Layout>
            )
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


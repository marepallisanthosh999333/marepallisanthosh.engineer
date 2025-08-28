import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';
import { Redirect } from 'wouter';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-xl font-semibold">Authenticating...</p>
          <p className="text-gray-600">Please wait while we check your credentials.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">Authentication Error</p>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // User is not signed in, redirect to the login page.
    return <Redirect to="/login" />;
  }

  // User is signed in, render the protected component.
  return <>{children}</>;
};

export default ProtectedRoute;

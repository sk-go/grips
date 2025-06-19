// components/AuthWrapper.jsx
import { useEffect } from 'react';
import { useAuth }   from '../contexts/AuthContext';
import { auth }      from '../lib/firebase';

export default function AuthWrapper({ children }) {
  const { user } = useAuth();

  useEffect(() => {
    if (user) auth.currentUser?.getIdToken().then(t => (window.authToken = t));
  }, [user]);

  window.authenticatedFetch = async (url, opts = {}) => {
    const t = await auth.currentUser?.getIdToken();
    return fetch(url, { ...opts, headers: { ...opts.headers, Authorization: `Bearer ${t}` } });
  };

  return children;
}
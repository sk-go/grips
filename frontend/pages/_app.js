// pages/_app.js
import '../styles/globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import AuthWrapper       from '../components/AuthWrapper';

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <AuthWrapper>
        <Component {...pageProps} />
      </AuthWrapper>
    </AuthProvider>
  );
}
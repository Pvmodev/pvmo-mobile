import { AuthProvider } from '@/contexts/AuthContext';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor="#1a1a2e" />
      <Slot />
    </AuthProvider>
  );
}
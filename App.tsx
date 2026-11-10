import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useDojoStore } from './src/store/dojoStore';
import { colors } from './src/theme/theme';
import { LoginScreen } from './src/components/LoginScreen';
import { Header } from './src/components/Header';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { AlumnosScreen } from './src/screens/AlumnosScreen';
import { CronogramaScreen } from './src/screens/CronogramaScreen';
import { MensualidadesScreen } from './src/screens/MensualidadesScreen';
import { TorneosScreen } from './src/screens/TorneosScreen';
import { RegistroPublicoScreen } from './src/screens/RegistroPublicoScreen';
import { ConfiguracionScreen } from './src/screens/ConfiguracionScreen';

export default function App() {
  const currentUser = useDojoStore((state) => state.currentUser);
  const currentTab = useDojoStore((state) => state.currentTab);
  const initSupabase = useDojoStore((state) => state.initSupabase);
  const isLoggedIn = Boolean(currentUser);

  useEffect(() => {
    initSupabase();
  }, []);

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <LoginScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <Header />

      <View style={styles.mainContainer}>
        {currentTab === 'dashboard' && <DashboardScreen />}
        {currentTab === 'alumnos' && <AlumnosScreen />}
        {currentTab === 'cronograma' && <CronogramaScreen />}
        {currentTab === 'mensualidades' && <MensualidadesScreen />}
        {currentTab === 'torneos' && <TorneosScreen />}
        {currentTab === 'registro_publico' && <RegistroPublicoScreen />}
        {currentTab === 'configuracion' && <ConfiguracionScreen />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgDarkest,
    ...Platform.select({
      web: {
        height: '100vh' as any,
      },
    }),
  },
  mainContainer: {
    flex: 1,
    backgroundColor: colors.bgDarkest,
  },
});

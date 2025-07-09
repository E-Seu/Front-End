import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AppLayout from '../components/AppLayout';
import ClienteFavoritos from '../screens/cliente/ClienteFavoritos';
import ClienteRestauranteDetalhes from '../screens/cliente/ClienteRestauranteDetalhes';

const Stack = createNativeStackNavigator();

export default function Routes() {
  const { isAuthenticated, userType, loading } = useAuth();

  console.log('Routes - isAuthenticated:', isAuthenticated, 'userType:', userType, 'loading:', loading);

  // Se ainda está carregando, mostra a SplashScreen
  if (loading) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator 
      initialRouteName={isAuthenticated ? "AppLayout" : "Welcome"} 
      screenOptions={{
        animation: 'fade',
        animationDuration: 300,
        headerShown: false, 
      }}
    >
      {!isAuthenticated ? (
        // Rotas públicas (não autenticado)
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Splash" component={SplashScreen} />

        </>
      ) : (
        // Rotas privadas (autenticado)
        <>
          <Stack.Screen name="AppLayout">
            {() => <AppLayout userType={userType} />}
          </Stack.Screen>
          <Stack.Screen name="ClienteFavoritos" component={ClienteFavoritos} />
          <Stack.Screen name="RestauranteDetalhes" component={ClienteRestauranteDetalhes} />
        </>
      )}

    </Stack.Navigator>
  );
}
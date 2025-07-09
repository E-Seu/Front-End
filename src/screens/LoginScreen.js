import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import AppLayout from '../components/AppLayout';

const Stack = createNativeStackNavigator();

export default function Routes() {
  const { isAuthenticated, userType, loading } = useAuth();

  console.log('Routes - isAuthenticated:', isAuthenticated, 'userType:', userType, 'loading:', loading);

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
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Splash" component={SplashScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="AppLayout">
            {() => <AppLayout userType={userType} />}
          </Stack.Screen>
        </>
      )}
    </Stack.Navigator>
  );
}
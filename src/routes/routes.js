import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importar as screens diretamente
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ClienteHome from '../screens/cliente/ClienteHome';
import ClientePedidos from '../screens/cliente/ClientePedidos';
import ClienteConta from '../screens/cliente/ClienteConta';
import AppLayout from '../components/AppLayout';

const Stack = createNativeStackNavigator();

export default function Routes() {
  return (
    <Stack.Navigator initialRouteName="Welcome"screenOptions={{
        animation: 'slide_from_right',
        animationDuration: 300,
      }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="AppLayout" component={AppLayout} />
      {/* Rotas do Cliente */}
      <Stack.Screen 
        name="ClienteHome" 
        component={ClienteHome}
        options={{
          animation: 'fade',
        }}
      />
      <Stack.Screen 
        name="ClientePedidos" 
        component={ClientePedidos}
        options={{
          animation: 'fade',
        }}
      />
      <Stack.Screen 
        name="ClienteConta" 
        component={ClienteConta}
        options={{
          animation: 'fade',
        }}
      />
    </Stack.Navigator>
  );
}
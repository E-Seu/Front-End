import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importar as screens diretamente
import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ClienteHome from '../screens/cliente/ClienteHome';
import ClientePedidos from '../screens/cliente/ClientePedidos';
import ClienteConta from '../screens/cliente/ClienteConta';
import ClienteFavoritos from '../screens/cliente/ClienteFavoritos';
import ClienteRestauranteDetalhes from '../screens/cliente/ClienteRestauranteDetalhes';
import AppLayout from '../components/AppLayout';
import RestauranteHome from '../screens/restaurante/RestauranteHome';
import RestauranteConta from '../screens/restaurante/RestauranteConta';
import RestaurantePedidos from '../screens/restaurante/RestaurantePedidos';
import EntregadorConta from '../screens/entregador/EntregadorConta';
import EntregadorEntregas from '../screens/entregador/EntregadorEntregas';
import EntregadorHome from '../screens/entregador/EntregadorHome';

const Stack = createNativeStackNavigator();

export default function Routes() {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{
        animation: 'fade',
        animationDuration: 300,
        headerShown: false, 
      }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
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
      <Stack.Screen 
        name="ClienteFavoritos" 
        component={ClienteFavoritos}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="RestauranteDetalhes" 
        component={ClienteRestauranteDetalhes}
        options={{
          animation: 'slide_from_right',
        }}
      />
      {/* Rotas do Restaurante */}
      <Stack.Screen 
        name="RestauranteHome" 
        component={RestauranteHome}
        options={{
          animation: 'fade',
        }}
      />
      <Stack.Screen 
        name="RestauranteConta" 
        component={RestauranteConta}
        options={{
          animation: 'fade',
        }}
      />
      <Stack.Screen 
        name="RestaurantePedidos" 
        component={RestaurantePedidos}
        options={{
          animation: 'fade',
        }}
      />
      {/* Rotas do Restaurante */}
      <Stack.Screen 
        name="EntregadorHome" 
        component={EntregadorHome}
        options={{
          animation: 'fade',
        }}
      />
      <Stack.Screen 
        name="EntregadorEntregas" 
        component={EntregadorEntregas}
        options={{
          animation: 'fade',
        }}
      />
      <Stack.Screen 
        name="EntregadorConta" 
        component={EntregadorConta}
        options={{
          animation: 'fade',
        }}
      />
    </Stack.Navigator>
  );
}
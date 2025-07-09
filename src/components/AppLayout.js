import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import NavBar from './navBar'; // Importar a barra de navegação

// Importar todas as telas que serão usadas
import ClienteHome from '../screens/cliente/ClienteHome';
import ClientePedidos from '../screens/cliente/ClientePedidos';
import ClienteConta from '../screens/cliente/ClienteConta';

import RestauranteHome from '../screens/restaurante/RestauranteHome';
import RestaurantePedidos from '../screens/restaurante/RestaurantePedidos';
import RestauranteConta from '../screens/restaurante/RestauranteConta';

import EntregadorHome from '../screens/entregador/EntregadorHome';
import EntregadorEntregas from '../screens/entregador/EntregadorEntregas';
import EntregadorConta from '../screens/entregador/EntregadorConta';

// Mapeamento das telas por tipo de usuário
const screenComponents = {
  cliente: {
    ClienteHome: ClienteHome,
    ClientePedidos: ClientePedidos,
    ClienteConta: ClienteConta,
  },
  restaurante: {
    RestauranteHome: RestauranteHome,
    RestaurantePedidos: RestaurantePedidos,
    RestauranteConta: RestauranteConta,
  },
  entregador: {
    EntregadorHome: EntregadorHome,
    EntregadorEntregas: EntregadorEntregas,
    EntregadorConta: EntregadorConta,
  },
};

// Mapeamento de qual tela inicial para cada tipo
const initialScreens = {
  cliente: 'ClienteHome',
  restaurante: 'RestauranteHome',
  entregador: 'EntregadorHome',
};

const AppLayout = ({ userType = 'cliente' }) => {
  const [currentScreen, setCurrentScreen] = useState(initialScreens[userType]);
  
  // Função para trocar de tela
  const navigateToScreen = (screenName) => {
    setCurrentScreen(screenName);
  };

  // Pega o componente da tela atual
  const CurrentScreenComponent = screenComponents[userType][currentScreen];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <CurrentScreenComponent navigateToScreen={navigateToScreen} />
      </View>
      <NavBar tipo={userType} onNavigate={navigateToScreen} currentScreen={currentScreen} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
});

export default AppLayout;
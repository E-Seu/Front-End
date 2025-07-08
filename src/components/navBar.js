import React from "react";
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from "./icon.js";

// Defina os ícones e suas respectivas rotas para cada tipo de NavBar
const navBarConfig = {
  cliente: [
    { icon: "Inicio", route: "ClienteHome" },
    { icon: "Pedido", route: "ClientePedidos" },
    { icon: "Conta", route: "ClienteConta" }
  ],
  restaurante: [
    { icon: "Inicio", route: "RestauranteHome" },
    { icon: "Pedido", route: "RestaurantePedidos" },
    { icon: "Conta", route: "RestauranteConta" }
  ],
  entregador: [
    { icon: "Inicio", route: "EntregadorHome" },
    { icon: "Entrega", route: "EntregadorEntregas" },
    { icon: "Conta", route: "EntregadorConta" }
  ],
};

function NavBar({ tipo = "cliente", onNavigate, currentScreen }) {
  const navItems = navBarConfig[tipo] || navBarConfig["cliente"];

  // Determina qual ícone está ativo baseado na tela atual
  const getActiveIcon = () => {
    const currentItem = navItems.find(item => item.route === currentScreen);
    return currentItem ? currentItem.icon : navItems[0].icon;
  };

  const activeIcon = getActiveIcon();

  const handlePress = (routeName, icon) => {
    // Só navega se não estiver na mesma tela
    if (currentScreen !== routeName) {
      onNavigate(routeName);
    }
  };

  return (
    <View style={styles.container}>
      {navItems.map((item) => (
        <TouchableOpacity 
          key={item.icon} 
          onPress={() => handlePress(item.route, item.icon)}
          style={[
            styles.iconButton,
            activeIcon === item.icon && styles.activeButton
          ]}
          activeOpacity={0.7}
        >
          <Icon nome={item.icon} ativo={activeIcon === item.icon} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    flexDirection: 'row',
    padding: 20,
  },
  iconButton: {
    padding: 10,
  },
});

export default NavBar;
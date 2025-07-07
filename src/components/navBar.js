import React, { useState } from "react";
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
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

function NavBar({ tipo = "cliente", navigation }) {
  const navItems = navBarConfig[tipo] || navBarConfig["cliente"];
  const [activeIcon, setActiveIcon] = useState(navItems[0].icon); // Primeiro ícone ativo por padrão

  const handlePress = (route, icon) => {
    setActiveIcon(icon); // Ativa o ícone pressionado
    // navigation.navigate(route);
  };

  return (
    <View style={styles.container}>
      {navItems.map((item) => (
        <TouchableOpacity 
          key={item.icon} 
          onPress={() => handlePress(item.route, item.icon)}
          style={styles.iconButton}
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
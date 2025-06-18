import { StyleSheet, View } from 'react-native';
import Icon from "../componentes/Icons/Icon";

// Defina os ícones de cada tipo de NavBar
const navBarIcons = {
  cliente: ["Inicio", "Pedido", "Conta"],
  restaurante: ["Inicio", "Pedido", "Conta"],
  entregador: ["Inicio", "Entrega", "Conta"],
};

function NavBar({ tipo = "cliente" }) {
  const icons = navBarIcons[tipo] || navBarIcons["cliente"];

  return (
    <View style={styles.container}>
      {icons.map((nome) => (
        <Icon key={nome} nome={nome} />
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
});

export default NavBar;
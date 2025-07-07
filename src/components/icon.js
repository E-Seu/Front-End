import React from "react";
import { StyleSheet, Text, View } from "react-native";
import InicioIcon from "../assets/icons/inicioIcon";
import ContaIcon from "../assets/icons/contaIcon";
import PedidoIcon from "../assets/icons/pedidoIcon";
import EntregaIcon from "../assets/icons/entregaIcon";
import PlaceholderIcon from "../assets/icons/placeHolderIcon";

// Mapeamento dos componentes SVG
const iconComponents = {
  Inicio: InicioIcon,
  Conta: ContaIcon,
  Pedido: PedidoIcon,
  Entrega: EntregaIcon,
};

function Icon({ nome, ativo = false }) {
  const IconComponent = iconComponents[nome] || PlaceholderIcon;
  
  console.log(`Icon ${nome} - ativo: ${ativo}`); // Debug para verificar se está recebendo a prop
  
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <IconComponent 
          isActive={ativo} 
          name={nome}
          width={57} 
          height={47} 
        />
        <Text style={[styles.iconText, ativo && styles.activeText]}>
          {nome}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 12,
    color: "#4E0777",
    marginTop: 1,
    textAlign: "center",
    fontFamily: "Nunito-Bold",
  },
  activeText: {
    color: "#4E0777",

  },
});

export default Icon;
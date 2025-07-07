import React, { Component } from "react";
import { TouchableOpacity, StyleSheet, Text, View } from "react-native";
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

export default class Icon extends Component {
  constructor(props) {
    super(props);
    this.state = {
      aberto: false,
    };
  }

  aoClicar = () => {
    if (!this.state.aberto) {
      this.setState({
        aberto: true,
      });
    }
  };

  render() {
    const IconComponent = iconComponents[this.props.nome] || PlaceholderIcon;
    
    return (
      <TouchableOpacity onPress={this.aoClicar} style={styles.container}>
        <View style={styles.iconContainer}>
          <IconComponent 
            isActive={this.state.aberto} 
            name={this.props.nome}
            width={57} 
            height={47} 
          />
          <Text style={styles.iconText}>{this.props.nome}</Text>
        </View>
      </TouchableOpacity>
    );
  }
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
    color: "#666",
    marginTop: 1,
    textAlign: "center",
    fontFamily: "Nunito-Bold",
  },
});
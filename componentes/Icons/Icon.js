import React, { Component } from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";

// Mapeamento dos ícones e imagens
const iconData = {
  Inicio: {
    NClicado: require("../../src/NavBar/Inicio1.png"),
    Clicado: require("../../src/NavBar/Inicio2.png"),
  },
  Conta: {
    NClicado: require("../../src/NavBar/Conta1.png"),
    Clicado: require("../../src/NavBar/Conta2.png"),
  },
  Pedido: {
    NClicado: require("../../src/NavBar/Pedido1.png"),
    Clicado: require("../../src/NavBar/Pedido2.png"),
  },
  Entrega: {
    NClicado: require("../../src/NavBar/Entrega1.png"),
    Clicado: require("../../src/NavBar/Entrega2.png"),
  },
  // Adicione outros ícones aqui...
};

export default class Icon extends Component {
  constructor(props) {
    super(props);
    const data = iconData[props.nome] || {};
    this.state = {
      img: data.NClicado,
      aberto: false,
      data,
    };
  }

  aoClicar = () => {
    if (!this.state.aberto) {
      this.setState({
        img: this.state.data.Clicado,
        aberto: true,
      });
    }
  };

  render() {
    return (
      <TouchableOpacity onPress={this.aoClicar} style={styles.container}>
        <Image source={this.state.img} style={styles.img} />
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  img: {
    width: 61,
    height: 61,
    resizeMode: "contain",
  },
});
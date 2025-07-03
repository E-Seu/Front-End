import React, { Component } from "react";
import {TouchableOpacity, Image, StyleSheet } from "react-native";

// Mapeamento dos ícones e imagens
const iconData = {
  Inicio: {
    NClicado: require("../assets/icons/Inicio1.png"),
    Clicado: require("../assets/icons/Inicio2.png"),
  },
  Conta: {
    NClicado: require("../assets/icons/Conta1.png"),
    Clicado: require("../assets/icons/Conta2.png"),
  },
  Pedido: {
    NClicado: require("../assets/icons/Pedido1.png"),
    Clicado: require("../assets/icons/Pedido2.png"),
  },
  Entrega: {
    NClicado: require("../assets/icons/Entrega1.png"),
    Clicado: require("../assets/icons/Entrega2.png"),
  },

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
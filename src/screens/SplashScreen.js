import React, { useContext } from 'react';
import { View, Animated, ImageBackground, Image, Easing, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const logo = require('../assets/images/Logo.png');

const checkFirstTime = async () => {
  try {
    const firstTime = await AsyncStorage.getItem('firstTime');
    if (firstTime === null) {
      // É a primeira vez qque o usuário está abrindo o app
      await AsyncStorage.setItem('firstTime', 'false');
      return true;
    }
    // Não é a primeira vez que o usuário está abrindo o app
    return false;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const FadeInView = ({navigation, ...props}) => {
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    
    React.useEffect(() => {
        Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.ease,
        useNativeDriver: true,
        }).start(() => {
            
            setTimeout(async () => {
                const isFirstTime = await checkFirstTime();
                if (isFirstTime) {
                    navigation.navigate('Welcome');
                } else {
                    navigation.navigate('Welcome');
                }
            }, 2000);
        });
    }, [fadeAnim, navigation]);
    
    return (
        <Animated.View style={{ ...props.style, opacity: fadeAnim }}>
            {props.children}
        </Animated.View>
    );
};

export default function SplashScreen({ navigation }) {
  return (
    <View style={{ flex: 1 }}>
      <ImageBackground style={style.background}>
        <FadeInView navigation={navigation} style={style.fadeInView}>
            <Image source={logo} style={style.logo} />
            <View style={style.messageContainer}>
              <Text style={style.messageText}>
                <Text style={style.defaultText}>Seu </Text>
                <Text style={style.orangeText}>lanche favorito </Text>
                <Text style={style.defaultText}>sem sair do </Text>
                <Text style={style.purpleText}>bloco</Text>
              </Text>
            </View>
        </FadeInView>
      </ImageBackground>
    </View>
  );
}

const style = {
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: null,
    height: null,
    resizeMode: 'cover',
    backgroundColor: '#FFFFFF',
  },

  fadeInView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    alignSelf: 'center',
    width: 299,
    height: 189,
    marginBottom: 32,
  },
  
  messageContainer: {
    alignItems: 'center',
    marginTop: -20,
    paddingHorizontal: 5,
  },

  messageText: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Nunito-Bold',
    lineHeight: 24,
  },

  orangeText: {
    color: '#DD5F04',
    fontFamily: 'Nunito-ExtraBold',
  },

  defaultText: {
    color: '#222222',
    fontFamily: 'Nunito-Bold',
  },

  purpleText: {
    color: '#4F0072',
    fontFamily: 'Nunito-ExtraBold',
  },
};
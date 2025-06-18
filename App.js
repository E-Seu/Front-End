import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import NavBar from './componentes/NavBar';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavBar tipo='entregador'/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#FFFFFF',
  },
});

export default App;

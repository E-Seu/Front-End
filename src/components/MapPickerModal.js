import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const MapPickerModal = ({ visible, onClose, onSelectLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleMapPress = (e) => {
    setSelectedLocation(e.nativeEvent.coordinate);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onSelectLocation(selectedLocation);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Selecione o local de entrega</Text>
          <MapView
            style={styles.map}
            initialRegion={{
                latitude: -3.7327,
                longitude: -38.5270,
                latitudeDelta: 0.003, // Mais zoom
                longitudeDelta: 0.003, // Mais zoomh==white
            }}
            onPress={handleMapPress}
          >
            {selectedLocation && (
              <Marker coordinate={selectedLocation} />
            )}
          </MapView>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmText}>Confirmar Local</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  container: { backgroundColor: '#fff', borderRadius: 12, padding: 16, width: '90%', alignItems: 'center' },
  title: { fontSize: 16, marginBottom: 8 },
  map: { width: '100%', height: 300, borderRadius: 8 },
  confirmButton: { marginTop: 12, backgroundColor: '#4E0777', padding: 10, borderRadius: 8 },
  confirmText: { color: '#fff', fontWeight: 'bold' },
  cancelButton: { marginTop: 8, padding: 8 },
  cancelText: { color: '#888' },
});

export default MapPickerModal;
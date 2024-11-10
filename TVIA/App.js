import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button, PermissionsAndroid, Platform } from 'react-native';
import Voice from '@react-native-voice/voice';
import { StatusBar } from 'expo-status-bar';


export default function App() {
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // Configurar los eventos de reconocimiento de voz
  Voice.onSpeechStart = () => setIsRecording(true);
  Voice.onSpeechEnd = () => setIsRecording(false);
  Voice.onSpeechError = err => setError(err.error);
  Voice.onSpeechResults = result => {
    const command = result.value[0];
    setResult(command); // Guardar el resultado en el estado
    sendVoiceCommand(command); // Enviar automáticamente el comando al servidor
  };

  // Solicitar permiso de audio (solo en Android)
  const requestAudioPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Permiso de grabación de audio',
            message: 'Esta aplicación necesita acceder al micrófono para el reconocimiento de voz.',
            buttonNeutral: 'Pregúntame más tarde',
            buttonNegative: 'Cancelar',
            buttonPositive: 'Conceder',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // Ejecutar la solicitud de permisos al iniciar la aplicación
  useEffect(() => {
    requestAudioPermission();
  }, []);

  // Iniciar y detener el reconocimiento de voz
  const startRecording = async () => {
    try {
      await Voice.start('es-ES');
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error(e);
    }
  };

  // Función para enviar el comando de voz al servidor
  const sendVoiceCommand = async (command) => {
    try {
      const response = await fetch('http://localhost:3000/process-voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      });
      const result = await response.json();
      console.log('Acción recibida del servidor:', result.action);
    } catch (error) {
      console.error('Error al enviar el comando:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Reconocimiento de voz</Text>
      <Button title={isRecording ? 'Detener' : 'Hablar'} onPress={isRecording ? stopRecording : startRecording} />
      <Text style={styles.text}>Resultado: {result}</Text>
      <Text style={styles.text}>Error: {error}</Text>
      
      {/* Botón para probar el envío del comando de forma manual */}
      <Button title="Enviar comando al servidor" onPress={() => sendVoiceCommand("Encender el televisor")} />
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  text: {
    marginVertical: 10,
    fontSize: 16,
  },
});

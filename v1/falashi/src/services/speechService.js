// Serviço de transcrição de áudio via Web Speech API (WebView).
//
// Funciona no Expo Go no Android, sem custo e sem API key.
// No iOS a Web Speech API é bloqueada pelo Safari em WebView — use o campo manual como fallback.
//
// Como funciona:
// 1. SpeechWebView (componente abaixo) monta uma WebView invisível com a Web Speech API.
// 2. startListening() aciona o reconhecimento e retorna uma Promise.
// 3. Quando o usuário para de falar, o resultado chega via onMessage e a Promise resolve.
// 4. SoloModeScreen usa startListening() no lugar da gravação de áudio.

import React, { useRef, useCallback } from 'react';
import { WebView } from 'react-native-webview';

// HTML injetado na WebView — inicializa o reconhecimento de voz
const SPEECH_HTML = `
<!DOCTYPE html>
<html>
<body>
<script>
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'NOT_SUPPORTED' }));
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'RESULT', text: transcript }));
  };

  recognition.onerror = (event) => {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ERROR', error: event.error }));
  };

  recognition.onend = () => {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'END' }));
  };

  // Escuta comandos do React Native
  document.addEventListener('message', (event) => {
    if (event.data === 'START') recognition.start();
    if (event.data === 'STOP') recognition.stop();
  });

  // Android usa window.addEventListener ao invés de document.addEventListener
  window.addEventListener('message', (event) => {
    if (event.data === 'START') { try { recognition.start(); } catch(e) {} }
    if (event.data === 'STOP') { try { recognition.stop(); } catch(e) {} }
  });
</script>
</body>
</html>
`;

// Hook que retorna a ref da WebView e a função startListening
export function useSpeechRecognition() {
  const webViewRef = useRef(null);
  const resolveRef = useRef(null);
  const rejectRef = useRef(null);

  const handleMessage = useCallback((event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);

      if (msg.type === 'RESULT') {
        resolveRef.current?.(msg.text);
        resolveRef.current = null;
        rejectRef.current = null;
      }

      if (msg.type === 'ERROR') {
        rejectRef.current?.(new Error(`Erro no reconhecimento: ${msg.error}`));
        resolveRef.current = null;
        rejectRef.current = null;
      }

      if (msg.type === 'NOT_SUPPORTED') {
        rejectRef.current?.(new Error('Web Speech API não suportada neste dispositivo.'));
        resolveRef.current = null;
        rejectRef.current = null;
      }
    } catch (e) {
      // ignora mensagens malformadas
    }
  }, []);

  // Inicia o reconhecimento e retorna Promise<string>
  const startListening = useCallback(() => {
    return new Promise((resolve, reject) => {
      resolveRef.current = resolve;
      rejectRef.current = reject;
      webViewRef.current?.injectJavaScript(`
        try { recognition.start(); } catch(e) {}
        true;
      `);
    });
  }, []);

  const stopListening = useCallback(() => {
    webViewRef.current?.injectJavaScript(`
      try { recognition.stop(); } catch(e) {}
      true;
    `);
  }, []);

  // Componente WebView invisível — deve ser montado uma vez no SoloModeScreen
  const SpeechWebView = useCallback(() => (
    <WebView
      ref={webViewRef}
      source={{ html: SPEECH_HTML }}
      style={{ width: 0, height: 0, position: 'absolute' }}
      onMessage={handleMessage}
      javaScriptEnabled
      mediaPlaybackRequiresUserAction={false}
      originWhitelist={['*']}
    />
  ), [handleMessage]);

  return { SpeechWebView, startListening, stopListening };
}

// Mantido para compatibilidade com o código original — não é mais usado diretamente
export async function transcribeAudio(audioUri) {
  console.warn('[speechService] transcribeAudio() não é mais usado. Use useSpeechRecognition().');
  return '';
}

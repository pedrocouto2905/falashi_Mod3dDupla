import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

// Componente simples de fade-in (+ leve subida) para dar entrada suave
// em telas ou blocos de conteúdo. Usa a API Animated nativa do React Native,
// sem dependências externas.
export default function FadeInView({
  children,
  duration = 350,
  delay = 0,
  style,
  startY = 12,
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(startY)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[style, { opacity, transform: [{ translateY }] }]}
    >
      {children}
    </Animated.View>
  );
}

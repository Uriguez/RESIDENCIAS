import { useState, useEffect } from 'react';

/**
 * Hook personalizado para manejar localStorage de forma reactiva
 * Útil para persistir datos del usuario y configuraciones
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado para almacenar nuestro valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Obtener del localStorage por key
      const item = window.localStorage.getItem(key);
      // Parsear JSON almacenado o devolver initialValue si no existe
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Si hay error, devolver initialValue
      console.log('Error reading localStorage key "' + key + '":', error);
      return initialValue;
    }
  });

  // Función para setear valor
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permitir valor como función para tener la misma API que useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Guardar estado
      setStoredValue(valueToStore);
      // Guardar en localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // Un caso más avanzado sería manejar el error en un service de logging
      console.log('Error setting localStorage key "' + key + '":', error);
    }
  };

  return [storedValue, setValue] as const;
}
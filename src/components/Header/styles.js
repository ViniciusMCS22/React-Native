// src/components/Header/styles.js
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#1e1e2e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titulo: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
  },
  botaoMenu: {
    padding: 4,
  },
  iconeMenu: {
    fontSize: 26,
    color: '#fff',
  },
});
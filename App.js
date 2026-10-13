// App.js
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SQLiteProvider } from 'expo-sqlite';
import { NOME_BANCO, inicializarBanco } from './src/database';
import { ObraAtivaProvider } from './src/contexts/ObraAtivaContext';
import { PreferenciasProvider } from './src/contexts/PreferenciasContext';
import { AuthProvider } from './src/contexts/AuthContext';
import Navegacao from './src/navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      {/* Abre o banco, roda migracoes e o seed antes de montar as telas. */}
      <SQLiteProvider databaseName={NOME_BANCO} onInit={inicializarBanco}>
        <AuthProvider>
          <PreferenciasProvider>
            <ObraAtivaProvider>
              <StatusBar style="dark" />
              <Navegacao />
            </ObraAtivaProvider>
          </PreferenciasProvider>
        </AuthProvider>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}

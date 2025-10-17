'use client';
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import DataTable from '../components/DataTable';
import ImportExport from '../components/ImportExport';
import StorageDebug from '../components/StorageDebug'; // Add this
import StoreProvider from './providers';
import { useState, useEffect } from 'react';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <div>Loading...</div>
      </Container>
    );
  }

  return (
    <StoreProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <StorageDebug /> {/* Add this line */}
          <ImportExport />
          <DataTable />
        </Container>
      </ThemeProvider>
    </StoreProvider>
  );
}
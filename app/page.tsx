'use client';
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import dynamic from 'next/dynamic';
import StoreProvider from './providers';
import { useState, useEffect } from 'react';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

// Dynamically import components with SSR disabled
const ImportExport = dynamic(() => import('../components/ImportExport'), { 
  ssr: false,
  loading: () => <div style={{ height: '40px', marginBottom: '16px' }}>Loading...</div>
});

const DataTable = dynamic(() => import('../components/DataTable'), { 
  ssr: false,
  loading: () => <div style={{ minHeight: '400px' }}>Loading table...</div>
});

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <div>Loading application...</div>
      </Container>
    );
  }

  return (
    <StoreProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <ImportExport />
          <DataTable />
        </Container>
      </ThemeProvider>
    </StoreProvider>
  );
}
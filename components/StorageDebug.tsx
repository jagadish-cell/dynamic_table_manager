'use client';
import { Button, Box } from '@mui/material';
import { useDispatch } from 'react-redux';
import { resetTableState } from '../lib/slices/tableSlice';

const StorageDebug: React.FC = () => {
  const dispatch = useDispatch();

  const handleClearStorage = () => {
    if (confirm('Clear all table data and reset to default?')) {
      localStorage.removeItem('persist:tableState');
      dispatch(resetTableState());
      window.location.reload();
    }
  };

  const handleViewStorage = () => {
    const stored = localStorage.getItem('persist:tableState');
    if (stored) {
      console.log('Stored table state:', JSON.parse(stored));
      alert('Check console for stored state');
    } else {
      alert('No stored state found');
    }
  };

  return (
    <Box display="flex" gap={1} mb={2}>
      <Button variant="outlined" color="secondary" onClick={handleViewStorage}>
        Debug Storage
      </Button>
      <Button variant="outlined" color="error" onClick={handleClearStorage}>
        Clear Storage
      </Button>
    </Box>
  );
};

export default StorageDebug;
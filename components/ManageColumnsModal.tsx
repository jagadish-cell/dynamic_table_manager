'use client';
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateColumnVisibility,
  addColumn,
  type ColumnConfig,
} from '../lib/slices/tableSlice';
import { RootState } from '../lib/store';

interface ManageColumnsModalProps {
  open: boolean;
  onClose: () => void;
}

const ManageColumnsModal: React.FC<ManageColumnsModalProps> = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { columns } = useSelector((state: RootState) => state.table);
  
  const [newColumnName, setNewColumnName] = useState('');

  const handleToggleColumn = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (column) {
      dispatch(updateColumnVisibility({ id: columnId, visible: !column.visible }));
    }
  };

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      const newColumn: ColumnConfig = {
        id: newColumnName.toLowerCase().replace(/\s+/g, '_'),
        label: newColumnName,
        visible: true,
        sortable: true,
      };
      dispatch(addColumn(newColumn));
      setNewColumnName('');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Manage Columns</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" gutterBottom>
          Show/Hide Columns
        </Typography>
        
        <List>
          {columns.map(column => (
            <ListItem key={column.id}>
              <ListItemText primary={column.label} />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={column.visible}
                  onChange={() => handleToggleColumn(column.id)}
                />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        <Box mt={3}>
          <Typography variant="subtitle1" gutterBottom>
            Add New Column
          </Typography>
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Column name"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddColumn();
                }
              }}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddColumn}
              disabled={!newColumnName.trim()}
            >
              Add
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageColumnsModal;
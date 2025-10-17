'use client';
import React, { useRef, useEffect, useState } from 'react';
import {
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { Upload, Download } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import { setData, type TableRow } from '../lib/slices/tableSlice';
import { RootState } from '../lib/store';

const ImportExport: React.FC = () => {
  const dispatch = useDispatch();
  const { data, columns } = useSelector((state: RootState) => state.table);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('append');
  const [parsedData, setParsedData] = useState<TableRow[]>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleExport = () => {
    const visibleColumns = columns.filter(col => col.visible);
    const headers = visibleColumns.map(col => col.label);
    
    const csvData = data.map(row =>
      visibleColumns.map(col => row[col.id] || '')
    );

    const csv = Papa.unparse({
      fields: headers,
      data: csvData,
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'table-data.csv');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        const parsedData = results.data as any[];
        if (parsedData.length > 0) {
          const headers = parsedData[0] as string[];
          const rows = parsedData.slice(1).filter(row => row.some(Boolean));

          const importedData: TableRow[] = rows.map((row, index) => {
            const rowData: any = { id: `imported-${Date.now()}-${index}` };
            headers.forEach((header, colIndex) => {
              const key = header.toLowerCase().replace(/\s+/g, '_');
              let value = row[colIndex];
              
              // Convert age to number if it's the age column
              if (key === 'age' && !isNaN(Number(value))) {
                value = Number(value);
              }
              
              rowData[key] = value;
            });
            return rowData;
          });

          setParsedData(importedData);
          setImportDialogOpen(true);
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        alert('Error parsing CSV file. Please check the format.');
      },
      header: false,
      skipEmptyLines: true,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportConfirm = () => {
    if (importMode === 'replace') {
      // Replace all existing data
      dispatch(setData(parsedData));
    } else {
      // Append to existing data
      const newData = [...data, ...parsedData];
      dispatch(setData(newData));
    }
    setImportDialogOpen(false);
    setParsedData([]);
  };

  const handleImportCancel = () => {
    setImportDialogOpen(false);
    setParsedData([]);
  };

  // Prevent hydration issues
  if (!isClient) {
    return <Box display="flex" gap={1} mb={2} />;
  }

  return (
    <>
      <Box display="flex" gap={1} mb={2}>
        <Button
          variant="outlined"
          startIcon={<Upload />}
          onClick={() => fileInputRef.current?.click()}
        >
          Import CSV
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={handleExport}
        >
          Export CSV
        </Button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".csv"
          style={{ display: 'none' }}
        />
      </Box>

      <Dialog open={importDialogOpen} onClose={handleImportCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Import CSV Data</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Found {parsedData.length} rows to import. How would you like to proceed?
          </Typography>
          
          <RadioGroup
            value={importMode}
            onChange={(e) => setImportMode(e.target.value as 'replace' | 'append')}
            sx={{ mt: 2 }}
          >
            <FormControlLabel
              value="append"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    Append to existing data
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Keep {data.length} existing rows and add {parsedData.length} new rows
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="replace"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    Replace all data
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Remove {data.length} existing rows and replace with {parsedData.length} new rows
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>

          {parsedData.length > 0 && (
            <Box mt={2} p={2} sx={{ backgroundColor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
                Preview (first 3 rows):
              </Typography>
              {parsedData.slice(0, 3).map((row, index) => (
                <Typography key={index} variant="caption" display="block" fontFamily="monospace">
                  {Object.values(row).slice(0, 4).join(' | ')}
                  {Object.values(row).length > 4 ? '...' : ''}
                </Typography>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleImportCancel}>Cancel</Button>
          <Button onClick={handleImportConfirm} variant="contained">
            {importMode === 'append' ? 'Append Data' : 'Replace Data'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ImportExport;
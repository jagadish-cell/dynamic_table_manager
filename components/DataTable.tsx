'use client';
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TextField,
  Box,
  IconButton,
  Tooltip,
  Checkbox,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import {
  Search,
  Settings,
  Delete,
  Edit,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectFilteredSortedData,
  setSearchTerm,
  setSortConfig,
  setPagination,
  deleteRow,
  setSelectedRows,
} from '../lib/slices/tableSlice';
import { RootState } from '../lib/store';
import ManageColumnsModal from './ManageColumnsModal';

const DataTable: React.FC = () => {
  const dispatch = useDispatch();
  const filteredData = useSelector(selectFilteredSortedData);
  const { columns, searchTerm, sortConfig, pagination, selectedRows } = useSelector(
    (state: RootState) => state.table
  );

  const [manageColumnsOpen, setManageColumnsOpen] = useState(false);

  const visibleColumns = columns.filter(col => col.visible);

  const handleSort = (columnId: string) => {
    const direction =
      sortConfig.key === columnId && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    dispatch(setSortConfig({ key: columnId, direction }));
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(event.target.value));
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    dispatch(setPagination({ currentPage: newPage }));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setPagination({ currentPage: 0, rowsPerPage: parseInt(event.target.value, 10) }));
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      dispatch(setSelectedRows(filteredData.map(row => row.id)));
    } else {
      dispatch(setSelectedRows([]));
    }
  };

  const handleSelectRow = (id: string) => {
    const selectedIndex = selectedRows.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedRows, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedRows.slice(1));
    } else if (selectedIndex === selectedRows.length - 1) {
      newSelected = newSelected.concat(selectedRows.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedRows.slice(0, selectedIndex),
        selectedRows.slice(selectedIndex + 1),
      );
    }

    dispatch(setSelectedRows(newSelected));
  };

  const handleDeleteSelected = () => {
    selectedRows.forEach(id => dispatch(deleteRow(id)));
    dispatch(setSelectedRows([]));
  };

  const paginatedData = filteredData.slice(
    pagination.currentPage * pagination.rowsPerPage,
    (pagination.currentPage + 1) * pagination.rowsPerPage
  );

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h1">
            Data Table Manager
          </Typography>
          
          <Box display="flex" gap={1}>
            <TextField
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
              size="small"
            />
            
            <Tooltip title="Manage Columns">
              <IconButton onClick={() => setManageColumnsOpen(true)}>
                <Settings />
              </IconButton>
            </Tooltip>

            {selectedRows.length > 0 && (
              <Tooltip title="Delete Selected">
                <IconButton onClick={handleDeleteSelected} color="error">
                  <Delete />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedRows.length > 0 && selectedRows.length < filteredData.length}
                    checked={filteredData.length > 0 && selectedRows.length === filteredData.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                {visibleColumns.map(column => (
                  <TableCell
                    key={column.id}
                    onClick={() => column.sortable && handleSort(column.id)}
                    sx={{
                      cursor: column.sortable ? 'pointer' : 'default',
                      fontWeight: 'bold',
                      '&:hover': column.sortable ? { backgroundColor: 'action.hover' } : {},
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      {column.label}
                      {sortConfig.key === column.id && (
                        <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                      )}
                    </Box>
                  </TableCell>
                ))}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map(row => (
                <TableRow key={row.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedRows.indexOf(row.id) !== -1}
                      onChange={() => handleSelectRow(row.id)}
                    />
                  </TableCell>
                  {visibleColumns.map(column => (
                    <TableCell key={column.id}>
                      {row[column.id]}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Edit">
                        <IconButton size="small">
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this row?')) {
                              dispatch(deleteRow(row.id));
                            }
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={pagination.rowsPerPage}
          page={pagination.currentPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />

        <ManageColumnsModal
          open={manageColumnsOpen}
          onClose={() => setManageColumnsOpen(false)}
        />
      </CardContent>
    </Card>
  );
};

export default DataTable;
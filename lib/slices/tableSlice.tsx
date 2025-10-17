import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

export interface TableRow {
  id: string;
  name: string;
  email: string;
  age: number;
  role: string;
  department?: string;
  location?: string;
  [key: string]: any;
}

export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  sortable: boolean;
}

interface TableState {
  data: TableRow[];
  columns: ColumnConfig[];
  searchTerm: string;
  sortConfig: {
    key: string;
    direction: 'asc' | 'desc';
  };
  pagination: {
    currentPage: number;
    rowsPerPage: number;
  };
  selectedRows: string[];
}

const initialState: TableState = {
  data: [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      role: 'Developer',
      department: 'Engineering',
      location: 'New York'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      age: 25,
      role: 'Designer',
      department: 'Design',
      location: 'San Francisco'
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      age: 35,
      role: 'Manager',
      department: 'Operations',
      location: 'Chicago'
    },
    {
      id: '4',
      name: 'Alice Brown',
      email: 'alice@example.com',
      age: 28,
      role: 'Developer',
      department: 'Engineering',
      location: 'Boston'
    }
  ],
  columns: [
    { id: 'name', label: 'Name', visible: true, sortable: true },
    { id: 'email', label: 'Email', visible: true, sortable: true },
    { id: 'age', label: 'Age', visible: true, sortable: true },
    { id: 'role', label: 'Role', visible: true, sortable: true },
    { id: 'department', label: 'Department', visible: false, sortable: true },
    { id: 'location', label: 'Location', visible: false, sortable: true },
  ],
  searchTerm: '',
  sortConfig: { key: 'name', direction: 'asc' },
  pagination: { currentPage: 0, rowsPerPage: 10 },
  selectedRows: [],
};

const tableSlice = createSlice({
  name: 'table',
  initialState,
  reducers: {
    setData: (state, action: PayloadAction<TableRow[]>) => {
      state.data = action.payload;
    },
    updateRow: (state, action: PayloadAction<{ id: string; data: Partial<TableRow> }>) => {
      const index = state.data.findIndex(row => row.id === action.payload.id);
      if (index !== -1) {
        state.data[index] = { ...state.data[index], ...action.payload.data };
      }
    },
    deleteRow: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter(row => row.id !== action.payload);
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.pagination.currentPage = 0;
    },
    setSortConfig: (state, action: PayloadAction<{ key: string; direction: 'asc' | 'desc' }>) => {
      state.sortConfig = action.payload;
    },
    setPagination: (state, action: PayloadAction<{ currentPage: number; rowsPerPage?: number }>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    updateColumnVisibility: (state, action: PayloadAction<{ id: string; visible: boolean }>) => {
      const column = state.columns.find(col => col.id === action.payload.id);
      if (column) {
        column.visible = action.payload.visible;
      }
    },
    addColumn: (state, action: PayloadAction<ColumnConfig>) => {
      state.columns.push(action.payload);
    },
    reorderColumns: (state, action: PayloadAction<ColumnConfig[]>) => {
      state.columns = action.payload;
    },
    setSelectedRows: (state, action: PayloadAction<string[]>) => {
      state.selectedRows = action.payload;
    },
  },
});

export const {
  setData,
  updateRow,
  deleteRow,
  setSearchTerm,
  setSortConfig,
  setPagination,
  updateColumnVisibility,
  addColumn,
  reorderColumns,
  setSelectedRows,
} = tableSlice.actions;

export const selectFilteredSortedData = (state: RootState) => {
  const { data, searchTerm, sortConfig } = state.table;
  
  // Create a filtered copy of the data
  let filtered = data;
  if (searchTerm) {
    filtered = data.filter(row =>
      Object.values(row).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }

  // Create a copy of filtered array before sorting to avoid mutation
  const filteredCopy = [...filtered];

  return filteredCopy.sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export default tableSlice.reducer;
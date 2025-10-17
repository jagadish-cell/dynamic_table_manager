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

// Generate unique IDs for new rows
const generateId = () => `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const initialState: TableState = {
  data: [
    {
      id: generateId(),
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      role: 'Developer',
      department: 'Engineering',
      location: 'New York'
    },
    {
      id: generateId(),
      name: 'Jane Smith',
      email: 'jane@example.com',
      age: 25,
      role: 'Designer',
      department: 'Design',
      location: 'San Francisco'
    },
    {
      id: generateId(),
      name: 'Bob Johnson',
      email: 'bob@example.com',
      age: 35,
      role: 'Manager',
      department: 'Operations',
      location: 'Chicago'
    },
    {
      id: generateId(),
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
      // Ensure all new data has proper IDs
      const dataWithIds = action.payload.map(row => 
        row.id ? row : { ...row, id: generateId() }
      );
      state.data = dataWithIds;
    },
    addRow: (state, action: PayloadAction<Omit<TableRow, 'id'>>) => {
      const newRow: TableRow = {
        ...action.payload,
        id: generateId(),
      };
      state.data.push(newRow);
    },
    updateRow: (state, action: PayloadAction<{ id: string; data: Partial<TableRow> }>) => {
      const index = state.data.findIndex(row => row.id === action.payload.id);
      if (index !== -1) {
        // Use Object.assign to properly merge the objects without type issues
        Object.assign(state.data[index], action.payload.data);
      }
    },
    deleteRow: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter(row => row.id !== action.payload);
      // Also remove from selected rows if it was selected
      state.selectedRows = state.selectedRows.filter(id => id !== action.payload);
    },
    deleteSelectedRows: (state) => {
      state.data = state.data.filter(row => !state.selectedRows.includes(row.id));
      state.selectedRows = [];
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
    addColumn: (state, action: PayloadAction<{ label: string; visible?: boolean; sortable?: boolean; id?: string }>) => {
      const newColumn: ColumnConfig = {
        id: action.payload.id || action.payload.label.toLowerCase().replace(/\s+/g, '_'),
        label: action.payload.label,
        visible: action.payload.visible ?? true,
        sortable: action.payload.sortable ?? true,
      };
      state.columns.push(newColumn);
    },
    reorderColumns: (state, action: PayloadAction<ColumnConfig[]>) => {
      state.columns = action.payload;
    },
    setSelectedRows: (state, action: PayloadAction<string[]>) => {
      state.selectedRows = action.payload;
    },
    resetTableState: (state) => {
      return { ...initialState, data: state.data }; // Keep data but reset other state
    },
  },
});

export const {
  setData,
  addRow,
  updateRow,
  deleteRow,
  deleteSelectedRows,
  setSearchTerm,
  setSortConfig,
  setPagination,
  updateColumnVisibility,
  addColumn,
  reorderColumns,
  setSelectedRows,
  resetTableState,
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
    
    // Handle undefined/null values
    if (aValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
    if (bValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export default tableSlice.reducer;
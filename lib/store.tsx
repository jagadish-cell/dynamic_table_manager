import { configureStore } from '@reduxjs/toolkit';
import tableReducer from './slices/tableSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      table: tableReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
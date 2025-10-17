import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import tableReducer from './slices/tableSlice';

const persistConfig = {
  key: 'tableState',
  storage,
  whitelist: ['data', 'columns', 'sortConfig', 'pagination'], // what to persist
};

const persistedReducer = persistReducer(persistConfig, tableReducer);

export const makeStore = () => {
  return configureStore({
    reducer: {
      table: persistedReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
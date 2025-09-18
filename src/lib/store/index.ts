import { configureStore, Middleware } from "@reduxjs/toolkit";
import uiSlice, { uiSliceName } from "@/lib/store/uiSlice";
import layerRegistrySlice, { layerRegistrySliceName } from "@/lib/store/layerRegistrySlice";
import { acceligenceApi, cogApi, dipApi } from "@/lib/services/api";

const dev = process.env.NODE_ENV === "development";

const reducers = {
  [uiSliceName]: uiSlice,
  [layerRegistrySliceName]: layerRegistrySlice,
  [dipApi.reducerPath]: dipApi.reducer,
  [cogApi.reducerPath]: cogApi.reducer,
  [acceligenceApi.reducerPath]: acceligenceApi.reducer
};

export const createStore = () =>
  configureStore({
    devTools: dev,
    reducer: reducers,
    middleware: (getDefaultMiddleware) => {
      return getDefaultMiddleware({ serializableCheck: true })
        .concat(dipApi.middleware as Middleware)
        .concat(cogApi.middleware as Middleware)
        .concat(acceligenceApi.middleware as Middleware);
    }
  });

// Create a store instance
export const store = createStore();
// Infer the type of makeStore
export type AppStore = ReturnType<typeof createStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

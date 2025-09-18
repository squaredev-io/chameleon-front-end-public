import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BundlesState {
  selectedBundleName: string;
}

const initialState: BundlesState = {
  selectedBundleName: ""
};

const bundlesSlice = createSlice({
  name: "bundles",
  initialState,
  reducers: {
    changeSelectedBundleName: (state, action: PayloadAction<string>) => {
      state.selectedBundleName = action.payload;
    }
  }
});

export const { changeSelectedBundleName } = bundlesSlice.actions;
export default bundlesSlice.reducer;
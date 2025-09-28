
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface FilterState {
  searchQuery: string;
  selectedLabel: string | null;
}

const initialState: FilterState = {
  searchQuery: '',
  selectedLabel: null,
};

export const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedLabel: (state, action: PayloadAction<string | null>) => {
      state.selectedLabel = action.payload;
    },
  },
});

export const { setSearchQuery, setSelectedLabel } = filterSlice.actions;

export default filterSlice.reducer;

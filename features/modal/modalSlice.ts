
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface ModalState {
  selectedNoteId: string | null;
}

const initialState: ModalState = {
  selectedNoteId: null,
};

export const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openNoteModal: (state, action: PayloadAction<string>) => {
      state.selectedNoteId = action.payload;
    },
    closeNoteModal: (state) => {
      state.selectedNoteId = null;
    },
  },
});

export const { openNoteModal, closeNoteModal } = modalSlice.actions;

export default modalSlice.reducer;

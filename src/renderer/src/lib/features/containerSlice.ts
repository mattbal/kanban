import { PayloadAction } from '@reduxjs/toolkit';
import { createAppSlice } from '../createAppSlice';
import { boardAdded, boardRemoved } from './boardsSlice';
import { RootState } from '../store';

export interface Container {
  boardsOrderedIds: string[];
}

const initialState: Container = {
  boardsOrderedIds: [],
};

export const containerSlice = createAppSlice({
  name: 'container',
  initialState,
  reducers: {
    boardOrderUpdated(state, action: PayloadAction<string[]>) {
      const newOrderedIds = action.payload;
      state.boardsOrderedIds = newOrderedIds;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(boardAdded, (state, action) => {
        state.boardsOrderedIds.push(action.payload.id);
      })
      .addCase(boardRemoved, (state, action) => {
        state.boardsOrderedIds = state.boardsOrderedIds.filter(
          (boardId) => boardId !== action.payload
        );
      });
  },
});

export const { boardOrderUpdated } = containerSlice.actions;

export default containerSlice.reducer;

export const selectBoardsOrderedIds = (state: RootState) =>
  state.container.boardsOrderedIds;

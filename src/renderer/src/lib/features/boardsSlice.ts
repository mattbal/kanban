import { PayloadAction, createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { createAppSlice } from '../createAppSlice';
import { listAdded, listRemoved } from './listsSlice';
import { UniqueIdentifier } from '@dnd-kit/core';

export interface Board {
  id: string;
  title: string;
  listsOrderedIds: string[];
}

interface ListOrderUpdate {
  boardId: string;
  listsOrderedIds: string[];
}

export interface ListsAndItems {
  [listId: UniqueIdentifier]: UniqueIdentifier[];
}

const boardsAdapter = createEntityAdapter<Board>();

export const boardsSlice = createAppSlice({
  name: 'boards',
  initialState: boardsAdapter.getInitialState(),
  reducers: {
    boardRemoved: boardsAdapter.removeOne,
    boardAdded: boardsAdapter.addOne,
    boardUpdated: boardsAdapter.updateOne,
    listsOrderUpdated(state, action: PayloadAction<ListOrderUpdate>) {
      const { boardId, listsOrderedIds } = action.payload;
      boardsAdapter.updateOne(state, {
        id: boardId,
        changes: {
          listsOrderedIds: listsOrderedIds,
        },
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(listAdded, (state, action) => {
        const { id, boardId } = action.payload;
        state.entities[boardId].listsOrderedIds.push(id);
      })
      .addCase(listRemoved, (state, action) => {
        const { boardId, id: listId } = action.payload;
        state.entities[boardId].listsOrderedIds = state.entities[
          boardId
        ].listsOrderedIds.filter((id) => id !== listId);
      });
  },
});

export const { boardRemoved, boardAdded, boardUpdated, listsOrderUpdated } =
  boardsSlice.actions;

export default boardsSlice.reducer;

export const {
  selectAll: selectAllBoards,
  selectById: selectBoardById,
  selectIds: selectBoardIds,
} = boardsAdapter.getSelectors((state: RootState) => state.boards);

const selectListsOrderedIds = (state: RootState, id: string) =>
  state.boards.entities[id].listsOrderedIds;

const selectItemsOrderedIds = (state: RootState, listId: string) =>
  state.lists.entities[listId].itemsOrderedIds;

export const selectListsAndItems = createSelector(
  [selectListsOrderedIds, (state: RootState) => state],
  (lists, state) => {
    const obj: ListsAndItems = {};
    lists.forEach((listId) => {
      obj[listId] = selectItemsOrderedIds(state, listId);
    });

    return obj;
  }
);

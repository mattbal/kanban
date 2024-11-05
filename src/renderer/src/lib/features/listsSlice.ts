import { PayloadAction, createEntityAdapter } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { createAppSlice } from '../createAppSlice';
import { itemAdded, itemRemoved } from './itemsSlice';
import { ListsAndItems, boardRemoved } from './boardsSlice';

export interface List {
  id: string;
  title: string;
  itemsOrderedIds: string[];
  boardId: string;
}

type RemoveList = Pick<List, 'id' | 'boardId'>;

const listsAdapter = createEntityAdapter<List>();

export const listsSlice = createAppSlice({
  name: 'lists',
  initialState: listsAdapter.getInitialState(),
  reducers: {
    listRemoved(state, action: PayloadAction<RemoveList>) {
      const { id } = action.payload;
      listsAdapter.removeOne(state, id);
    },
    listAdded: listsAdapter.addOne,
    listUpdated: listsAdapter.updateOne,
    listsItemsUpdated(state, action: PayloadAction<ListsAndItems>) {
      Object.keys(action.payload).forEach((listId) => {
        listsAdapter.updateOne(state, {
          id: listId,
          changes: {
            itemsOrderedIds: action.payload[listId] as string[],
          },
        });
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(itemAdded, (state, action) => {
        const { listId, id: itemId } = action.payload;
        state.entities[listId].itemsOrderedIds.push(itemId);
      })
      .addCase(itemRemoved, (state, action) => {
        const { listId, id: itemId } = action.payload;
        state.entities[listId].itemsOrderedIds = state.entities[
          listId
        ].itemsOrderedIds.filter((id) => id !== itemId);
      })
      .addCase(boardRemoved, (state, action) => {
        const boardId = action.payload;
        for (const entity of Object.values(state.entities)) {
          if (entity.boardId === boardId) {
            listsAdapter.removeOne(state, entity.id);
          }
        }
      });
  },
});

export const { listRemoved, listAdded, listUpdated, listsItemsUpdated } =
  listsSlice.actions;

export default listsSlice.reducer;

export const {
  selectAll: selectAllLists,
  selectById: selectListById,
  selectIds: selectListIds,
} = listsAdapter.getSelectors((state: RootState) => state.lists);

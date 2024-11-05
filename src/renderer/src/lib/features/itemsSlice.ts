import { PayloadAction, createEntityAdapter } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { listRemoved } from './listsSlice';
import { createAppSlice } from '../createAppSlice';
import { boardRemoved } from './boardsSlice';

interface Item {
  id: string;
  value: string;
  listId: string;
  boardId: string;
}

type RemoveItem = Pick<Item, 'id' | 'listId'>;

const itemsAdapter = createEntityAdapter<Item>();

export const itemsSlice = createAppSlice({
  name: 'items',
  initialState: itemsAdapter.getInitialState(),
  reducers: {
    itemRemoved(state, action: PayloadAction<RemoveItem>) {
      const { id } = action.payload;
      itemsAdapter.removeOne(state, id);
    },
    itemAdded: itemsAdapter.addOne,
    itemUpdated: itemsAdapter.updateOne,
  },
  extraReducers: (builder) => {
    builder
      .addCase(listRemoved, (state, action) => {
        const { id: listId } = action.payload;
        for (const entity of Object.values(state.entities)) {
          if (entity.listId === listId) {
            itemsAdapter.removeOne(state, entity.id);
          }
        }
      })
      .addCase(boardRemoved, (state, action) => {
        const boardId = action.payload;
        for (const entity of Object.values(state.entities)) {
          if (entity.boardId === boardId) {
            itemsAdapter.removeOne(state, entity.id);
          }
        }
      });
  },
});

export const { itemRemoved, itemAdded, itemUpdated } = itemsSlice.actions;

export default itemsSlice.reducer;

export const {
  selectAll: selectAllItems,
  selectById: selectItemById,
  selectIds: selectItemIds,
} = itemsAdapter.getSelectors((state: RootState) => state.items);

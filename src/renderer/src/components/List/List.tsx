import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import { listRemoved, listUpdated, selectListById } from '../../lib/features/listsSlice';
import AddItemBtn from '../Item/AddItemBtn';
import DeleteMenu from '../DeleteMenu';
import { DraggableAttributes } from '@dnd-kit/core';
import { forwardRef, useEffect } from 'react';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';

type Props = {
  listId: string;
  boardId: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  attributes?: DraggableAttributes;
  listeners?: SyntheticListenerMap | undefined;
  dragOverlay?: boolean;
};

const List = forwardRef<HTMLDivElement, Props>(function List(
  { listId, boardId, children, style, attributes, listeners, dragOverlay }: Props,
  ref
) {
  const dispatch = useAppDispatch();
  const list = useAppSelector((state) => selectListById(state, listId));

  useEffect(() => {
    if (!dragOverlay) {
      return;
    }

    document.body.style.cursor = 'grabbing';

    return () => {
      document.body.style.cursor = '';
    };
  }, [dragOverlay]);

  return (
    <div
      className='flex-shrink-0 p-2 mb-4 border border-gray-300 rounded-md bg-gray-50 w-72 h-fit'
      ref={ref}
      style={style}
      {...attributes}
      {...listeners}
      data-testid='list'
    >
      <div className='flex items-center justify-between mb-2'>
        <input
          className='px-2 font-bold text-gray-700 bg-transparent border border-transparent rounded-[4px] hover:border-gray-500'
          value={list.title}
          placeholder='List'
          type='text'
          onChange={(e) =>
            dispatch(
              listUpdated({
                id: list.id,
                changes: {
                  title: e.target.value,
                },
              })
            )
          }
          onKeyDown={(e) => {
            // prevent enter from triggering drag
            e.stopPropagation();
            if (e.key === 'Enter') {
              e.currentTarget.blur();
            }
          }}
          data-no-dnd='true'
        />
        <DeleteMenu handleClick={() => dispatch(listRemoved({ id: listId, boardId }))} />
      </div>
      <div className='flex flex-col gap-2'>{children}</div>
      <AddItemBtn listId={list.id} boardId={boardId} />
    </div>
  );
});

export default List;

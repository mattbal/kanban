import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import { itemRemoved, itemUpdated, selectItemById } from '../../lib/features/itemsSlice';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import * as ContextMenu from '@radix-ui/react-context-menu';

type Props = {
  id: string;
  listId: string | undefined;
  dragOverlay?: boolean;
  isDragging?: boolean;
  fadeIn?: boolean;
  style?: React.CSSProperties;
  listeners?: SyntheticListenerMap | undefined;
};

const Item = forwardRef<HTMLDivElement, Props>(function Item(
  { id, listId, dragOverlay, isDragging, fadeIn, style, listeners }: Props,
  ref
) {
  const dispatch = useAppDispatch();
  const item = useAppSelector((state) => selectItemById(state, id));

  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <div
          ref={ref}
          className={`relative p-2 break-all bg-white border rounded-md border-gray-300 shadow-sm2 group focus-visible:shadow-sm ${
            isDragging && !dragOverlay ? 'opacity-50 z-0' : undefined
          } ${fadeIn ? 'animate-fadeIn' : undefined} ${
            isDragging ? 'cursor-grab' : undefined
          }`}
          onDoubleClick={() => setIsEditing(true)}
          tabIndex={0}
          style={style}
          {...listeners}
          data-testid='item'
        >
          {isEditing ? (
            <input
              autoFocus
              ref={inputRef}
              value={item.value}
              type='text'
              onChange={(e) =>
                dispatch(
                  itemUpdated({
                    id,
                    changes: {
                      value: e.target.value,
                    },
                  })
                )
              }
              onBlur={() => setIsEditing(false)}
              className='w-full px-1 break-words resize-none'
              onKeyDown={(e) => {
                // prevent enter from triggering drag
                e.stopPropagation();
                if (e.key === 'Enter') {
                  e.currentTarget.blur();
                }
              }}
              data-no-dnd='true'
            />
          ) : (
            <p className='px-1'>{item.value}</p>
          )}
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            if (isEditing) {
              inputRef.current?.focus();
            }
          }}
          className='flex flex-col gap-1 p-1 bg-white border border-gray-300 rounded-md shadow-md w-36'
          data-no-dnd='true'
        >
          <ContextMenu.Item
            onSelect={() => {
              setIsEditing(true);
            }}
          >
            <button className='flex items-center w-full p-1 text-sm text-gray-600 rounded-md cursor-pointer hover:bg-gray-100'>
              <PencilIcon className='mr-2 text-gray-500 size-5' />
              Edit
            </button>
          </ContextMenu.Item>
          <ContextMenu.Item
            onSelect={() => {
              if (listId) {
                dispatch(itemRemoved({ id, listId }));
              }
            }}
          >
            <button className='flex items-center w-full p-1 text-sm text-red-600 rounded-md cursor-pointer hover:bg-red-100'>
              <TrashIcon className='mr-2 text-red-500 size-5' />
              Delete
            </button>
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
});

export default Item;

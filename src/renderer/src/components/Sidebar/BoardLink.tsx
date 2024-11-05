import { useNavigate } from 'react-router-dom';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import {
  boardRemoved,
  boardUpdated,
  selectBoardById,
} from '../../lib/features/boardsSlice';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { DraggableAttributes } from '@dnd-kit/core';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';

type Props = {
  id: string;
  dragOverlay?: boolean;
  isDragging?: boolean;
  listeners?: SyntheticListenerMap | undefined;
  attributes?: DraggableAttributes;
  style?: React.CSSProperties;
};

const BoardLink = forwardRef<HTMLDivElement, Props>(function BoardLink(
  { id, dragOverlay, isDragging, listeners, attributes, style }: Props,
  ref
) {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);

  const dispatch = useAppDispatch();
  const board = useAppSelector((state) => selectBoardById(state, id));

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
          tabIndex={0}
          className={`${isDragging && !dragOverlay ? 'opacity-50 z-0' : undefined}`}
          style={style}
          {...listeners}
          {...attributes}
        >
          {isEditing ? (
            <input
              autoFocus
              ref={inputRef}
              value={board.title}
              type='text'
              onChange={(e) =>
                dispatch(
                  boardUpdated({
                    id,
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
              onBlur={() => setIsEditing(false)}
              className='w-full px-2 bg-gray-200'
            />
          ) : (
            <NavLink
              to={`/boards/${id}`}
              onDoubleClick={() => setIsEditing(true)}
              className={({ isActive }) =>
                isActive
                  ? 'px-2 w-full block whitespace-pre text-left text-gray-700 rounded-md overflow-hidden overflow-ellipsis bg-gray-200'
                  : 'px-2 w-full block whitespace-pre text-left text-gray-700 rounded-md overflow-hidden overflow-ellipsis'
              }
            >
              {board.title ? board.title : 'New Board'}
            </NavLink>
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
              dispatch(boardRemoved(id));
              navigate(`/`);
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

export default BoardLink;

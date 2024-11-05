import { useNavigate } from 'react-router-dom';
import { boardAdded } from '../../lib/features/boardsSlice';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import { PlusIcon } from '@heroicons/react/24/outline';
import BoardLink from './BoardLink';
import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  DropAnimation,
  UniqueIdentifier,
  closestCenter,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { KeyboardSensor, MouseSensor, TouchSensor } from '../../lib/sensors';
import { sortableKeyboardCoordinates } from './coordinateGetter';
import {
  boardOrderUpdated,
  selectBoardsOrderedIds,
} from '../../lib/features/containerSlice';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import SortableBoardLink from './SortableBoardLink';

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

export default function Sidebar() {
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const boards = useAppSelector(selectBoardsOrderedIds);

  // Drag and drop
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const getIndex = (id: UniqueIdentifier) => boards.indexOf(id as string);
  const activeIndex = activeId ? getIndex(activeId) : -1;

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        delay: 250,
        distance: 3,
        tolerance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        distance: 3,
        tolerance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <aside className='fixed flex flex-col justify-between h-full border-r border-gray-300 w-44 bg-gray-50'>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={({ active }) => {
          if (!active) {
            return;
          }

          setActiveId(active.id);
        }}
        onDragEnd={({ over }) => {
          setActiveId(null);

          if (over) {
            const overIndex = getIndex(over.id);
            if (activeIndex !== overIndex) {
              dispatch(boardOrderUpdated(arrayMove(boards, activeIndex, overIndex)));
            }
          }
        }}
        onDragCancel={() => setActiveId(null)}
      >
        <div className='flex flex-col gap-1 pt-4 overflow-y-auto pb-11'>
          <SortableContext items={boards} strategy={verticalListSortingStrategy}>
            {boards.map((boardId) => (
              <div className='mx-4' key={boardId}>
                <SortableBoardLink id={boardId} />
              </div>
            ))}
          </SortableContext>
        </div>
        {createPortal(
          <DragOverlay dropAnimation={dropAnimation}>
            {activeId ? <BoardLink id={boards[activeIndex]} dragOverlay /> : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
      <button
        className='absolute bottom-0 left-0 flex items-center self-end justify-center w-full h-10 mt-auto text-gray-600 border-t border-gray-300 shadow-sm bg-gray-50 hover:bg-gray-200'
        onClick={() => {
          const id = crypto.randomUUID();
          dispatch(
            boardAdded({
              id,
              listsOrderedIds: [],
              title: '',
            })
          );
          navigate(`/boards/${id}`);
        }}
      >
        <PlusIcon className='mr-2 text-gray-600 size-5' />
        Add Board
      </button>
    </aside>
  );
}

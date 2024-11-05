import { useRef, useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import { listAdded, listUpdated, listsItemsUpdated } from '../../lib/features/listsSlice';
import { useNavigate, useParams } from 'react-router-dom';
import {
  selectBoardById,
  boardRemoved,
  boardUpdated,
  selectListsAndItems,
  ListsAndItems,
  listsOrderUpdated,
} from '../../lib/features/boardsSlice';
import List from '../List/List';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import DeleteMenu from '../DeleteMenu';
import {
  CollisionDetection,
  DndContext,
  DragOverlay,
  DropAnimation,
  MeasuringStrategy,
  UniqueIdentifier,
  closestCenter,
  defaultDropAnimationSideEffects,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { KeyboardSensor, MouseSensor, TouchSensor } from '../../lib/sensors';
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { coordinateGetter } from './coordinateGetter';
import Item from '../Item/Item';
import { createPortal } from 'react-dom';
import SortableList from '../List/SortableList';
import SortableItem from '../Item/SortableItem';

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

export default function Board() {
  const { boardId } = useParams();
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const board = useAppSelector((state) => selectBoardById(state, boardId!));
  const listsAndItems = useAppSelector((state) => selectListsAndItems(state, boardId!));

  // use refs to dynamically update the width of the title input field to match the length of the input text
  const hiddenPlaceholderTextRef = useRef<HTMLSpanElement>(null);
  const hiddenTitleTextRef = useRef<HTMLSpanElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // 176 is the width of the side menu (144px) + padding for the main section (32px, 16px on each side)
  // 18 = 16px (8px padding on each side) + 2px for border
  useEffect(() => {
    if (hiddenTitleTextRef.current) {
      hiddenTitleTextRef.current.style.maxWidth = `${window.innerWidth - 176}px`;
    }

    function handleResize() {
      if (hiddenTitleTextRef.current) {
        hiddenTitleTextRef.current.style.maxWidth = `${window.innerWidth - 176}px`;
      }

      if (titleInputRef.current) {
        let nextWidth;

        if (titleInputRef.current.value === '') {
          nextWidth = Math.min(
            (hiddenPlaceholderTextRef.current?.offsetWidth ?? 0) + 18,
            window.innerWidth - 176
          );
        } else {
          nextWidth = Math.min(
            (hiddenTitleTextRef.current?.offsetWidth ?? 0) + 18,
            window.innerWidth - 176
          );
        }
        titleInputRef.current.style.width = `${nextWidth}px`;
      }
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (titleInputRef.current) {
      let nextWidth;

      if (titleInputRef.current.value === '') {
        nextWidth = Math.min(
          (hiddenPlaceholderTextRef.current?.offsetWidth ?? 0) + 18,
          window.innerWidth - 176
        );
      } else {
        nextWidth = Math.min(
          (hiddenTitleTextRef.current?.offsetWidth ?? 0) + 18,
          window.innerWidth - 176
        );
      }
      titleInputRef.current.style.width = `${nextWidth}px`;
    }
  }, [board.title]);

  const [showAddCard, setShowAddCard] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  // Drag and drop code
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);
  const [clonedItems, setClonedItems] = useState<ListsAndItems | null>(null);
  const isSortingContainer = activeId
    ? board.listsOrderedIds.includes(activeId as string)
    : false;
  /**
   * Custom collision detection strategy optimized for multiple containers
   *
   * - First, find any droppable containers intersecting with the pointer.
   * - If there are none, find intersecting containers with the active draggable.
   * - If there are no intersecting containers, return the last matched intersection
   *
   */
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      if (activeId && activeId in listsAndItems) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) => container.id in listsAndItems
          ),
        });
      }

      // Start by finding any intersecting droppable
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? // If there are droppables intersecting with the pointer, return those
            pointerIntersections
          : rectIntersection(args);
      let overId = getFirstCollision(intersections, 'id');

      if (overId != null) {
        if (overId in listsAndItems) {
          const containerItems = listsAndItems[overId];

          // If a container is matched and it contains items (columns 'A', 'B', 'C')
          if (containerItems.length > 0) {
            // Return the closest droppable within that container
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) =>
                  container.id !== overId && containerItems.includes(container.id)
              ),
            })[0]?.id;
          }
        }

        lastOverId.current = overId;

        return [{ id: overId }];
      }

      // When a draggable item moves to a new container, the layout may shift
      // and the `overId` may become `null`. We manually set the cached `lastOverId`
      // to the id of the draggable item that was moved to the new container, otherwise
      // the previous `overId` will be returned which can cause items to incorrectly shift positions
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }

      // If no droppable is matched, return the last match
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeId, listsAndItems]
  );

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
      coordinateGetter,
    })
  );

  const findContainer = (id: UniqueIdentifier) => {
    if (id in listsAndItems) {
      return id;
    }

    return board.listsOrderedIds.find((key) => listsAndItems[key].includes(id));
  };

  const onDragCancel = () => {
    if (clonedItems) {
      // Reset items to their original state in case items have been
      // Dragged across containers
      dispatch(listsItemsUpdated(clonedItems));
    }

    setActiveId(null);
    setClonedItems(null);
  };

  if (!boardId) {
    return <p>Error. Board id not found.</p>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
      onDragStart={({ active }) => {
        setActiveId(active.id);
        setClonedItems(listsAndItems);
      }}
      onDragOver={({ active, over }) => {
        const overId = over?.id;

        if (overId == null || active.id in listsAndItems) {
          return;
        }

        const overContainer = findContainer(overId);
        const activeContainer = findContainer(active.id);

        if (!overContainer || !activeContainer) {
          return;
        }

        if (activeContainer !== overContainer) {
          const activeItems = listsAndItems[activeContainer];
          const overItems = listsAndItems[overContainer];
          const overIndex = overItems.indexOf(overId);
          const activeIndex = activeItems.indexOf(active.id);

          let newIndex: number;

          if (overId in listsAndItems) {
            newIndex = overItems.length + 1;
          } else {
            const isBelowOverItem =
              over &&
              active.rect.current.translated &&
              active.rect.current.translated.top > over.rect.top + over.rect.height;

            const modifier = isBelowOverItem ? 1 : 0;

            newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
          }

          recentlyMovedToNewContainer.current = true;

          dispatch(
            listUpdated({
              id: activeContainer as string,
              changes: {
                itemsOrderedIds: listsAndItems[activeContainer].filter(
                  (item) => item !== active.id
                ) as string[],
              },
            })
          );

          dispatch(
            listUpdated({
              id: overContainer as string,
              changes: {
                itemsOrderedIds: [
                  ...listsAndItems[overContainer].slice(0, newIndex),
                  listsAndItems[activeContainer][activeIndex],
                  ...listsAndItems[overContainer].slice(
                    newIndex,
                    listsAndItems[overContainer].length
                  ),
                ] as string[],
              },
            })
          );
        }
      }}
      onDragEnd={({ active, over }) => {
        if (active.id in listsAndItems && over?.id) {
          const activeIndex = board.listsOrderedIds.indexOf(active.id as string);
          const overIndex = board.listsOrderedIds.indexOf(over.id as string);

          dispatch(
            listsOrderUpdated({
              boardId: boardId!,
              listsOrderedIds: arrayMove(board.listsOrderedIds, activeIndex, overIndex),
            })
          );
        }

        const activeContainer = findContainer(active.id);

        if (!activeContainer) {
          setActiveId(null);
          return;
        }

        const overId = over?.id;

        if (overId == null) {
          setActiveId(null);
          return;
        }

        const overContainer = findContainer(overId);

        if (overContainer) {
          const activeIndex = listsAndItems[activeContainer].indexOf(active.id);
          const overIndex = listsAndItems[overContainer].indexOf(overId);

          if (activeIndex !== overIndex) {
            dispatch(
              listUpdated({
                id: overContainer as string,
                changes: {
                  itemsOrderedIds: arrayMove(
                    listsAndItems[overContainer],
                    activeIndex,
                    overIndex
                  ) as string[],
                },
              })
            );
          }
        }

        setActiveId(null);
      }}
      onDragCancel={onDragCancel}
    >
      <main className='flex flex-col h-screen'>
        <div className='flex items-center px-4 pt-4 mb-4'>
          <span
            className='absolute invisible overflow-hidden text-2xl font-bold whitespace-pre'
            ref={hiddenPlaceholderTextRef}
          >
            New board
          </span>
          <span
            className='absolute invisible overflow-hidden text-2xl font-bold whitespace-pre'
            ref={hiddenTitleTextRef}
          >
            {board.title}
          </span>
          <input
            className='px-2 text-2xl font-bold border border-transparent rounded-md hover:border-gray-500'
            value={board.title}
            placeholder='New Board'
            type='text'
            onChange={(e) =>
              dispatch(
                boardUpdated({
                  id: boardId!,
                  changes: {
                    title: e.target.value,
                  },
                })
              )
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            ref={titleInputRef}
          />
          <DeleteMenu
            handleClick={() => {
              dispatch(boardRemoved(boardId!));
              navigate('/');
            }}
          />
        </div>
        <div className='grow'>
          <div className='flex h-full gap-3 px-6 overflow-x-auto'>
            <SortableContext
              items={board.listsOrderedIds}
              strategy={horizontalListSortingStrategy}
            >
              {board.listsOrderedIds.map((listId) => (
                <SortableList
                  key={listId}
                  boardId={boardId!}
                  listId={listId}
                  items={listsAndItems[listId]}
                >
                  <SortableContext items={listsAndItems[listId]}>
                    {listsAndItems[listId].map((itemId) => (
                      <SortableItem
                        key={itemId}
                        itemId={itemId as string}
                        listId={listId}
                        disabled={isSortingContainer}
                      />
                    ))}
                  </SortableContext>
                </SortableList>
              ))}
            </SortableContext>
            {showAddCard ? (
              <div className='flex-shrink-0 p-2 border border-gray-300 rounded-md bg-gray-50 w-72 h-fit'>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    dispatch(
                      listAdded({
                        id: crypto.randomUUID(),
                        title: newListTitle,
                        itemsOrderedIds: [],
                        boardId: boardId!,
                      })
                    );
                    setShowAddCard(false);
                    setNewListTitle('');
                  }}
                >
                  <input
                    autoFocus
                    type='text'
                    placeholder='Enter list title...'
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    className='w-full p-2 mb-2 border border-gray-300 rounded-md'
                  />
                  <div className='flex items-center'>
                    <button
                      className='px-3 py-1 mr-1 text-white bg-green-600 rounded-md hover:bg-green-700'
                      type='submit'
                    >
                      Add list
                    </button>
                    <button
                      onClick={() => {
                        setShowAddCard(false);
                        setNewListTitle('');
                      }}
                      className='p-1 rounded-md hover:bg-gray-200'
                    >
                      <XMarkIcon className='text-gray-700 size-6' />
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <button
                className='flex items-center flex-shrink-0 p-2 text-white bg-green-600 rounded-md w-72 h-fit'
                onClick={() => setShowAddCard(true)}
              >
                <PlusIcon className='mr-2 text-white size-5' />
                {board.listsOrderedIds.length === 0 ? 'Add a list' : 'Add another list'}
              </button>
            )}
          </div>
        </div>
      </main>
      {createPortal(
        <DragOverlay dropAnimation={dropAnimation}>
          {activeId
            ? board.listsOrderedIds.includes(activeId as string)
              ? renderListDragOverlay(activeId, boardId!, listsAndItems)
              : renderItemDragOverlay(activeId)
            : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}

function renderListDragOverlay(
  listId: UniqueIdentifier,
  boardId: string,
  listsAndItems: ListsAndItems
) {
  return (
    <List listId={listId as string} boardId={boardId} dragOverlay>
      {listsAndItems[listId].map((itemId) => (
        <Item key={itemId} id={itemId as string} listId={listId as string} />
      ))}
    </List>
  );
}

function renderItemDragOverlay(itemId: UniqueIdentifier) {
  return <Item id={itemId as string} listId={undefined} dragOverlay />;
}

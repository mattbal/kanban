import { UniqueIdentifier } from '@dnd-kit/core';
import {
  AnimateLayoutChanges,
  defaultAnimateLayoutChanges,
  useSortable,
} from '@dnd-kit/sortable';
import List from './List';
import { CSS } from '@dnd-kit/utilities';

type Props = {
  listId: string;
  boardId: string;
  items: UniqueIdentifier[];
  children: React.ReactNode;
};

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

export default function SortableList({ listId, boardId, items, children }: Props) {
  const { attributes, isDragging, listeners, setNodeRef, transition, transform } =
    useSortable({
      id: listId,
      data: {
        type: 'container',
        children: items,
      },
      animateLayoutChanges,
    });

  return (
    <List
      ref={setNodeRef}
      listId={listId}
      boardId={boardId}
      style={{
        transition,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : undefined,
      }}
      attributes={attributes}
      listeners={listeners}
    >
      {children}
    </List>
  );
}

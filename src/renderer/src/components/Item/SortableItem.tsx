import {
  AnimateLayoutChanges,
  defaultAnimateLayoutChanges,
  useSortable,
} from '@dnd-kit/sortable';
import Item from './Item';
import { CSS } from '@dnd-kit/utilities';
import { useEffect, useState } from 'react';

type Props = {
  itemId: string;
  listId: string;
  disabled: boolean;
};

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

export default function SortableItem({ itemId, listId, disabled }: Props) {
  const { setNodeRef, listeners, isDragging, transform, transition } = useSortable({
    id: itemId,
    animateLayoutChanges,
  });

  function useMountStatus() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      const timeout = setTimeout(() => setIsMounted(true), 500);

      return () => clearTimeout(timeout);
    }, []);

    return isMounted;
  }

  // used to fadein items when dragged from one container to another and it appears
  const mounted = useMountStatus();
  const mountedWhileDragging = isDragging && !mounted;

  return (
    <Item
      ref={disabled ? undefined : setNodeRef}
      id={itemId}
      listId={listId}
      isDragging={isDragging}
      style={{ transition, transform: CSS.Translate.toString(transform) }}
      fadeIn={mountedWhileDragging}
      listeners={listeners}
    />
  );
}

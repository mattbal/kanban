import {
  AnimateLayoutChanges,
  defaultAnimateLayoutChanges,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import BoardLink from './BoardLink';

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

type Props = {
  id: string;
};

export default function SortableBoardLink({ id }: Props) {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } =
    useSortable({
      id,
      animateLayoutChanges,
    });

  return (
    <BoardLink
      id={id}
      ref={setNodeRef}
      isDragging={isDragging}
      style={{ transition, transform: CSS.Translate.toString(transform) }}
      listeners={listeners}
      attributes={attributes}
    />
  );
}

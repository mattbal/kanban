import { useAppDispatch } from '../../lib/hooks';
import { itemAdded } from '../../lib/features/itemsSlice';
import { useRef, useState } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

type Props = {
  listId: string;
  boardId: string;
};

export default function AddItemBtn({ listId, boardId }: Props) {
  const dispatch = useAppDispatch();

  const [showForm, setShowForm] = useState(false);
  const [itemValue, setItemValue] = useState('');

  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (itemValue === '') return;
    dispatch(
      itemAdded({
        id: crypto.randomUUID(),
        value: itemValue,
        listId,
        boardId,
      })
    );
    setShowForm(false);
    setItemValue('');
  };

  return showForm ? (
    <form className='mt-2' onSubmit={handleSubmit} ref={formRef} data-no-dnd='true'>
      <input
        autoFocus
        placeholder='Enter an item...'
        value={itemValue}
        type='text'
        onChange={(e) => setItemValue(e.target.value)}
        className='w-full px-3 py-2 mb-2 break-words bg-white border border-gray-300 rounded-md resize-none'
        onKeyDown={(e) => {
          // prevent enter from triggering drag
          e.stopPropagation();
          if (e.key === 'Enter') {
            e.currentTarget.blur();
          }
        }}
      />
      <div className='flex items-center'>
        <button
          className='px-3 py-1 mr-1 text-white bg-green-600 rounded-md hover:bg-green-700'
          type='submit'
          onKeyDown={(e) => {
            // prevent enter from triggering drag
            e.stopPropagation();
            if (e.key === 'Enter') {
              formRef.current?.submit();
            }
          }}
        >
          Add item
        </button>
        <button
          onClick={() => {
            setShowForm(false);
            setItemValue('');
          }}
          className='p-1 rounded-md hover:bg-gray-200'
          onKeyDown={(e) => {
            // prevent enter from triggering drag
            e.stopPropagation();
            if (e.key === 'Enter') {
              setShowForm(false);
              setItemValue('');
            }
          }}
        >
          <XMarkIcon className='text-gray-700 size-6' />
        </button>
      </div>
    </form>
  ) : (
    <button
      className='flex items-center w-full p-2 mt-2 rounded-md hover:bg-gray-200'
      onClick={() => setShowForm(true)}
      data-no-dnd='true'
      onKeyDown={(e) => {
        // prevent enter from triggering drag
        e.stopPropagation();
        if (e.key === 'Enter') {
          setShowForm(true);
        }
      }}
    >
      <PlusIcon className='mr-2 text-gray-700 size-5' />
      Add Item
    </button>
  );
}

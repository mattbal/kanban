import { EllipsisHorizontalIcon, TrashIcon } from '@heroicons/react/24/outline';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

type Props = {
  handleClick: () => void;
};

export default function DeleteMenu({ handleClick }: Props) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className='p-1 rounded-md hover:bg-gray-200'
        data-no-dnd='true'
        data-testid='dropdownButton'
      >
        <EllipsisHorizontalIcon className='text-gray-600 size-6' />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align='start'
          side='bottom'
          className='p-1 mt-0.5 bg-white border border-gray-300 rounded-md shadow-md w-36'
          data-no-dnd='true'
        >
          <DropdownMenu.Item
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Space' || e.key === 'Enter') {
                handleClick();
              }
            }}
          >
            <button
              className='flex items-center w-full p-1 text-sm text-red-600 rounded-md hover:bg-red-100'
              onClick={handleClick}
            >
              <TrashIcon className='mr-2 text-red-600 size-5' />
              Delete
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

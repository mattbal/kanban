import { describe, expect, test } from 'vitest';
import { renderWithProvider } from './test-utils';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { routesConfig } from '../src/renderer/src/routesConfig';
import React from 'react';

describe('board', () => {
  test('Typing in Board title updates title', async () => {
    const user = userEvent.setup();

    const { store } = renderWithProvider(
      <RouterProvider router={createMemoryRouter(routesConfig)} />,
      {
        preloadedState: {
          boards: {
            ids: ['1'],
            entities: {
              ['1']: {
                id: '1',
                listsOrderedIds: [],
                title: 'Test Board',
              },
            },
          },
          container: {
            boardsOrderedIds: ['1'],
          },
        },
      }
    );

    const boardLink = screen.getByRole('link', {
      name: /test board/i,
    });
    expect(boardLink).toBeInTheDocument();
    await user.click(boardLink);

    const input = screen.getByDisplayValue('Test Board') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    await user.clear(input);
    await user.type(input, 'Coding Project');
    expect(input.value).toBe('Coding Project');
    expect(store.getState().boards.entities['1'].title).toBe('Coding Project');
  });

  test('Clicking ellipsis button opens up dropdown menu', async () => {
    const user = userEvent.setup();

    renderWithProvider(<RouterProvider router={createMemoryRouter(routesConfig)} />, {
      preloadedState: {
        boards: {
          ids: ['1'],
          entities: {
            ['1']: {
              id: '1',
              listsOrderedIds: [],
              title: 'Test Board',
            },
          },
        },
        container: {
          boardsOrderedIds: ['1'],
        },
      },
    });

    const boardLink = screen.getByRole('link', {
      name: /test board/i,
    });
    expect(boardLink).toBeInTheDocument();
    await user.click(boardLink);

    const button = screen.getByRole('button', {
      expanded: false,
    });
    expect(button).toBeInTheDocument();
    await user.click(button);
    expect(screen.getByRole('menu')).toBeTruthy();
  });

  test('Clicking dropdown menu delete button lets you delete the board and its lists and items', async () => {
    const user = userEvent.setup();

    const { store } = renderWithProvider(
      <RouterProvider router={createMemoryRouter(routesConfig)} />,
      {
        preloadedState: {
          items: {
            ids: ['3', '5'],
            entities: {
              ['3']: {
                boardId: '1',
                listId: '2',
                id: '3',
                value: 'Buy bananas',
              },
              ['5']: {
                boardId: '1',
                listId: '4',
                id: '5',
                value: 'Buy grapes',
              },
            },
          },
          lists: {
            ids: ['2', '4'],
            entities: {
              ['2']: {
                boardId: '1',
                id: '2',
                itemsOrderedIds: [],
                title: 'Grocery List',
              },
              ['4']: {
                boardId: '1',
                id: '4',
                itemsOrderedIds: [],
                title: 'Walmart List',
              },
            },
          },
          boards: {
            ids: ['1'],
            entities: {
              ['1']: {
                id: '1',
                listsOrderedIds: ['2', '4'],
                title: 'Test Board',
              },
            },
          },
          container: {
            boardsOrderedIds: ['1'],
          },
        },
      }
    );

    const boardLink = screen.getByRole('link', {
      name: /test board/i,
    });
    expect(boardLink).toBeInTheDocument();
    await user.click(boardLink);

    const button = screen.getAllByTestId('dropdownButton')[0];
    expect(button).toBeInTheDocument();
    await user.click(button);
    expect(screen.getByRole('menu')).toBeTruthy();

    const deleteButton = screen.getByRole('menuitem');
    expect(deleteButton).toBeInTheDocument();
    await user.click(deleteButton);
    expect(store.getState().boards.ids.length === 0);
    expect(store.getState().container.boardsOrderedIds.length === 0);
    expect(store.getState().lists.ids.length === 0);
    expect(store.getState().items.ids.length === 0);
  });

  test('Clicking add list and filling out form adds a list', async () => {
    const user = userEvent.setup();

    const { store } = renderWithProvider(
      <RouterProvider router={createMemoryRouter(routesConfig)} />,
      {
        preloadedState: {
          boards: {
            ids: ['1'],
            entities: {
              ['1']: {
                id: '1',
                listsOrderedIds: [],
                title: 'Test Board',
              },
            },
          },
          container: {
            boardsOrderedIds: ['1'],
          },
        },
      }
    );

    expect(store.getState().lists.ids.length === 0);

    const boardLink = screen.getByRole('link', {
      name: /test board/i,
    });
    expect(boardLink).toBeInTheDocument();
    await user.click(boardLink);

    const addAListButton = screen.getByRole('button', {
      name: /add a list/i,
    });
    expect(addAListButton).toBeInTheDocument();
    await user.click(addAListButton);

    const input = screen.getByPlaceholderText(/Enter list title/i);
    expect(input).toBeInTheDocument();
    await user.type(input, 'Grocery List');
    const addListButton = screen.getByRole('button', {
      name: /add list/i,
    });
    await user.click(addListButton);

    expect(store.getState().lists.ids[0]).toBeTruthy();
    const id = store.getState().lists.ids[0];
    expect(store.getState().lists.entities[id].boardId === '1');
    expect(store.getState().lists.entities[id].title === 'Grocery List');
    expect(store.getState().boards.entities['1'].listsOrderedIds[0] === id);
  });

  test('Clicking add item and filling out form adds an item to list', async () => {
    const user = userEvent.setup();

    const { store } = renderWithProvider(
      <RouterProvider router={createMemoryRouter(routesConfig)} />,
      {
        preloadedState: {
          lists: {
            ids: ['2'],
            entities: {
              ['2']: {
                boardId: '1',
                id: '2',
                itemsOrderedIds: [],
                title: 'Grocery List',
              },
            },
          },
          boards: {
            ids: ['1'],
            entities: {
              ['1']: {
                id: '1',
                listsOrderedIds: ['2'],
                title: 'Test Board',
              },
            },
          },
          container: {
            boardsOrderedIds: ['1'],
          },
        },
      }
    );

    const boardLink = screen.getByRole('link', {
      name: /test board/i,
    });
    expect(boardLink).toBeInTheDocument();
    await user.click(boardLink);

    const addItem = screen.getByRole('button', {
      name: 'Add Item',
    });
    expect(addItem).toBeInTheDocument();
    await user.click(addItem);

    const input = screen.getByPlaceholderText(/Enter an item/i);
    expect(input).toBeInTheDocument();
    await user.type(input, 'Buy bananas');
    const addItemButton2 = screen.getByRole('button', {
      name: 'Add item',
    });
    expect(addItemButton2).toBeInTheDocument();
    await user.click(addItemButton2);

    const id = store.getState().items.ids[0];
    expect(id).toBeTruthy();
    expect(store.getState().items.entities[id].boardId === '1');
    expect(store.getState().items.entities[id].listId === '2');
    expect(store.getState().items.entities[id].value === 'Buy bananas');
    expect(store.getState().lists.entities['2'].itemsOrderedIds.length === 1);
    expect(store.getState().lists.entities['2'].itemsOrderedIds[0] === id);
  });

  test('Typing updates list title', async () => {
    const user = userEvent.setup();

    const { store } = renderWithProvider(
      <RouterProvider router={createMemoryRouter(routesConfig)} />,
      {
        preloadedState: {
          lists: {
            ids: ['2'],
            entities: {
              ['2']: {
                boardId: '1',
                id: '2',
                itemsOrderedIds: [],
                title: 'Grocery List',
              },
            },
          },
          boards: {
            ids: ['1'],
            entities: {
              ['1']: {
                id: '1',
                listsOrderedIds: ['2'],
                title: 'Test Board',
              },
            },
          },
          container: {
            boardsOrderedIds: ['1'],
          },
        },
      }
    );

    const boardLink = screen.getByRole('link', {
      name: /test board/i,
    });
    expect(boardLink).toBeInTheDocument();
    await user.click(boardLink);

    const input = screen.getByDisplayValue('Grocery List');
    expect(input).toBeInTheDocument();
    await user.clear(input);
    await user.type(input, 'Costco Grocery List');

    expect(store.getState().lists.entities['2'].title === 'Costco Grocery List');
  });

  test("Clicking list's ellipsis button opens up dropdown menu", async () => {
    const user = userEvent.setup();

    renderWithProvider(<RouterProvider router={createMemoryRouter(routesConfig)} />, {
      preloadedState: {
        items: {
          ids: ['3'],
          entities: {
            ['3']: {
              boardId: '1',
              listId: '2',
              id: '3',
              value: 'Buy bananas',
            },
          },
        },
        lists: {
          ids: ['2'],
          entities: {
            ['2']: {
              boardId: '1',
              id: '2',
              itemsOrderedIds: [],
              title: 'Grocery List',
            },
          },
        },
        boards: {
          ids: ['1'],
          entities: {
            ['1']: {
              id: '1',
              listsOrderedIds: ['2'],
              title: 'Test Board',
            },
          },
        },
        container: {
          boardsOrderedIds: ['1'],
        },
      },
    });

    const boardLink = screen.getByRole('link', {
      name: /test board/i,
    });
    expect(boardLink).toBeInTheDocument();
    await user.click(boardLink);

    const list = screen.getByTestId('list');
    expect(list).toBeInTheDocument();
    const button = within(list).getAllByRole('button')[0];
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(screen.getByRole('menu')).toBeTruthy();
  });

  test("Clicking list's dropdown menu delete button deletes list and its items", async () => {
    const user = userEvent.setup();

    const { store } = renderWithProvider(
      <RouterProvider router={createMemoryRouter(routesConfig)} />,
      {
        preloadedState: {
          items: {
            ids: ['3'],
            entities: {
              ['3']: {
                boardId: '1',
                listId: '2',
                id: '3',
                value: 'Buy bananas',
              },
            },
          },
          lists: {
            ids: ['2'],
            entities: {
              ['2']: {
                boardId: '1',
                id: '2',
                itemsOrderedIds: [],
                title: 'Grocery List',
              },
            },
          },
          boards: {
            ids: ['1'],
            entities: {
              ['1']: {
                id: '1',
                listsOrderedIds: ['2'],
                title: 'Test Board',
              },
            },
          },
          container: {
            boardsOrderedIds: ['1'],
          },
        },
      }
    );

    const boardLink = screen.getByRole('link', {
      name: /test board/i,
    });
    expect(boardLink).toBeInTheDocument();
    await user.click(boardLink);

    const list = screen.getByTestId('list');
    expect(list).toBeInTheDocument();
    const button = within(list).getAllByRole('button')[0];
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(screen.getByRole('menu')).toBeInTheDocument();

    const deleteButton = screen.getByRole('menuitem');
    expect(deleteButton).toBeInTheDocument();
    await user.click(deleteButton);
    expect(store.getState().lists.ids.length === 0);
    expect(store.getState().items.ids.length === 0);
  });

  test('Deleting one list does not affect the other list and its items', async () => {
    const user = userEvent.setup();

    const { store } = renderWithProvider(
      <RouterProvider router={createMemoryRouter(routesConfig)} />,
      {
        preloadedState: {
          items: {
            ids: ['3', '5'],
            entities: {
              ['3']: {
                boardId: '1',
                listId: '2',
                id: '3',
                value: 'Buy bananas',
              },
              ['5']: {
                boardId: '1',
                listId: '4',
                id: '5',
                value: 'Buy grapes',
              },
            },
          },
          lists: {
            ids: ['2', '4'],
            entities: {
              ['2']: {
                boardId: '1',
                id: '2',
                itemsOrderedIds: [],
                title: 'Grocery List',
              },
              ['4']: {
                boardId: '1',
                id: '4',
                itemsOrderedIds: [],
                title: 'Walmart List',
              },
            },
          },
          boards: {
            ids: ['1'],
            entities: {
              ['1']: {
                id: '1',
                listsOrderedIds: ['2', '4'],
                title: 'Test Board',
              },
            },
          },
          container: {
            boardsOrderedIds: ['1'],
          },
        },
      }
    );

    const boardLink = screen.getByRole('link', {
      name: /test board/i,
    });
    expect(boardLink).toBeInTheDocument();
    await user.click(boardLink);

    const lists = screen.getAllByTestId('list');
    expect(lists.length === 2);
    const button = within(lists[0]).getAllByRole('button')[0];
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(screen.getByRole('menu')).toBeInTheDocument();

    const deleteButton = screen.getByRole('menuitem');
    expect(deleteButton).toBeInTheDocument();
    await user.click(deleteButton);
    expect(store.getState().lists.ids.includes('2') === false);
    expect(store.getState().items.ids.includes('3') === false);
    expect(store.getState().items.ids.includes('5') === true);
    expect(store.getState().lists.ids.includes('4') === true);
    expect(store.getState().boards.entities['1'].listsOrderedIds.includes('4') === true);
    expect(store.getState().boards.entities['1'].listsOrderedIds.includes('2') === false);
  });
});

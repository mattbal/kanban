import { describe, expect, test } from 'vitest';
import { renderWithProvider } from './test-utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, RouterProvider, createMemoryRouter } from 'react-router-dom';
import { routesConfig } from '../src/renderer/src/routesConfig';
import Sidebar from '../src/renderer/src/components/Sidebar/Sidebar';
import React from 'react';

describe('sidebar', () => {
  test("Add Board button adds new board and navigates to new board's page", async () => {
    const user = userEvent.setup();

    const { store } = renderWithProvider(
      <RouterProvider router={createMemoryRouter(routesConfig)} />,
      {}
    );

    expect(store.getState().boards.ids.length === 0).toBeTruthy();

    await user.click(
      screen.getByRole('button', {
        name: /add board/i,
      })
    );

    expect(store.getState().boards.ids.length === 1).toBeTruthy();
    const id = store.getState().boards.ids[0];
    expect(store.getState().container.boardsOrderedIds[0] === id).toBeTruthy();
    // should have navigated to board page
    expect(screen.getByPlaceholderText('New Board')).toBeTruthy();
  });

  test('Clicking board link navigates to board page', async () => {
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
      name: 'Test Board',
    });
    expect(boardLink).toBeInTheDocument();
    await user.click(boardLink);

    expect(screen.getByDisplayValue('Test Board')).toBeTruthy();
  });

  test('Double clicking board link lets you edit the text', async () => {
    const user = userEvent.setup();

    const { store } = renderWithProvider(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
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

    expect(store.getState().boards.ids.length === 1).toBeTruthy();

    const boardLink = screen.getByText('Test Board');
    expect(boardLink).toBeInTheDocument();
    await user.dblClick(boardLink);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    await user.clear(input);
    await user.type(input, 'Test');
    expect(input.value).toBe('Test');
    expect(Object.values(store.getState().boards.entities)[0].title).toBe('Test');
  });

  test('Right clicking board shows context menu', async () => {
    const user = userEvent.setup();

    renderWithProvider(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
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

    const boardLink = screen.getByText('Test Board');
    expect(boardLink).toBeInTheDocument();
    await user.pointer({ target: boardLink, keys: '[MouseRight]' });
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  test('Clicking context menu delete button lets you delete the board', async () => {
    const user = userEvent.setup();

    const { store } = renderWithProvider(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
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

    expect(store.getState().boards.ids.length === 1).toBeTruthy();

    const boardLink = screen.getByText('Test Board');
    expect(boardLink).toBeInTheDocument();
    await user.pointer({ target: boardLink, keys: '[MouseRight]' });
    const deleteButton = screen.getAllByRole('menuitem')[1];
    expect(deleteButton).toBeInTheDocument();
    await user.click(deleteButton);
    expect(store.getState().boards.ids.length === 0).toBeTruthy();
  });
});

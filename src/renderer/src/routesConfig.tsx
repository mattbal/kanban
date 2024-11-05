import HomePage from './pages/HomePage';
import ErrorPage from './pages/ErrorPage';
import Index from './pages';
import BoardPage from './pages/BoardPage';

export const routesConfig = [
  {
    path: '/',
    element: <HomePage />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Index /> },
      {
        path: 'boards/:boardId',
        element: <BoardPage />,
      },
    ],
  },
];

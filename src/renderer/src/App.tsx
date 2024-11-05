import { RouterProvider, createHashRouter } from 'react-router-dom';
import { routesConfig } from './routesConfig';

function App() {
  const router = createHashRouter(routesConfig);

  return <RouterProvider router={router} />;
}

export default App;

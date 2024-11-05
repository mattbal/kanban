import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';

export default function ErrorPage() {
  const error = useRouteError();

  if (error instanceof Error) {
    if (error.message === 'state.boards.entities[id] is undefined') {
      error.message = 'Sorry, the board you have requested does not exist.';
    }
  }

  if (isRouteErrorResponse(error)) {
    return (
      <>
        <Sidebar />
        <main className='flex flex-col h-screen ml-44'>
          <div className='flex flex-col justify-center h-full'>
            <div className='text-center'>
              <h1 className='mb-2 text-2xl font-bold text-gray-700'>Error</h1>
              <p className='text-gray-600'>{error.statusText || error.data.message}</p>
            </div>
          </div>
        </main>
      </>
    );
  } else if (error instanceof Error) {
    return (
      <>
        <Sidebar />
        <main className='flex flex-col h-screen ml-44'>
          <div className='flex flex-col justify-center h-full'>
            <div className='text-center'>
              <h1 className='mb-2 text-2xl font-bold text-gray-700'>Error</h1>
              <p className='text-gray-600'>{error.message}</p>
            </div>
          </div>
        </main>
      </>
    );
  } else {
    return (
      <>
        <Sidebar />
        <main className='flex flex-col h-screen ml-44'>
          <div className='flex flex-col justify-center h-full'>
            <div className='text-center'>
              <h1 className='mb-2 text-2xl font-bold text-gray-700'>Error</h1>
              <p className='text-gray-600'>An error ocurred.</p>
            </div>
          </div>
        </main>
      </>
    );
  }
}

import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';

export default function HomePage() {
  return (
    <>
      <Sidebar />
      <main className='flex flex-col h-screen ml-44'>
        <Outlet />
      </main>
    </>
  );
}

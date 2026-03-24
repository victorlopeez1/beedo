import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 ml-20 lg:ml-64 min-h-screen overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
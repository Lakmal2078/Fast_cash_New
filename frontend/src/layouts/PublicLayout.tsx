import { Outlet } from 'react-router-dom';
import ToastContainer from '../components/ui/Toast';

export default function PublicLayout() {
  return (
    <div className="xbet-bg min-h-screen">
      <ToastContainer />
      <div className="page-container">
        <Outlet />
      </div>
    </div>
  );
}

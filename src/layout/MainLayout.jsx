import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import './MainLayout.css';

const MainLayout = () => {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="layout-main">
        <Header />

        <main className="layout-body">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;

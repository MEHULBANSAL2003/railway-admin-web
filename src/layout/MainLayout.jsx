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
        <div className="layout-header">
          <Header />
        </div>

        <main className="layout-body">
          <div className="layout-content-wrapper">
            <Outlet />
          </div>
        </main>

        <div className="layout-footer">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;

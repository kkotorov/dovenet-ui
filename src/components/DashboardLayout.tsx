import React from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from '../components/TopBar';

const DashboardLayout: React.FC = () => {
  return (
    <div>
      <TopBar />
      <div style={{ marginTop: '60px' }}>{/* spacing below TopBar */}</div>
      <Outlet /> {/* this renders child routes */}
    </div>
  );
};

export default DashboardLayout;

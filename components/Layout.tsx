
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  isDarkMode: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, isDarkMode }) => {
  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {children}
    </div>
  );
};

export default Layout;

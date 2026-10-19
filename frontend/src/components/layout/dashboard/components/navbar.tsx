import React, { ReactNode } from 'react';

interface NavbarProps {
  children: ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ children }) => {
  return <nav className="bg-gradient">{children}</nav>;
};

export default Navbar;

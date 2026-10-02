import React from 'react';
import { Header } from './Header';

export interface NavbarProps {
  onOpenLogin?: () => void;
  onOpenRegister?: () => void;
}

export const Navbar: React.FC<NavbarProps> = (props) => {
  return <Header {...props} />;
};

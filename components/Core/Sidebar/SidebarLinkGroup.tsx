import { ReactNode, useState } from "react";

interface SidebarLinkGroupProps {
  children: (handleClick: () => void, open: boolean) => React.ReactNode;
  activeCondition: boolean;
  isExpanded: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const SidebarLinkGroup = ({
  children,
  activeCondition,
  isExpanded,
  isOpen,
  setIsOpen,
}: SidebarLinkGroupProps) => {
  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return <li>{children(handleClick, isOpen)}</li>;
};

export default SidebarLinkGroup;

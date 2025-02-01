import React, { createContext, useContext, useState } from "react";

const ActiveMenuContext = createContext();

export const useActiveMenu = () => useContext(ActiveMenuContext);

export const ActiveMenuProvider = ({ children }) => {
  const [activeMenu, setActiveMenu] = useState("");

  return (
    <ActiveMenuContext.Provider value={{ activeMenu, setActiveMenu }}>
      {children}
    </ActiveMenuContext.Provider>
  );
};
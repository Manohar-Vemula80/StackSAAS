import { createContext, useContext, useState, useEffect } from "react";

// create context
const CreditContext = createContext();

// provider
export const CreditProvider = ({ children }) => {

  // 🔥 LOAD FROM LOCAL STORAGE
  const [credits, setCredits] = useState(() => {
    const saved = localStorage.getItem("credits");
    return saved ? Number(saved) : 10;
  });

  // 🔥 SAVE TO LOCAL STORAGE (IMPORTANT)
  useEffect(() => {
    localStorage.setItem("credits", credits);
  }, [credits]);

  const addCredits = (amount) => {
    setCredits((prev) => prev + amount);
  };

  const deductCredits = () => {
    if (credits <= 0) return false;
    setCredits((prev) => prev - 1);
    return true;
  };

  return (
    <CreditContext.Provider value={{ credits, addCredits, deductCredits }}>
      {children}
    </CreditContext.Provider>
  );
};

// hook
export const useCredit = () => useContext(CreditContext);
import { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "./usercontext";

const API_BASE = import.meta.env.VITE_API_URL || "https://stacksaas.onrender.com";

// create context
const CreditContext = createContext();

// provider
export const CreditProvider = ({ children }) => {
  const [credits, setCredits] = useState(0);
  const { user } = useUser();

  useEffect(() => {
    if (!user) {
      setCredits(0);
      return;
    }

    setCredits(typeof user.credits === "number" ? user.credits : 0);
  }, [user]);

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
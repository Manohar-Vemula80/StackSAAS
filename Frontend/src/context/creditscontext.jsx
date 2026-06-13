import { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "./usercontext";

// create context
const CreditContext = createContext();

// provider
export const CreditProvider = ({ children }) => {
  const [credits, setCredits] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("credits");
      return saved ? Number(saved) : 0;
    }
    return 0;
  });
  const { user, loading } = useUser();

  useEffect(() => {
    if (loading) return;

    if (user && typeof user.credits === "number") {
      setCredits(user.credits);
      return;
    }

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("credits");
      if (saved !== null) {
        setCredits(Number(saved));
      }
    }
  }, [user, loading]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("credits", credits.toString());
    }
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
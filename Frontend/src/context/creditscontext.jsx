import { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "./usercontext";

// create context
const CreditContext = createContext();

const getCreditsKey = (userId) => `credits_${userId}`;

// provider
export const CreditProvider = ({ children }) => {
  const [credits, setCredits] = useState(0);
  const { user, loading } = useUser();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      setCredits(0);
      return;
    }

    const parsedCredits = Number(user.credits);
    if (!Number.isNaN(parsedCredits)) {
      setCredits(parsedCredits);
      return;
    }

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(getCreditsKey(user._id));
      setCredits(saved !== null ? Number(saved) : 0);
    }
  }, [user, loading]);

  useEffect(() => {
    if (typeof window === "undefined" || !user) return;

    localStorage.setItem(getCreditsKey(user._id), credits.toString());
  }, [credits, user]);

  const addCredits = (amount) => {
    setCredits((prev) => prev + Number(amount));
  };

  const updateCredits = (value) => {
    const parsed = Number(value);
    setCredits(Number.isNaN(parsed) ? 0 : parsed);
  };

  const deductCredits = () => {
    if (credits <= 0) return false;
    setCredits((prev) => prev - 1);
    return true;
  };

  return (
    <CreditContext.Provider value={{ credits, addCredits, deductCredits, updateCredits }}>
      {children}
    </CreditContext.Provider>
  );
};

// hook
export const useCredit = () => useContext(CreditContext);
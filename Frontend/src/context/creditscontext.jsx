import { createContext, useContext, useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "https://stacksaas.onrender.com";

// create context
const CreditContext = createContext();

// provider
export const CreditProvider = ({ children }) => {
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/login/success`, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        const data = await response.json();
        if (!data.error && typeof data.user?.credits === "number") {
          setCredits(data.user.credits);
        }
      } catch (err) {
        console.error("Failed to load user credits:", err);
      }
    };

    fetchCredits();
  }, []);

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
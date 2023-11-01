import { createContext, useContext, useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const StripeContext = createContext();

export const useStripePromise = () => {
  return useContext(StripeContext);
};

export const StripeProvider = ({ children }) => {
  const [stripePromise, setStripePromise] = useState(null);

  useEffect(() => {
    async function initializeStripe() {
      const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
      setStripePromise(stripe);
    }

    initializeStripe();
  }, []);

  return (
    <StripeContext.Provider value={stripePromise}>
      {children}
    </StripeContext.Provider>
  );
};

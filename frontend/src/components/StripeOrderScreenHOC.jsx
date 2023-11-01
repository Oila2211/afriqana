import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import OrderScreen from './OrderScreen';
import { useCreatePaymentIntentMutation, useGetOrderDetailsQuery } from '../slices/ordersApiSlice';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const StripeOrderScreenHOC = ({ children }) => {

    const [clientSecret, setClientSecret] = useState('')
    const { id: orderId } = useParams();
    const [ createPaymentIntent ] = useCreatePaymentIntentMutation();
    const { data: order, refetch, isError, isLoading } = useGetOrderDetailsQuery(orderId);

    useEffect(() => {
        // Create PaymentIntent as soon as the page loads and the order object is available
        if (order && !order.isPaid) {
          createPaymentIntent({ amount: order.totalPrice * 100 })
            .unwrap()
            .then((data) => {
              setClientSecret(data.clientSecret);
            })
            .catch((err) => {
              console.error("Error fetching client secret:", err.message);
            });
        }
      }, [order, createPaymentIntent]);

      const options = {
        clientSecret,
        appearance: {
          theme: 'stripe',
        },
      };
    

  return (
    <Elements stripe={stripePromise} options={options}>
      <OrderScreen />
    </Elements>
  );
};

export default StripeOrderScreenHOC;

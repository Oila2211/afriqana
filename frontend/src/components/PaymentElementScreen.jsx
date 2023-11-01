import React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PaymentElement, useElements } from '@stripe/react-stripe-js';
import { Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { updateUserInfoAfterPayment } from '../slices/authSlice';
import { useStripePromise } from '../contexts/StripeContext';
import { usePayOrderMutation, useGetOrderDetailsQuery } from '../slices/ordersApiSlice';
import { useCurrentUserDetailsQuery } from '../slices/usersApiSlice';
import PaymentModal from './PaymentModal';
import { useDispatch } from 'react-redux';


const PaymentElementScreen = ({ clientSecret ,markAsPaid }) => {
  const { id: orderId } = useParams();
  const  stripe  = useStripePromise();
  const elements = useElements();
  const dispatch = useDispatch();
  const { data: order, isError, isLoading } = useGetOrderDetailsQuery(orderId);
  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();
  // Destructure the refetch function for the user's details
  const { data: currentUser, refetch: refetchUser } = useCurrentUserDetailsQuery();


  const [processing, setProcessing] = useState(false);
  const [disabled, setDisabled] = useState(false);
  // const [showModal, setShowModal] = useState(false);
  const [refetchResult, setRefetchResult] = useState(null);


  useEffect(() => {
    if (refetchResult?.isSuccess === true) {
      toast.success('User details updated!');
    } else if (refetchResult?.isError === true) {
      toast.error('Failed to update user details.');
    }
  }, [refetchResult, currentUser]);
  

  const handleChange = async (event) => {
    setDisabled(event.empty);
    if (event.error) {
        toast.error(event.error.message);
    }
    if (!stripe || !elements) {
        // Stripe.js hasn't yet loaded.
        // Make sure to disable form submission until Stripe.js has loaded.
        return;
      }
};

const handlePayment = async (event) => {
  event.preventDefault();
  if (!stripe || !elements) {
    // Stripe.js hasn't yet loaded.
    // Make sure to disable form submission until Stripe.js has loaded.
    return;
  }

  setProcessing(true);

  // Trigger form validation and wallet collection
  const { error: submitError } = await elements.submit();
  if (submitError) {
    toast.error(`Payment failed: ${submitError.message}`);
    setProcessing(false);
    return;
  }

    // Confirm the PaymentIntent
    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success/${orderId}`,
      },
      redirect: 'if_required'
    });

    if (error) {
      toast.error(`Payment failed: ${error.message}`);
      setProcessing(false);
      return;
    }

    // Retrieve PaymentIntent to get detailed info
    const { paymentIntent, error: retrieveError } = await stripe.retrievePaymentIntent(clientSecret);

    if (retrieveError) {
      toast.error(`Payment failed: ${retrieveError.message}`);
      setProcessing(false);
      return;
    }

    // Assuming paymentIntent.status === 'succeeded'
    const details = {
      id: paymentIntent.id,
      status: paymentIntent.status,
      update_time: new Date().toISOString(),
      email_address: paymentIntent.receipt_email || 'default_email@example.com', // replace with actual email
    };
  
    const response = await payOrder({ orderId, details });
    if (response.data.updatedUser) {
      dispatch(updateUserInfoAfterPayment(response.data.updatedUser))
    }
    markAsPaid(orderId);
    await refetchUser();
    setProcessing(false);

    // const result = await refetchUser();
    toast.success('Order is Paid');
    setProcessing(false);

    

    console.log("refetched user data is:", currentUser)
};


  return (
    <>
      <form onSubmit={handlePayment}>
      <div style={{ marginBottom: "20px" }}>
          <PaymentElement onChange={handleChange} />
      <Button type='submit' disabled={!stripe || processing || disabled } style={{ marginTop: "10px" }}>
          {processing ? "Processing...":"Pay Now"}
      </Button>
          </div>
      </form>
      {/* <PaymentModal 
        show={showModal}
        onHide={() => setShowModal(false)}
        amount={"SEK" + order.totalPrice}
      /> */}

    </>
  );
};

export default PaymentElementScreen;

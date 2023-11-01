import React from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { usePayOrderMutation, useCreatePaymentIntentMutation } from '../slices/ordersApiSlice';
import { toast } from 'react-toastify';



const StripePaymentForm = ({ order, refetch }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [succeeded, setSucceeded] = useState(false);
    const [clientSecret, setClientSecret] = useState("");
    const [disabled, setDisabled] = useState(false);

    const [payOrder] = usePayOrderMutation();
    const [createPaymentIntent] = useCreatePaymentIntentMutation();


    useEffect(() => {
        const createIntent = async () => {
          try {
            const payload = await createPaymentIntent({ orderId: order._id });
            setClientSecret(payload.data.clientSecret);
          } catch (error) {
            toast.error('Could not create payment intent');
          }
        };
        createIntent();
      }, [createPaymentIntent, order._id]);

    const handleChange = async (event) => {
        setDisabled(event.empty);
        if (event.error) {
            toast.error(event.error.message);
        }
    };

    const handlePayment = async ev => {
        ev.preventDefault();
        setProcessing(true);

        console.log("Starting payment, client secret is: ", clientSecret);  // Debugging

        const payload = await stripe.confirmCardPayment(clientSecret, {
            paymentMethod: {
                card: elements.getElement(PaymentElement)
            }
        });

        console.log("Payment payload: ", payload);  // Debugging
        if (payload.error) {
            toast.error(`Payment failed ${payload.error.message}`);
            setProcessing(false);
        } else {
            await payOrder({ orderId: order._id, details: payload.paymentIntent });
            refetch();
            setSucceeded(true);
            toast.success('Payment successful');
            setProcessing(false);
        }
    };

    return (
        
            <form onSubmit={handlePayment}>
                <div style={{ marginBottom: "20px" }}>
                    <PaymentElement onChange={handleChange} />
                    <Button type='submit' disabled={processing || disabled || succeeded} style={{ marginTop: "10px" }}>
                        {processing ? "Processing..." : "Pay Now"}
                    </Button>
                </div>
            </form>

    );
};

export default StripePaymentForm;
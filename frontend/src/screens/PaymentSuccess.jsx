import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { updateUserInfoAfterPayment } from '../slices/authSlice';
import { useGetOrderDetailsQuery, usePayOrderMutation } from '../slices/ordersApiSlice';
import { toast } from 'react-toastify';
import { useStripePromise } from '../contexts/StripeContext';

const PaymentSuccess = () => {
    const { id: orderId } = useParams()
    
    const { data: order, refetch, isError, isLoading } = useGetOrderDetailsQuery(orderId);
    const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();
    const stripe = useStripePromise()

    useEffect(() => {
        
        if (!stripe) return;

        const url = new URL(window.location);
        const clientSecret = url.searchParams.get('payment_intent_client_secret');
        const fetchPaymentIntent = async () => {
          const { paymentIntent, error: retrieveError } = await stripe.retrievePaymentIntent(clientSecret);
            
          if (retrieveError) {
              toast.error(`Error retrieving payment details: ${retrieveError.message}`);
              return;
            };   
          
              const details = {
                  id: paymentIntent.id,
                  status: paymentIntent.status,
                  update_time: new Date().toISOString(),
                  email_address: paymentIntent.receipt_email,
              };
              
              await payOrder({ orderId, details});
              // markAsPaid(orderId)
              toast.success('Order is Paid')
          } 
          refetch()
    
        fetchPaymentIntent();
        
    }, [stripe, payOrder, refetch, orderId]);

      

  return (
    <Container>
      <Row className="justify-content-md-center mt-5">
        <Col xs={12} md={6}>
          <Card>
            <Card.Body>
              <Card.Title className="text-center">
                <h2>Payment Successful!</h2>
              </Card.Title>
              <Card.Text className="text-center">
                Your payment has been successfully processed.
              </Card.Text>
              <div className="d-flex justify-content-center">
                <Link to="/">
                  <Button variant="primary">Go to Home</Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentSuccess;

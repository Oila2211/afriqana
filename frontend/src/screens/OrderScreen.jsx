import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Card, Button } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { Elements } from '@stripe/react-stripe-js';
// import { loadStripe } from '@stripe/stripe-js';
import PaymentElementScreen from '../components/PaymentElementScreen';
import { useStripePromise } from '../contexts/StripeContext';
import { useGetOrderDetailsQuery, useCreatePaymentIntentMutation, useDeliverOrderMutation } from '../slices/ordersApiSlice';

// const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const OrderScreen = () => {

  const [clientSecret, setClientSecret] = useState('');
  
  const { id: orderId } = useParams();
  const [hasPaid, setHasPaid] = useState(false);
  const [paymentDate, setPaymentDate] = useState(null);
  const stripePromise = useStripePromise()
  const { data: order, refetch, isError, isLoading } = useGetOrderDetailsQuery(orderId);
  const [createPaymentIntent] = useCreatePaymentIntentMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const [deliverOrder, {isLoading: loadingDeliver }] = 
  useDeliverOrderMutation();

  const markAsPaid = () => {
    setHasPaid(true);
    setPaymentDate(new Date().toISOString());
  };

  useEffect(() => {
    console.log("my stripe promise is:", stripePromise)
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

  const deliverOrderHandler = async () => {
    try {
      await deliverOrder(orderId);
      refetch();
      toast.success('Order delivered')
    } catch (err) {
      toast.error(err?.data?.message || err?.message)
    }
  }


  if (isLoading) return <Loader />;
  if (isError) return <Message variant="danger">{isError.message}</Message>;

  const appearance = {
    theme: 'stripe',
  };
  const options = {
    clientSecret,
    appearance,
  };



  return (
    <>

    <h1>Order {order._id}</h1>
    <Row>
        <Col md={8}>
            <ListGroup>
                <ListGroup.Item>
                    <h2>Delivery</h2>
                    <p>
                        <strong>Name:</strong> {order.user.name}
                    </p>
                    <p>
                        <strong>Email:</strong> {order.user.email}
                    </p>
                    <p>
                        <strong>Qana:</strong> {order.user.qanaPoints}
                    </p>
                    <p>
                        <strong>Address:</strong> {order.deliveryAddress.address}
                    </p>
                    {order.isDelivered ? (
                        <Message variant="success">Delivered on {order.deliveredAt}</Message>
                    ) : (
                        <Message variant="danger">Not Delivered </Message>
                    )}
                </ListGroup.Item>

                <ListGroup.Item>
                    <h2>Payment Status</h2>
                    {/* <p>
                        <strong>Method:</strong>
                        {order.paymentMethod}
                    </p> */}
                    {order.isPaid || hasPaid ? (
                        <Message variant="success">Paid on {order.paidAt || paymentDate}</Message>
                    ) : (
                        <Message variant="danger">Not Paid </Message>
                    )}
                </ListGroup.Item>

                <ListGroup.Item>
                    <h2>Order Items</h2>
                    <ListGroup variant='flush'>
                        {order.orderItems.map((item, index) => (
                            <ListGroup.Item key={index}>
                                <Row>
                                    <Col md={1}>
                                        <Image src={item.image} alt={item.name} fluid rounded />
                                    </Col>
                                    <Col>
                                        <Link to={`/product/${item.product}`}>
                                            {item.name}
                                        </Link>
                                    </Col>
                                    <Col md={4}>
                                        {item.qty} x ${item.price} = ${item.qty * item.price}
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </ListGroup.Item>
            </ListGroup>
        </Col>

        <Col md={4}>
            <Card>
                <ListGroup variant="flush">
                    <ListGroup.Item>
                        <h2>Order Summary</h2>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <Row>
                            <Col>Items</Col>
                            <Col>SEK{order.itemsPrice}</Col>
                        </Row>
                        <Row>
                            <Col>Delivery</Col>
                            <Col>SEK{order.deliveryPrice}</Col>
                        </Row>
                        <Row>
                            <Col>Tax</Col>
                            <Col>SEK{order.taxPrice}</Col>
                        </Row>
                        <Row>
                            <Col><strong>Total</strong></Col>
                            <Col>SEK{order.totalPrice}</Col>
                        </Row>
                    </ListGroup.Item>
                    
                    {(!order.isPaid && !hasPaid && clientSecret && stripePromise ) ? (
                        <ListGroup.Item>
                           <Elements options={options} stripe={stripePromise}>
                            <PaymentElementScreen markAsPaid={markAsPaid} clientSecret={clientSecret}/>
                            </Elements>
                        </ListGroup.Item>
                    ) : (
                        <p>Payment already made </p>
                    )}

                    {loadingDeliver && <Loader />}

                    {userInfo && userInfo.isAdmin && order.isPaid &&
                    !order.isDelivered && (
                      <ListGroup.Item>
                        <Button 
                         type='button'
                         className='btn btn-block'
                         onClick={deliverOrderHandler}
                        >
                            Mark as Delivered
                        </Button>
                      </ListGroup.Item>
                    )}

                    
                </ListGroup>
            </Card>
        </Col>
    </Row>
</>

  );
};

export default OrderScreen;
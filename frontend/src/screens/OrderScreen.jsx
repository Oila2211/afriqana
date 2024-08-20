import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Card, Button } from 'react-bootstrap';
import { useDispatch, useSelector} from 'react-redux';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { Elements } from '@stripe/react-stripe-js';
import PaymentElementScreen from '../components/PaymentElementScreen';
import ApplyCoupon from '../components/ApplyCoupon';
import { useStripePromise } from '../contexts/StripeContext';
import { useGetOrderDetailsQuery, useCreatePaymentIntentMutation, useDeliverOrderMutation } from '../slices/ordersApiSlice';
import RedeemPoints from '../components/RedeemPoints';
import { setOrderValues, finalizeOrder, setOrderId } from "../slices/orderSlice";


const OrderScreen = () => {

  const [clientSecret, setClientSecret] = useState('');
  
  // Selector to get orderId and orderPricesfrom Redux
  const orderId = useSelector((state) => state.order.orderId);
  const orderPrices = useSelector((state) => state.order.orderPrices);

  const [hasPaid, setHasPaid] = useState(false);
  const [paymentDate, setPaymentDate] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();


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
    if (!orderId) {
        // If orderId is not in Redux state, retrieve it from localStorage
        const storedOrderId = localStorage.getItem('orderId');
        if (storedOrderId) {
            dispatch(setOrderId(storedOrderId));
        } else {
            toast.error('Order ID not found. Redirecting to home.');
            navigate('/');
        }
    }
  }, [orderId, dispatch, navigate]);


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

  useEffect(() => {
    // Set initial values when the component mounts
    if (order) {
        dispatch(setOrderValues({
        itemsPrice: order.itemsPrice,
        deliveryPrice: order.deliveryPrice,
        taxPrice: order.taxPrice,
        totalPrice: order.totalPrice,
        discountAmount: 0,
        isFinalized: false,
        } 
        ));
    } 
  }, [orderId, dispatch]);
  
  


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

    <h2>Order {order._id}</h2>
    <Row>
        <Col md={8}>
            <ListGroup>
                <ListGroup.Item>
                    <h3>Delivery</h3>
                    <p>
                        <strong>Name:</strong> {order.user.name}
                    </p>
                    <p>
                        <strong>Email:</strong> {order.user.email}
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

                <RedeemPoints />

                <ListGroup.Item>
                    <h3>Payment Status</h3>
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
                        <h3>Order Summary</h3>
                    </ListGroup.Item>

                    <ListGroup.Item>
                        <Row>
                            <Col>Items</Col>
                            <Col>SEK{orderPrices.itemsPrice}</Col>
                        </Row>
                        <Row>
                            <Col>Discount</Col>
                            <Col>SEK{orderPrices.discountAmount}</Col>
                        </Row>
                        <Row>
                            <Col>Delivery</Col>
                            <Col>SEK{orderPrices.deliveryPrice}</Col>
                        </Row>
                        <Row>
                            <Col>Tax</Col>
                            <Col>SEK{orderPrices.taxPrice}</Col>
                        </Row>
                        <Row>
                            <Col><strong>Total</strong></Col>
                            <Col>SEK{orderPrices.totalPrice}</Col>
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

                    <ListGroup.Item>
                        <ApplyCoupon />
                    </ListGroup.Item>

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
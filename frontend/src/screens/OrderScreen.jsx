import { Link, useParams } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Button, Card } from 'react-bootstrap';
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Message from '../components/Message';
import { STRIPE_URL } from '../constants';
import Loader from '../components/Loader';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useGetOrderDetailsQuery, usePayOrderMutation } from '../slices/ordersApiSlice';

const OrderScreen = () => {
    const { id: orderId } = useParams();
    const stripe = useStripe();
    const elements = useElements();

    const [clientSecret, setClientSecret] = useState('');
    const [processing, setProcessing] = useState(false);
    const [succeeded, setSucceeded] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [hasPaid, setHasPaid] = useState(false);
    const [paymentDate, setPaymentDate] = useState(null);


    const { data: order, refetch, isError, isLoading } = useGetOrderDetailsQuery(orderId);
    const [payOrder] = usePayOrderMutation();

    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => {
        const createPaymentIntent = async () => {
            try {
                const { data } = await axios.post(STRIPE_URL, { amount: order.totalPrice * 100 });
                setClientSecret(data.clientSecret);
            } catch (err) {
                console.error("Error fetching client secret:", err.message);
            }
        };
        // Check if order exists and if it hasn't been paid, then create a payment intent.
        if (order && !order.isPaid) {
            createPaymentIntent();
        }

        // Update local state if the order is marked as paid..
        if (order && order.isPaid) {
            setHasPaid(true);
            setPaymentDate(order.paidAt);
        } 

    }, [order]);

    const handleChange = async (event) => {
        setDisabled(event.empty);
        if (event.error) {
            toast.error(event.error.message);
        }
    };

    const handlePayment = async ev => {
        ev.preventDefault();
        setProcessing(true);
        const payload = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement(CardElement)
            }
        });
        if (payload.error) {
            toast.error(`Payment failed ${payload.error.message}`);
            setProcessing(false);
        } else {
            const paymentResult = {
              id: payload.paymentIntent.id,
              status: payload.paymentIntent.status,
              update_time: new Date().toISOString(),
              email_address: payload.paymentIntent.receipt_email,
            };

            // Refetch order Details
            await payOrder({ orderId, details: paymentResult });
            refetch();

            setHasPaid(true);
            setPaymentDate(new Date().toISOString());
            toast.success('Payment successful');
            setProcessing(false);
        }
    };

    if (isLoading) return <Loader />;
    if (isError) return <Message variant="danger">{isError.message}</Message>;

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
                                <strong>Address:</strong> {order.deliveryAddress.address}
                            </p>
                            {order.isDelivered ? (
                                <Message variant="success">Delivered on {order.deliveredAt}</Message>
                            ) : (
                                <Message variant="danger">Not Delivered </Message>
                            )}
                        </ListGroup.Item>

                        <ListGroup.Item>
                            <h2>Payment Method</h2>
                            <p>
                                <strong>Method:</strong>
                                {order.paymentMethod}
                            </p>
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
                            {!order.isPaid && !hasPaid && stripe ? (
                                <ListGroup.Item>
                                    <div style={{ marginBottom: "20px" }}>
                                        <CardElement onChange={handleChange}/>
                                        <Button onClick={handlePayment} disabled={processing || disabled || succeeded} style={{ marginTop: "10px" }}>
                                            {processing ? "Processing...":"Pay Now"}
                                        </Button>
                                    </div>
                                </ListGroup.Item>
                            ) : null}
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default OrderScreen;
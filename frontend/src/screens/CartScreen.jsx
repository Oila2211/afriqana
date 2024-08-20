// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { Row, Col, ListGroup, Image, Form, Button, Card, FormControl } from "react-bootstrap";
// import { FaTrash } from "react-icons/fa6";
// import Message from '../components/Message';
// import { toast } from 'react-toastify';
// import { useApplyCouponMutation } from "../slices/couponApiSlice";
// import { addToCart, removeFromCart, applyCouponDiscount } from "../slices/cartSlice";


// const CartScreen = () => {
//     const navigate = useNavigate();
//     const dispatch = useDispatch();
//     const [couponCode, setCouponCode] = useState('')


//     const cart = useSelector((state) => state.cart);
//     const { cartItems, discountPercentage } = cart; // added the discountPercentage from state;

//     const [applyCoupon] = useApplyCouponMutation();

//     const addToCartHandler = async (product, qty) => {
//         dispatch(addToCart({...product, qty}))
//     };

//     const removeFromCartHandler = async (id) => {
//         dispatch(removeFromCart(id))
//     };

//     const addCouponHandler = async () => {
//         try {
//             await applyCoupon(couponCode);
//             toast.success(`Coupon applied successfully! ${discountPercentage}% off your total!`);
//             dispatch(applyCouponDiscount(discountPercentage))
//         } catch (error) {
//             if (error.data && error.data.message) {
//                 toast.error(`Coupon Error: ${error.data.message}`);
//             } else {
//                 toast.error('Coupon Error: Unexpected error occurred.');
//             }
//         }
//     }

//     const checkoutHandler = () => {
//         navigate('/login?redirect=/delivery'); 
//     }

//     const maxOrderQuantity = 10; // Adjust qty number as pleased...


//     const subtotal = cartItems.reduce((acc, item) => acc + Number(item.qty) * Number(item.price), 0);
//     const discountedTotal = subtotal * ((100 - Number(discountPercentage)) / 100); // Calculate the new total after applying discount

//     console.log("Discount Percentage:", discountPercentage);
//     console.log("Raw Items Price:", subtotal); // renamed from rawItemsPrice to subtotal for clarity
//     console.log("Discount Amount:", subtotal - discountedTotal);
//   return (
//     <Row>
//         <Col md={8}>
//             <h1 style={{marginBottom: '20px'}}>Shopping Cart</h1>
//             {cartItems.length === 0 ? (
//                 <Message>
//                     Your Cart is empty <Link to='/'>Go Back</Link>
//                 </Message>
//             ) : (
//                 <ListGroup variant="flush">
//                     {cartItems.map((item) => (
//                         <ListGroup.Item key={item._id}>
//                             <Row>
//                                 <Col md={2}>
//                                     <Image src={item.Image} alt={item.name} fluid rounded />
//                                 </Col>
//                                 <Col md={3}>
//                                     <Link to={`/product/${item._id}`}>{item.name}</Link>
//                                 </Col>
//                                 <Col>{item.price}</Col>
//                                 <Col md={2}>
//                                 <FormControl
//                                     as='select'
//                                     value={item.qty}
//                                     onChange={(e) => addToCartHandler(item, Number(e.target.value))}>
//                                     {[...Array(maxOrderQuantity).keys()].map(x => (
//                                         <option key={x + 1} value={x + 1}>
//                                             {x + 1}
//                                         </option>
//                                     ))}
//                                 </FormControl>
//                                 </Col>
//                                 <Col md={2}>
//                                     <Button type="button" variant="light" onClick={ () =>
//                                     removeFromCartHandler(item._id)}>
//                                         <FaTrash/>
//                                     </Button>
//                                 </Col>
//                             </Row>
//                         </ListGroup.Item>
//                     ))}
//                 </ListGroup>
//             ) }
//         </Col>
//         <Col md={4}>
//             <Card>
//                 <ListGroup variant="flush">
//                     <ListGroup.Item>
//                         <ListGroup.Item>
//                             <Form.Control 
//                               type="text"
//                               placeholder="Enter coupon code"
//                               value={couponCode}
//                               onChange={(e) => setCouponCode(e.target.value)}
//                             />
//                             <Button onClick={addCouponHandler}>
//                                 Apply Coupon
//                             </Button>
//                         </ListGroup.Item>
//                         { discountPercentage > 0 && 
//                           <span>Discount applied: {discountPercentage}%</span>
//                         }
//                         <h2>
//                             {/* Subtotal ({ cartItems.reduce((acc, item) => acc + item.qty, 0)}) */}
//                             Subtotal{subtotal}
//                             items
//                         </h2>
//                         SEK{ discountedTotal.toFixed(2)}
//                     </ListGroup.Item>
//                     <ListGroup.Item>
//                         <Button type="button" className="btn-block"
//                          disabled={cartItems.length === 0}
//                          onClick={checkoutHandler}>
//                             Proceed To CheckOut
//                         </Button>
//                     </ListGroup.Item>
//                 </ListGroup>
//             </Card>
//         </Col>
//     </Row>
//   )
// }

// export default CartScreen;


import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, ListGroup, Image, Form, Button, Card, FormControl } from "react-bootstrap";
import { FaTrash } from "react-icons/fa6";
import Message from '../components/Message'
import { addToCart, removeFromCart } from "../slices/cartSlice";
import { resetOrderValues } from "../slices/orderSlice";

const CartScreen = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();


    const cart = useSelector((state) => state.cart);
    const { cartItems } = cart;

    const addToCartHandler = async (product, qty) => {
        dispatch(addToCart({...product, qty}))
    };

    const removeFromCartHandler = async (id) => {
        dispatch(removeFromCart(id))
    };

    const checkoutHandler = () => {
        dispatch(resetOrderValues())
        navigate('/login?redirect=/delivery');
    }

    const maxOrderQuantity = 10; // Adjust qty number as pleased...
  return (
    <Row>
        <Col md={8}>
            <h1 style={{marginBottom: '20px'}}>Shopping Cart</h1>
            {cartItems.length === 0 ? (
                <Message>
                    Your Cart is empty <Link to='/'>Go Back</Link>
                </Message>
            ) : (
                <ListGroup variant="flush">
                    {cartItems.map((item) => (
                        <ListGroup.Item key={item._id}>
                            <Row>
                                <Col md={2}>
                                    <Image src={item.Image} alt={item.name} fluid rounded />
                                </Col>
                                <Col md={3}>
                                    <Link to={`/product/${item._id}`}>{item.name}</Link>
                                </Col>
                                <Col>{item.price}</Col>
                                <Col md={2}>
                                <FormControl
                                    as='select'
                                    value={item.qty}
                                    onChange={(e) => addToCartHandler(item, Number(e.target.value))}>
                                    {[...Array(maxOrderQuantity).keys()].map(x => (
                                        <option key={x + 1} value={x + 1}>
                                            {x + 1}
                                        </option>
                                    ))}
                                </FormControl>
                                </Col>
                                <Col md={2}>
                                    <Button type="button" variant="light" onClick={ () =>
                                    removeFromCartHandler(item._id)}>
                                        <FaTrash/>
                                    </Button>
                                </Col>
                            </Row>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            ) }
        </Col>
        <Col md={4}>
            <Card>
                <ListGroup variant="flush">
                    <ListGroup.Item>
                        <h2>
                            Subtotal ({ cartItems.reduce((acc, item) => acc + item.qty, 0)})
                            items
                        </h2>
                        SEK{ cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2) }
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <Button type="button" className="btn-block"
                         disabled={cartItems.length === 0}
                         onClick={checkoutHandler}>
                            Proceed To CheckOut
                        </Button>
                    </ListGroup.Item>
                </ListGroup>
            </Card>
        </Col>
    </Row>
  )
}

export default CartScreen;
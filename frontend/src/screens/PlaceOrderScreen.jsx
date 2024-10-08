import { useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Row, Col, ListGroup, Image, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import CheckoutSteps from '../components/CheckoutSteps';
import Message from '../components/Message';
import Loader from '../components/Loader'
import { useCreateOrderMutation } from '../slices/ordersApiSlice';
import { setOrderId, setOrderValues } from "../slices/orderSlice";
import { clearCartItems } from '../slices/cartSlice';


const PlaceOrderScreens = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);

  const [createOrder, {isLoading, error}] = useCreateOrderMutation();

  const orderDetails = useSelector((state) => state.order.orderPrices);


  // const order = useSelector((state) => state.order); // Get the order state from Redux


  useEffect(() => {
    if (!cart.deliveryAddress.address) {
      navigate('/delivery');
    } else if (!cart.paymentMethod) {
      navigate('/payment')
    }
  }, [cart.paymentMethod, cart.deliveryAddress.address, navigate])


  const placeOrderHandler = async () => {
    try {

      console.log("Order Details:", {
        orderItems: cart.cartItems,
        deliveryAddress: cart.deliveryAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        deliveryPrice: cart.deliveryPrice,
        phoneNumber: cart.phoneNumber,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice
    });



      const res = await createOrder({
        orderItems: cart.cartItems,
        deliveryAddress: cart.deliveryAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        deliveryPrice: cart.deliveryPrice,
        phoneNumber: cart.phoneNumber,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice
      }).unwrap();
      
      
      if (res && res.createdOrder && res.createdOrder._id) {

       // Dispatch order details to Redux
       dispatch(setOrderValues({
        itemsPrice: res.createdOrder.itemsPrice,
        deliveryPrice: res.createdOrder.deliveryPrice,
        taxPrice: res.createdOrder.taxPrice,
        totalPrice: res.createdOrder.totalPrice,
        discountAmount: res.createdOrder.discountAmount || 0, // Assuming this exists
      }));

         // Dispatch orderId to Redux
         dispatch(setOrderId(res.createdOrder._id));
         dispatch(clearCartItems());
         navigate(`/order/${res.createdOrder._id}`); 
      } else {
        toast.error("Order ID not found in the response")
      }
    } catch (err) {
        console.log("Error objecr", err);
        // Checking if error is related to no delivery to the region.
        if (err.status === 400 && err.data.error == 'Delivery not available for this location') {
          toast.error('Delivery Not available for this location');
        } else {
          toast.error(err?.data?.error || 'Failed to place order. Please try again.')
      }
    }
  }

  return (<>
    <CheckoutSteps step1 step2 step3 step4 />
    <Row>
      <Col md={8}>
        <ListGroup variant="flush">
          <ListGroup.Item>
            <h2>Delivery</h2>
            <p>
              <strong>Address</strong>
              {cart.deliveryAddress.address}, 
            </p>
          </ListGroup.Item>
          <ListGroup.Item>
            <h2>Payment Method</h2>
            <strong>Method: </strong>
            {cart.paymentMethod}
          </ListGroup.Item>
          <ListGroup.Item>
            <h2>Order Items</h2>
            {cart.cartItems.length === 0 ? (
              <Message>Your cart is empty</Message>
            ) : (
              <ListGroup variant="flush">
                {cart.cartItems.map((item, index) =>(
                  <ListGroup.Item key={index}>
                    <Row>
                      <Col md={1}>
                        <Image 
                          src={item.image}
                          alt={item.name}
                          fluid
                          rounded
                        />
                      </Col>
                      <Col>
                        <Link to={`/products/${item.product}`}>
                          {item.name}
                        </Link>
                      </Col>
                      <Col md={4}>
                        { item.qty } x SEK{ item.price } = SEK{ item.qty * item.price }
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ) )}
              </ListGroup>
            )}
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
                <Col>Items:</Col>
                <Col>SEK{cart.itemsPrice}</Col>
              </Row>
            </ListGroup.Item>
            <ListGroup.Item>
              <Row>
                <Col>Delivery:</Col>
                <Col>SEK{cart.deliveryPrice}</Col>
              </Row>
            </ListGroup.Item>
            <ListGroup.Item>
              <Row>
                <Col>Tax:</Col>
                <Col>SEK{cart.taxPrice}</Col>
              </Row>
            </ListGroup.Item>
            <ListGroup.Item>
              <Row>
                <Col><strong>Total</strong></Col>
                <Col>SEK{cart.totalPrice}</Col>
              </Row>
            </ListGroup.Item>

            <ListGroup.Item>
              {error && <Message variant='danger'>{error.data ? error.data.message : "An error occurred"}</Message>}
            </ListGroup.Item>

            <ListGroup.Item>
              <Button
                type="button"
                className="btn-block"
                disabled={cart.cartItems.length === 0}
                onClick={placeOrderHandler}
              >
                Place Order
              </Button>
              {isLoading && <Loader />}
            </ListGroup.Item>
          </ListGroup>
        </Card>
      </Col>
    </Row>
    </>
  )
}

export default PlaceOrderScreens






// import { useEffect, useState } from "react";
// import { Link, useNavigate } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { Button, Row, Col, ListGroup, Image, Card } from 'react-bootstrap';
// import { toast } from 'react-toastify';
// import CheckoutSteps from '../components/CheckoutSteps';
// import Message from '../components/Message';
// import Loader from '../components/Loader'
// import { useCreateOrderMutation } from '../slices/ordersApiSlice';
// import { setOrderId } from "../slices/orderSlice";
// import { clearCartItems } from '../slices/cartSlice';


// const PlaceOrderScreens = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const cart = useSelector((state) => state.cart);

//   const [createOrder, {isLoading, error}] = useCreateOrderMutation();

//   const orderDetails = useSelector((state) => state.order.orderPrices);


//   // const order = useSelector((state) => state.order); // Get the order state from Redux


//   useEffect(() => {
//     if (!cart.deliveryAddress.address) {
//       navigate('/delivery');
//     } else if (!cart.paymentMethod) {
//       navigate('/payment')
//     }
//   }, [cart.paymentMethod, cart.deliveryAddress.address, navigate])


//   const placeOrderHandler = async () => {
//     try {
//       const res = await createOrder({
//         orderItems: cart.cartItems,
//         deliveryAddress: cart.deliveryAddress,
//         paymentMethod: cart.paymentMethod,
//         itemsPrice: cart.itemsPrice,
//         deliveryPrice: cart.deliveryPrice,
//         phoneNumber: cart.phoneNumber,
//         taxPrice: cart.taxPrice,
//         totalPrice: cart.totalPrice
//       }).unwrap();
//       dispatch(clearCartItems());
      
//       if (res && res.createdOrder && res.createdOrder._id) {
//          // Dispatch orderId to Redux
//          dispatch(setOrderId(res.createdOrder._id));
         
//          navigate(`/order/${res.createdOrder._id}`); 
//       } else {
//         toast.error("Order ID not found in the response")
//       }
//     } catch (err) {
//       toast.error(err)
//     }
//   }

//   return (<>
//     <CheckoutSteps step1 step2 step3 step4 />
//     <Row>
//       <Col md={8}>
//         <ListGroup variant="flush">
//           <ListGroup.Item>
//             <h2>Delivery</h2>
//             <p>
//               <strong>Address</strong>
//               {cart.deliveryAddress.address}, 
//             </p>
//           </ListGroup.Item>
//           <ListGroup.Item>
//             <h2>Payment Method</h2>
//             <strong>Method: </strong>
//             {cart.paymentMethod}
//           </ListGroup.Item>
//           <ListGroup.Item>
//             <h2>Order Items</h2>
//             {cart.cartItems.length === 0 ? (
//               <Message>Your cart is empty</Message>
//             ) : (
//               <ListGroup variant="flush">
//                 {cart.cartItems.map((item, index) =>(
//                   <ListGroup.Item key={index}>
//                     <Row>
//                       <Col md={1}>
//                         <Image 
//                           src={item.image}
//                           alt={item.name}
//                           fluid
//                           rounded
//                         />
//                       </Col>
//                       <Col>
//                         <Link to={`/products/${item.product}`}>
//                           {item.name}
//                         </Link>
//                       </Col>
//                       <Col md={4}>
//                         { item.qty } x SEK{ item.price } = SEK{ item.qty * item.price }
//                       </Col>
//                     </Row>
//                   </ListGroup.Item>
//                 ) )}
//               </ListGroup>
//             )}
//           </ListGroup.Item>
//         </ListGroup>
//       </Col>
//       <Col md={4}>
//         <Card>
//           <ListGroup variant="flush">
//             <ListGroup.Item>
//               <h2>Order Summary</h2>
//             </ListGroup.Item>
//             <ListGroup.Item>
//               <Row>
//                 <Col>Items:</Col>
//                 <Col>SEK{cart.itemsPrice}</Col>
//               </Row>
//             </ListGroup.Item>
//             <ListGroup.Item>
//               <Row>
//                 <Col>Delivery:</Col>
//                 <Col>SEK{cart.deliveryPrice}</Col>
//               </Row>
//             </ListGroup.Item>
//             <ListGroup.Item>
//               <Row>
//                 <Col>Tax:</Col>
//                 <Col>SEK{cart.taxPrice}</Col>
//               </Row>
//             </ListGroup.Item>
//             <ListGroup.Item>
//               <Row>
//                 <Col><strong>Total</strong></Col>
//                 <Col>SEK{cart.totalPrice}</Col>
//               </Row>
//             </ListGroup.Item>

//             <ListGroup.Item>
//               {error && <Message variant='danger'>{error.data ? error.data.message : "An error occurred"}</Message>}
//             </ListGroup.Item>

//             <ListGroup.Item>
//               <Button
//                 type="button"
//                 className="btn-block"
//                 disabled={cart.cartItems.length === 0}
//                 onClick={placeOrderHandler}
//               >
//                 Place Order
//               </Button>
//               {isLoading && <Loader />}
//             </ListGroup.Item>
//           </ListGroup>
//         </Card>
//       </Col>
//     </Row>
//     </>
//   )
// }

// export default PlaceOrderScreens

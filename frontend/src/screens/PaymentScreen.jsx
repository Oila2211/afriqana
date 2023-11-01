// import { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { Form, Button, Col} from 'react-bootstrap'
// import FormContainer from "../components/FormContainer";
// import CheckoutSteps from "../components/CheckoutSteps";
// import { savePaymentMethod } from "../slices/cartSlice";

// const PaymentScreen = () => {
//     const navigate = useNavigate();
//     const cart = useSelector((state) => state.cart);
//     const { deliveryAddress } = cart;

//     useEffect(() => {
//         if (!deliveryAddress) {
//             navigate('/delivery');
//         }
//     }, [deliveryAddress, navigate])

//     const [paymentMethod, setPaymentMethod] = useState('Stripe')

//     const dispatch = useDispatch();

//     const submitHandler = (e) => {
//         e.preventDefault();
//         dispatch(savePaymentMethod(paymentMethod));
//         navigate('/placeorder')
//     }



//   return (
//     <FormContainer>
//         <CheckoutSteps step1 step2 step3/>
//         <h1>Payment Method</h1>
//         <Form onSubmit={ submitHandler }>
//             <Form.Group>
//                 <Form.Label as='legend'>Select Method</Form.Label>
//                 <Col>
//                     <Form.Check
//                     type="radio"
//                     className="my-2"
//                     label='Stripe (Credit Card)'
//                     id="Stripe"
//                     name="paymentMethod"
//                     value='Stripe'
//                     checked={paymentMethod === 'Stripe'}
//                     onChange={(e) => setPaymentMethod(e.target.value)}
//                     ></Form.Check>

//                     <Form.Check
//                     type="radio"
//                     className="my-2"
//                     label='Klarna'
//                     id="Klarna"
//                     name="paymentMethod"
//                     value='Klarna'
//                     checked={paymentMethod === 'Klarna'}
//                     onChange={(e) => setPaymentMethod(e.target.value)}
//                     ></Form.Check>

//                     <Form.Check
//                     type="radio"
//                     className="my-2"
//                     label='Swish'
//                     id="Swish"
//                     name="paymentMethod"
//                     value='Swish'
//                     checked={paymentMethod === 'Swish'}
//                     onChange={(e) => setPaymentMethod(e.target.value)}
//                     ></Form.Check>

//                 </Col>
//             </Form.Group>

//             <Button type="submit" variant="primary">
//                 Continue
//             </Button>
//         </Form>
//     </FormContainer>
//   )
// }

// export default PaymentScreen
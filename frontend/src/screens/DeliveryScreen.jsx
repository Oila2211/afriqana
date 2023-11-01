import { useState } from "react"
import { Form, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import FormContainer from "../components/FormContainer";
import { saveDeliveryAddress } from "../slices/cartSlice";
import CheckoutSteps from "../components/CheckoutSteps";

const DeliveryScreen = () => {
    const cart = useSelector((state) => state.cart);
    const { deliveryAddress } = cart;

    const [address, setAddress] = useState(deliveryAddress?.address || '');
    const [phoneNumber, setPhoneNumber] = useState(deliveryAddress?.phoneNumber || '')

    const navigate = useNavigate();
    const dispatch = useDispatch()



    const submitHandler = (e) => {
        e.preventDefault();
        dispatch(saveDeliveryAddress({
            address, phoneNumber
        }));
        navigate('/placeorder')
    };

  return (
    <FormContainer>
        <CheckoutSteps step1 step2/>
        <h1>Delivery</h1>
        <Form>
        <Form.Group controlId="address" className="my-2">
                <Form.Label>Address</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Enter Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                ></Form.Control>
            </Form.Group>

            <Form.Group controlId="phoneNumber" className="my-2">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                    type="number"
                    placeholder="Enter Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                ></Form.Control>
            </Form.Group>

            <Button type="submit" variant="primary" className="my-2" onClick={submitHandler}>
                    Continue
            </Button>
        </Form>
    </FormContainer>
  )
}

export default DeliveryScreen
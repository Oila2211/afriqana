

import { useState, useRef, useEffect } from "react"
import { Form, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import FormContainer from "../components/FormContainer";
import { saveDeliveryAddress } from "../slices/cartSlice";
import CheckoutSteps from "../components/CheckoutSteps";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import { useJsApiLoader, StandaloneSearchBox } from "@react-google-maps/api";

const libraries = ["places"]

const DeliveryScreen = () => {

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GOOGLEMAPS_API_KEY, // Store your API key in .env
        libraries: ["places"],
    });

    const cart = useSelector((state) => state.cart);
    const { deliveryAddress } = cart;

    const [address, setAddress] = useState(deliveryAddress?.address || '');
    const [longitude, setLongitude] = useState(deliveryAddress?.longitude || '');
    const [latitude, setLatitude] = useState(deliveryAddress?.latitude || '');


    const [phoneNumber, setPhoneNumber] = useState(deliveryAddress?.phoneNumber || '')

    const navigate = useNavigate();
    const dispatch = useDispatch()



    const searchBoxRef = useRef(null);

    const onPlacesChanged = async () => {
        const places = searchBoxRef.current.getPlaces();
        const place = places[0];
        if (place) {
            const geocode = await getGeocode({ address: place.formatted_address });
            const { lat, lng } = getLatLng(geocode[0]);
    
            setAddress(place.formatted_address);
            setLongitude(lng); // Set longitude first
            setLatitude(lat); // before setting lat as 2nd

        }
    };
    




    const submitHandler = (e) => {
        e.preventDefault();
        console.log("Submitting delivery address", {address, phoneNumber})
        dispatch(saveDeliveryAddress({
            address,
            longitude, 
            latitude,
            phoneNumber
        }));
        navigate('/placeorder')
    };

    if (!isLoaded) {
        return <div>Loading...</div>;
    }

  return (
    <FormContainer>
    <CheckoutSteps step1 step2 />
    <h1>Delivery</h1>
    <Form onSubmit={submitHandler}>
        <Form.Group controlId="address" className="my-2">
            <Form.Label>Address</Form.Label>
            <StandaloneSearchBox
                onLoad={ref => searchBoxRef.current = ref}
                onPlacesChanged={onPlacesChanged}
            >
                <Form.Control
                    type="text"
                    placeholder="Enter Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />
            </StandaloneSearchBox>
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

        <Button type="submit" variant="primary" className="my-2">
            Continue
        </Button>
    </Form>
</FormContainer>

)
}

export default DeliveryScreen


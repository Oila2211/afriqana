// import { useState, useEffect } from "react";
// import { Form, Button } from "react-bootstrap";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import PlacesAutocomplete, {
//   geocodeByAddress,
//   getLatLng,
// } from 'react-places-autocomplete';
// import FormContainer from "../components/FormContainer";
// import { saveDeliveryAddress } from "../slices/cartSlice";
// import CheckoutSteps from "../components/CheckoutSteps";
// import { useCalculateDeliveryPriceMutation } from "../slices/ordersApiSlice";

// const DeliveryScreen = () => {
//   const cart = useSelector((state) => state.cart);
//   const { deliveryAddress } = cart;

//   const [calculateDeliveryPrice, {isLoading}] = useCalculateDeliveryPriceMutation();

//   const [address, setAddress] = useState(deliveryAddress?.address || '');
//   const [floorAndDoor, setFloorAndDoor] = useState(deliveryAddress?.floorNumber || '');
//   const [phoneNumber, setPhoneNumber] = useState(deliveryAddress?.phoneNumber || '');

//   // Define Stockholm's latitude and longitude
//   const stockholmLatLng = new google.maps.LatLng(59.3293, 18.0686);
  

//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const handleSelect = async (value) => {
//     const results = await geocodeByAddress(value);
//     const latLng = await getLatLng(results[0]);
//     setAddress(value);
//     // You can also save the latLng if needed
//     // console.log('Latitude and Longitude:', latLng);
//   };

//   const submitHandler = async (e) => {
//     e.preventDefault();
//     try {
//         const geocodedAddress = await geocodeByAddress(address);
//         const { lat, lng } = await getLatLng(geocodedAddress[0]);
        
//       // Use only the latitude and longitude for delivery price calculation
//       const deliveryPrice = await calculateDeliveryPrice({ lat, lng }).unwrap();
//       dispatch(saveDeliveryAddress({
//         address: {
//           address,
//           floorAndDoor
//         },
//         phoneNumber,
//         deliveryPrice // Save the calculated delivery price from the backend
//       }));
//       navigate('/placeorder');
//     } catch (error) {
//       // Handle error, maybe set an error state and show it in the UI
//       console.error('Error calculating delivery price:', error);
//     }
//   };

//   // Search options for PlacesAutocomplete
//   const searchOptions = {
//     location: stockholmLatLng,
//     radius: 20000, // This is in meters. Adjust the value as needed for the Stockholm area.
//     componentRestrictions: { country: 'se' } // Restrict to Sweden
//   };


//   return (
//     <FormContainer>
//       <CheckoutSteps step1 step2 />
//       <h1>Delivery</h1>
//       <Form onSubmit={submitHandler}>
//         <Form.Group controlId="address" className="my-2">
//           <Form.Label>Address</Form.Label>
//           <PlacesAutocomplete
//             value={address}
//             onChange={setAddress}
//             onSelect={handleSelect}
//             searchOptions={searchOptions}
//           >
//             {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
//               <div>
//                 <Form.Control
//                   {...getInputProps({
//                     placeholder: 'Search Places ...',
//                     className: 'location-search-input',
//                   })}
//                 />
//                 <div className="autocomplete-dropdown-container">
//                   {loading && <div>Loading...</div>}
//                   {suggestions.map(suggestion => {
//                     const className = suggestion.active
//                       ? 'suggestion-item--active'
//                       : 'suggestion-item';
//                     // inline style for demonstration purpose
//                     const style = suggestion.active
//                       ? { backgroundColor: '#fafafa', cursor: 'pointer' }
//                       : { backgroundColor: '#ffffff', cursor: 'pointer' };
//                     return (
//                       <div
//                         {...getSuggestionItemProps(suggestion, {
//                           className,
//                           style,
//                         })}
//                       >
//                         <span>{suggestion.description}</span>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}
//           </PlacesAutocomplete>
//         </Form.Group>

//         <Form.Group controlId="floorAndDoor" className="my-2">
//           <Form.Label>Floor & Door Number</Form.Label>
//           <Form.Control
//             type="text"
//             placeholder="e.g., 3rd Floor, Door 2B"
//             value={floorAndDoor}
//             onChange={(e) => setFloorAndDoor(e.target.value)}
//           />
//           <Form.Text className="text-muted">
//             Please enter your floor and door number (e.g., "3rd Floor, Door 2B").
//           </Form.Text>
//         </Form.Group>

//         <Form.Group controlId="phoneNumber" className="my-2">
//           <Form.Label>Phone Number</Form.Label>
//           <Form.Control
//             type="number"
//             placeholder="Enter Phone Number"
//             value={phoneNumber}
//             onChange={(e) => setPhoneNumber(e.target.value)}
//           />
//         </Form.Group>

//         <Button type="submit" variant="primary" className="my-2">
//           Continue
//         </Button>
//       </Form>
//     </FormContainer>
//   );
// };

// export default DeliveryScreen;


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
        console.log("Submitting delivery address", {address, phoneNumber})
        dispatch(saveDeliveryAddress({
            address, phoneNumber
        }));
        navigate('/placeorder')
    };

  return (
    <FormContainer>
        <CheckoutSteps step1 step2/>
        <h1>Delivery</h1>
        <Form onSubmit={submitHandler}>
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

            <Button type="submit" variant="primary" className="my-2" >
                    Continue
            </Button>
        </Form>
    </FormContainer>
  )
}

export default DeliveryScreen


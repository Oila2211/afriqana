import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import FormContainer from '../../components/FormContainer';
import { toast } from 'react-toastify';
import { 
    useGetRegionDetailsQuery,
    useUpdateRegionMutation
 } from '../../slices/regionApiSlice';

const RegionPriceEditScreen = () => {
  const { id: regionId } = useParams();

  const [name, setName] = useState('');
  const [baseDeliveryPrice, setBaseDeliveryPrice] = useState(0);
  const [maxDistance, setMaxDistance] = useState('');
  const [extraChargePerKm, setExtraChargePerKm] = useState('');
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');

  const { data: region, isLoading, refetch, error } = useGetRegionDetailsQuery(regionId);

  const [updateRegion, { isLoading: loadingUpdate }] =
  useUpdateRegionMutation();
  
  const navigate = useNavigate();

    // Fetch coordinates based on the region name using Google Geocoding API
  const fetchCoordinates = async (regionName) => {
    const API_KEY = process.env.REACT_APP_GOOGLEMAPS_API_KEY;
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(regionName)}&key=${API_KEY}`
      );
      const data = await response.json();
      if (data.results.length > 0) {
        const location = data.results[0].geometry.location;
        setLongitude(location.lng);
        setLatitude(location.lat);
        toast.success(`Coordinates for ${regionName} fetched successfully`);
      } else {
        toast.error('Unable to fetch coordinates for the region');
      }
    } catch (err) {
      toast.error('Error fetching coordinates');
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await updateRegion({
        regionId,
        name,
        baseDeliveryPrice,
        maxDistance,
        extraChargePerKm,
        coordinates: [longitude, latitude]
      }).unwrap(); // NOTE: here we need to unwrap the Promise to catch any rejection in our catch block
      toast.success('Region updated');
      refetch();
      navigate('/admin/regionlist');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  useEffect(() => {
    if(region) {
      setName(region.name);
      setBaseDeliveryPrice(region.basePrice)
      setMaxDistance(region.maxDistance)
      setExtraChargePerKm(region.extraCharge)
      setLongitude(region.location.coordinates[0])
      setLatitude(region.location.coordinates[1])
    }
  }, [region])

  return (
    <>
     <Link to='/admin/regionlist' className='btn btn-light my-3'>
        Go Back
      </Link>
      <FormContainer>
        <h1>Edit Region</h1>
        {loadingUpdate && <Loader />}
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant='danger'>{error?.data?.message}</Message>
        ) : (
          <Form onSubmit={submitHandler}>
            <Form.Group controlId='name'>
              <Form.Label>Region</Form.Label>
              <Form.Control
                type='name'
                placeholder='Enter Region name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => fetchCoordinates(name)}  // Fetch coordinates on blur
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='base price'>
              <Form.Label>Price</Form.Label>
              <Form.Control
                type='number'
                placeholder='Enter base price'
                value={baseDeliveryPrice}
                onChange={(e) => setBaseDeliveryPrice(e.target.value)}
              ></Form.Control>
            </Form.Group>


            <Form.Group controlId='Max Distance'>
              <Form.Label>Max Distance</Form.Label>
              <Form.Control
                type='number'
                placeholder='Enter Maximum distance'
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='extra charge'>
              <Form.Label>Extra Charge</Form.Label>
              <Form.Control
                type='number'
                placeholder='Enter Extra Charge Per Km'
                value={extraChargePerKm}
                onChange={(e) => setExtraChargePerKm(e.target.value)}
              ></Form.Control>
            </Form.Group>

            {/* Longitude and Latitude Fields (auto-populated by Geocoding) */}
            <Form.Group controlId='longitude'>
              <Form.Label>Longitude</Form.Label>
              <Form.Control
                type='text'
                placeholder='Longitude'
                value={longitude}
                readOnly
              />
            </Form.Group>

            <Form.Group controlId='latitude'>
              <Form.Label>Latitude</Form.Label>
              <Form.Control
                type='text'
                placeholder='Latitude'
                value={latitude}
                readOnly
              />
            </Form.Group>


            <Button
              type='submit'
              variant='primary'
              style={{ marginTop: '1rem' }}
            >
              Update
            </Button>
          </Form>
        )}
      </FormContainer>
</>
  )
}

export default RegionPriceEditScreen

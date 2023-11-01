import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import FormContainer from '../../components/FormContainer';
import { toast } from 'react-toastify';
import { useGetCouponDetailsQuery, useUpdateCouponMutation } from '../../slices/couponApiSlice';

const CouponEditScreen = () => {
  const {id: couponId} = useParams();
  const [discountPercentage, setDiscountPercentage] = useState(10);
  const [expiryDate, setExpiryDate] = useState();
  const [isActive, setIsActive] = useState(0);

  const { data: coupon, isLoading, refetch, error} = useGetCouponDetailsQuery(couponId);

  const [updateCoupon, { isLoading: loadingUpdate}] = useUpdateCouponMutation()

  const navigate = useNavigate();


  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await updateCoupon({
        couponId,
        discountPercentage,
        expiryDate,
        isActive,
      }).unwrap(); // Note: here we need to unwrap the promise to catch any rejections;
      toast.success('Coupon updated');
      refetch();
      navigate(`/admin/couponlist`);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  }

  useEffect(() => {
    if(coupon) {
      setDiscountPercentage(coupon.discountPercentage)
      setExpiryDate(coupon.ExpiryDate)
      setIsActive(coupon.isActive)
    }
  }, [coupon])
  
  return (
    <>
      <Link to='/admin/couponlist' className='btn btn-light my-3'>
        Go back
      </Link>
      <FormContainer>
        <h1>Edit Coupon</h1>
        {loadingUpdate && <Loader />}
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant='danger'>{error?.data?.message}</Message>
        ) : (
          <Form onSubmit={submitHandler}>
            <Form.Group>
              <Form.Label>Discount Percentage</Form.Label>
              <Form.Control
                type='number'
                placeholder='Enter discount percent'
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group>
              <Form.Label>Expiry Date</Form.Label>
              <Form.Control
                type='date'
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='Activate'>
              <Form.Label>Activate</Form.Label>
              <Form.Check
                type='switch'
                label={isActive ? 'Coupon Activated' : 'Coupon Not activated'}
                checked={isActive}
                onChange={(e) => setIsActive(!isActive)}
              ></Form.Check>
            </Form.Group>

            <Button
              type='submit'
              variant='primary'
              style={{ marginTop: '1rem'}}
            >
              Update
            </Button>
          </Form>
        )}
      </FormContainer>
    </>
  )
}

export default CouponEditScreen
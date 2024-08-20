import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { Button, Form, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Message from '../components/Message';
import { useApplyCouponMutation } from "../slices/couponApiSlice";
import { setOrderValues, putCouponCode } from "../slices/orderSlice";
import { useState } from "react";
// import { useParams } from "react-router-dom";

const ApplyCoupon = () => {
    
    const dispatch = useDispatch()
    const [couponCode, setCouponCode] = useState('');
    const [applyCoupon, {isLoading, refetch, error}] = useApplyCouponMutation()
    
    // Selector to get orderId from Redux
    const orderId = useSelector((state) => state.order.orderId);


    const submitHandler = async (e) => {
      e.preventDefault();

      try {
          const res = await applyCoupon({ couponCode, orderId }).unwrap();

          if (res && res.orderPrices) {
              toast.success("Coupon successfully applied");
              dispatch(setOrderValues(res.orderPrices)); // Update the order prices in the state
              dispatch(putCouponCode(couponCode)); // save coupon code
              refetch();
          } else {
              toast.error("Failed to apply the coupon");
          }
      } catch (err) {
          console.error("Coupon Error:", err);
          toast.error(err?.data?.message || err?.error);
      }
  };




  return (
    <>
    <Form onSubmit={submitHandler}>
        <InputGroup className="mb-3">
            <Form.Control
            placeholder="Coupon code"
            aria-describedby="basic-addon2"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}

            />
            <Button type="submit"  variant="outline-secondary" id="button-addon2">
            Apply Coupon
            </Button>
        </InputGroup>     
      </Form>
    </>
  )
}

export default ApplyCoupon




// import { useDispatch, useSelector } from "react-redux";
// import { useState } from "react";
// import { Button, Form, InputGroup } from 'react-bootstrap';
// import { toast } from 'react-toastify';
// import { useParams } from 'react-router-dom';
// import { useApplyCouponMutation } from "../slices/couponApiSlice";
// import { setOrderValues } from "../slices/orderSlice";

// const ApplyCoupon = () => {
//   const dispatch = useDispatch();
//   const { id: orderId } = useParams(); // Get orderId from the URL params
//   const [couponCode, setCouponCode] = useState('');
//   const orderId = useSelector((state) => state.order.orderId);
//   const [applyCoupon, { isLoading, refetch, error }] = useApplyCouponMutation();

//   const submitHandler = async (e) => {
//     e.preventDefault();

//     const payload = { couponCode, orderId };


//     try {
//       const res = await applyCoupon(payload).unwrap();

//       if (res && res.orderPrices) {
//         toast.success("Coupon successfully applied");
//         dispatch(setOrderValues(res.orderPrices)); // Update the order prices in the state
//         refetch();
//       } else {
//         toast.error("Failed to apply the coupon");
//       }
//     } catch (err) {
//       console.error("Coupon Error:", err);
//       toast.error(err?.data?.message || err?.error);
//     }
//   };

//   return (
//     <>
//       <Form onSubmit={submitHandler}>
//         <InputGroup className="mb-3">
//           <Form.Control
//             placeholder="Coupon code"
//             aria-describedby="basic-addon2"
//             value={couponCode}
//             onChange={(e) => setCouponCode(e.target.value)}
//           />
//           <Button type="submit" variant="outline-secondary" id="button-addon2">
//             Apply Coupon
//           </Button>
//         </InputGroup>
//       </Form>
//     </>
//   );
// };

// export default ApplyCoupon;
import { useDispatch, useSelector } from "react-redux";
import { ListGroup, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Message from '../components/Message';
import { useRedeemPointsMutation } from "../slices/usersApiSlice";
import { setOrderValues } from "../slices/orderSlice";

const RedeemPoints = () => {
    
    // Selector to get orderId from Redux
    const orderId = useSelector((state) => state.order.orderId);
    const dispatch = useDispatch();

    const [redeemPoints, { isLoading: isRedeeming, error: redeemError}] = useRedeemPointsMutation()

    const redeemPointsHandler = async () => {
        try {

            const data = {
              points: 2000,
              orderId,
            };
            const result = await redeemPoints(data).unwrap();

            if (result && result.orderPrices) {
                dispatch(setOrderValues(result.orderPrices)); //Update the new order prices after discount
            }
            
            toast.success("Successfully initiated Qana points")
        
        } catch (error) {
           toast.error(error?.message || "Failed to redeem points") 
        }
    }



  return (
    <>

        <ListGroup.Item>
            <Button
                disabled={isRedeeming}
                onClick={redeemPointsHandler}>
                Redeem Points

            </Button>
            <span>
            {redeemError && <Message variant="danger">{redeemError.message || "Failed to redeem points"}</Message>}
            </span>
        </ListGroup.Item>       
    </>
  )
}

export default RedeemPoints;
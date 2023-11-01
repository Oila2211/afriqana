import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Row, Col, ListGroup, Image, Card, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Message from '../components/Message';
import { useRedeemPointsMutation } from "../slices/usersApiSlice";

const RedeemPointsScreen = () => {
    const {id: orderId} = useParams();
    const [redeemOption, setRedeemOption] = useState('');

    const [redeemPoints, { isLoading: isRedeeming, refetch, error: redeemError}] = useRedeemPointsMutation()
    const navigate = useNavigate();

    const redeemPointsHandler = async () => {
        try {

            const data = {
              points: 2000,
              orderId,
              redeemOption,
            };
            await redeemPoints(data).unwrap();
            
            toast.success("Successfully initiated Qana points")
        } catch (error) {
           toast.error(error?.message || "Failed to redeem points") 
        }
    }

    const continueToOrderScreen = () => {
        navigate(`/order/${orderId}`);
        
    }
  return (
    <>
      <h1>Redeem Qana Points</h1>
      <Row>
          <Col md={6}>
              <ListGroup>
                  <ListGroup.Item>
                      <h2>Choose Redemption Option:</h2>
                  </ListGroup.Item>
                  <ListGroup.Item>
                      <input
                          type="radio"
                          name="redeemOption"
                          value="50-discount"
                          onChange={(e) => setRedeemOption(e.target.value)}
                      /> SEK 50 Discount
                  </ListGroup.Item>
                  <ListGroup.Item>
                      <input
                          type="radio"
                          name="redeemOption"
                          value="free-shipping"
                          onChange={(e) => setRedeemOption(e.target.value)}
                      /> Free Shipping
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Button 
                        disabled={isRedeeming || !redeemOption} 
                        onClick={redeemPointsHandler}>
                        Redeem Points
                    </Button>
                  </ListGroup.Item>
              </ListGroup>
              <ListGroup>
                <Button onClick={continueToOrderScreen}>Continue</Button>
              </ListGroup>
          </Col>
      </Row>
      {redeemError && <Message variant="danger">{redeemError.message || "Failed to redeem points"}</Message>}
    </>
  )
}

export default RedeemPointsScreen
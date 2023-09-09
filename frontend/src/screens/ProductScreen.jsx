import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { useGetProductDetailsQuery } from '../slices/productsApiSlice';
import { Link } from 'react-router-dom';
import { Row, Col, Image, ListGroup, Card, Button, FormControl,  } from 
'react-bootstrap';
import { addToCart } from '../slices/cartSlice';

const ProductScreen = () => {
    const { id: productId } = useParams();

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [qty, setQty] = useState(1);

    const { data: product, isLoading, error } = useGetProductDetailsQuery(productId);

    const addToCartHandler = () => {
        dispatch(addToCart({...product, qty}));
        navigate('/cart');
    }

    const maxOrderQuantity = 10; // Adjust qty number as pleased...



  return (<>
    <Link className='btn btn-light my-3' to='/order'>Go Back</Link>

    {isLoading ? (
        <Loader/>
    ): error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
          </Message>
    ) : (<>
        
        <Row>
            <Col md={5}>
                <Image src={product.image} alt={product.name}fluid />
            </Col>
            <Col md={4}>
                <ListGroup>
                    <ListGroup.Item>
                        <h3>{product.name}</h3>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        price:SEK {product.price}
                    </ListGroup.Item>
                    <ListGroup.Item>
                        {product.description}
                    </ListGroup.Item>
                </ListGroup>
            </Col>
            <Col md={3}>
                <Card>
                    <ListGroup variant='flush'>
                        <ListGroup.Item>
                        <Row>
                            <Col>
                            <Col>Price</Col>
                                <strong>SEK {product.price}</strong>
                            </Col>
                        </Row>
                        </ListGroup.Item>
                        <ListGroup.Item>
                        <Row>
                            <Col>
                            <Col>Status</Col>
                                <strong>{product.stock === true ? "Available" : "Sold Out"}</strong>
                            </Col>
                        </Row>
                        </ListGroup.Item>
    
                        <ListGroup.Item>

                            {product.stock && (
                                <ListGroup.Item>
                                    <Row>
                                        <Col>Qty</Col>
                                        <Col>
                                            <FormControl
                                                as='select'
                                                value={qty}
                                                onChange={(e) => setQty(Number(e.target.value))}>
                                                {[...Array(maxOrderQuantity).keys()].map(x => (
                                                     <option key={x + 1} value={x + 1}>
                                                        {x + 1}
                                                    </option>
                                                ))}
                                            </FormControl>
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                            )}

                            <Button
                            className='btn-block'
                            type='button'
                            disabled={product.stock === false}
                            onClick={addToCartHandler}
                            >
                            Add To Cart 
    
                            </Button>
                        </ListGroup.Item>
    
                    </ListGroup>
                </Card>
            </Col>
        </Row>
    </>
    )}

    </>
  )
}

export default ProductScreen
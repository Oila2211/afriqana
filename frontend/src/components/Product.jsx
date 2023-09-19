import React from 'react'
import { Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const Product = ({product}) => {
  return (
    <Card className='my-3 p-3 rounded'>
        <Link to={`/product/${product._id}`}>
            <Card.Img src={product.image} variant="top"/>
        </Link>
        <Card.Body>
        <Card.Title as="div" className='product-title'>
            <strong>{product.name}</strong>
        </Card.Title>

        <Card.Text as='h3'>
            SEK{product.price}
        </Card.Text>
        </Card.Body>
    </Card>
  )
}

export default Product
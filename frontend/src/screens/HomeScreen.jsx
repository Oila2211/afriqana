import React from 'react'
import { Container,Col,Image,Row } from 'react-bootstrap';


const HomeScreen = () => {
  return (
  <>
    <Container>
      <Row>
        <Col xs={6} md={4}>
          <Image />
        </Col>
        <Col xs={6} md={4}>
          <Image />
        </Col>
        <Col xs={6} md={4}>
          <Image />
        </Col>
      </Row>
    </Container>
  </>
  )
}

export default HomeScreen
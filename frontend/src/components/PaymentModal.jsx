import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const PaymentModal = ({ show, onHide, amount }) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Payment Completion</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Payment successful!</p>
        <p>Amount Paid: {amount}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentModal;

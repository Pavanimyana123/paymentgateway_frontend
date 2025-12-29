import React, { useState } from 'react';
import { Card, Tabs, Tab, Button, Alert, Form, InputGroup, FormControl, Badge } from 'react-bootstrap';
import './Instructions.css';
import CustomNavbar from './Navbar';
import BaseURL from './BaseURL';

const InstructionsPage = () => {
  const [activeTab, setActiveTab] = useState('razorpay');
  const [copiedItem, setCopiedItem] = useState('');

  const handleCopy = (text, item) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(item);
    setTimeout(() => setCopiedItem(''), 2000);
  };

  return (
    <>
      <CustomNavbar />
      <div className="instructions-container">
        <h1 className="mb-4">💰 Payment Gateway API Instructions</h1>
        <p className="lead mb-4">Use the following API endpoints and payloads to create payment orders</p>

        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4"
        >
          <Tab eventKey="razorpay" title="Razorpay">
            <RazorpayInstructions handleCopy={handleCopy} copiedItem={copiedItem} />
          </Tab>
          <Tab eventKey="phonepe" title="PhonePe">
            <PhonePeInstructions handleCopy={handleCopy} copiedItem={copiedItem} />
          </Tab>
          <Tab eventKey="ccavenue" title="CCAvenue">
            <CCAvenueInstructions handleCopy={handleCopy} copiedItem={copiedItem} />
          </Tab>
        </Tabs>
      </div>
    </>
  );
};

const RazorpayInstructions = ({ handleCopy, copiedItem }) => (
  <div>
    <Alert variant="info">
      <strong>Base URL:</strong> {BaseURL}/api/razorpay/orders
    </Alert>

    <h3 className="mt-4 mb-3">📋 Available Actions</h3>

    <Card className="mb-4">
      <Card.Header>
        <h5>1. Create Order</h5>
      </Card.Header>
      <Card.Body>
        <p><Badge bg="primary">POST</Badge> Creates a Razorpay order</p>
        
        <Form.Group className="mb-3">
          <Form.Label><strong>Request Payload:</strong></Form.Label>
          <InputGroup>
            <FormControl
              as="textarea"
              rows={6}
              value={JSON.stringify({
                action: "create-order",
                amount: 100,
                currency: "INR",
                // environment: "test",
                returnOptions: false
              }, null, 2)}
              readOnly
            />
            <Button
              variant={copiedItem === 'razorpay-create' ? 'success' : 'outline-secondary'}
              onClick={() => handleCopy(JSON.stringify({
                action: "create-order",
                amount: 100,
                currency: "INR",
                // environment: "test",
                returnOptions: false
              }, null, 2), 'razorpay-create')}
            >
              {copiedItem === 'razorpay-create' ? '✓ Copied' : 'Copy'}
            </Button>
          </InputGroup>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label><strong>Response:</strong></Form.Label>
          <Form.Control
            as="textarea"
            rows={8}
            value={JSON.stringify({
              success: true,
              action: 'order-created',
              order_id: "order_N5rWsi5IdL4zKt",
              amount: "100",
              currency: "INR",
              environment: "test",
              key: "rzp_test_xxxxxxxxxxxx"
            }, null, 2)}
            readOnly
          />
        </Form.Group>
      </Card.Body>
    </Card>

    <Card className="mb-4">
      <Card.Header>
        <h5>2. Verify Payment</h5>
      </Card.Header>
      <Card.Body>
        <p><Badge bg="primary">POST</Badge> Verify payment signature after successful transaction</p>
        
        <Form.Group className="mb-3">
          <Form.Label><strong>Request Payload:</strong></Form.Label>
          <InputGroup>
            <FormControl
              as="textarea"
              rows={6}
              value={JSON.stringify({
                action: "verify-payment",
                paymentData: {
                  razorpay_order_id: "order_N5rWsi5IdL4zKt",
                  razorpay_payment_id: "pay_N5rX0e9vRqzV3o",
                  razorpay_signature: "xxxxxxxxxxxxxxxxxxxxxxxx"
                },
                // environment: "test"
              }, null, 2)}
              readOnly
            />
            <Button
              variant={copiedItem === 'razorpay-verify' ? 'success' : 'outline-secondary'}
              onClick={() => handleCopy(JSON.stringify({
                action: "verify-payment",
                paymentData: {
                  razorpay_order_id: "order_N5rWsi5IdL4zKt",
                  razorpay_payment_id: "pay_N5rX0e9vRqzV3o",
                  razorpay_signature: "xxxxxxxxxxxxxxxxxxxxxxxx"
                },
                // environment: "test"
              }, null, 2), 'razorpay-verify')}
            >
              {copiedItem === 'razorpay-verify' ? '✓ Copied' : 'Copy'}
            </Button>
          </InputGroup>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label><strong>Response:</strong></Form.Label>
          <Form.Control
            as="textarea"
            rows={6}
            value={JSON.stringify({
              success: true,
              action: 'verification-success',
              message: 'Payment verified successfully'
            }, null, 2)}
            readOnly
          />
        </Form.Group>
      </Card.Body>
    </Card>
  </div>
);

const PhonePeInstructions = ({ handleCopy, copiedItem }) => (
  <div>
    <Alert variant="info">
      <strong>Base URL:</strong> {BaseURL}/api/phonepe/orders
    </Alert>

    <h3 className="mt-4 mb-3">📋 Available Actions</h3>

    <Card className="mb-4">
      <Card.Header>
        <h5>1. Create Order</h5>
      </Card.Header>
      <Card.Body>
        <p><Badge bg="primary">POST</Badge> Creates PhonePe payment order</p>
        
        <Form.Group className="mb-3">
          <Form.Label><strong>Request Payload:</strong></Form.Label>
          <InputGroup>
            <FormControl
              as="textarea"
              rows={6}
              value={JSON.stringify({
                action: "create-order",
                amount: 100,
                currency: "INR",
                // environment: "test",
                merchantOrderId: "ORD_123456" // Optional
              }, null, 2)}
              readOnly
            />
            <Button
              variant={copiedItem === 'phonepe-create' ? 'success' : 'outline-secondary'}
              onClick={() => handleCopy(JSON.stringify({
                action: "create-order",
                amount: 100,
                currency: "INR",
                // environment: "test",
                merchantOrderId: "ORD_123456"
              }, null, 2), 'phonepe-create')}
            >
              {copiedItem === 'phonepe-create' ? '✓ Copied' : 'Copy'}
            </Button>
          </InputGroup>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label><strong>Response:</strong></Form.Label>
          <Form.Control
            as="textarea"
            rows={8}
            value={JSON.stringify({
              success: true,
              action: 'order-created',
              checkoutPageUrl: 'https://mercury-uat.phonepe.com/transact/xxx',
              merchantOrderId: 'ORD_123456',
              amount: '100',
              currency: 'INR',
              environment: 'test'
            }, null, 2)}
            readOnly
          />
        </Form.Group>
      </Card.Body>
    </Card>

    <Card className="mb-4">
      <Card.Header>
        <h5>2. Check Payment Status</h5>
      </Card.Header>
      <Card.Body>
        <p><Badge bg="primary">POST</Badge> Check PhonePe payment status</p>
        
        <Form.Group className="mb-3">
          <Form.Label><strong>Request Payload:</strong></Form.Label>
          <InputGroup>
            <FormControl
              as="textarea"
              rows={5}
              value={JSON.stringify({
                action: "check-status",
                merchantOrderId: "ORD_123456",
                // environment: "test"
              }, null, 2)}
              readOnly
            />
            <Button
              variant={copiedItem === 'phonepe-status' ? 'success' : 'outline-secondary'}
              onClick={() => handleCopy(JSON.stringify({
                action: "check-status",
                merchantOrderId: "ORD_123456",
                // environment: "test"
              }, null, 2), 'phonepe-status')}
            >
              {copiedItem === 'phonepe-status' ? '✓ Copied' : 'Copy'}
            </Button>
          </InputGroup>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label><strong>Response:</strong></Form.Label>
          <Form.Control
            as="textarea"
            rows={8}
            value={JSON.stringify({
              success: true,
              action: 'status-checked',
              merchantOrderId: "ORD_123456",
              status: "SUCCESS",
              phonepeStatus: "COMPLETED",
              environment: "test"
            }, null, 2)}
            readOnly
          />
        </Form.Group>
      </Card.Body>
    </Card>
  </div>
);

const CCAvenueInstructions = ({ handleCopy, copiedItem }) => (
  <div>
    <Alert variant="info">
      <strong>Base URL:</strong> {BaseURL}/api/ccavenue/create-order
    </Alert>

    <Alert variant="warning" className="mb-3">
      <strong>Note:</strong> For CCAvenue integration, you need to <strong>get permission</strong> from CCAvenue to use this base URL in their merchant configuration. Add this URL to your CCAvenue merchant dashboard as the callback/redirect URL.
    </Alert>

    <h3 className="mt-4 mb-3">📋 Create CCAvenue Order</h3>

    <Card className="mb-4">
      <Card.Header>
        <h5>Create Order</h5>
      </Card.Header>
      <Card.Body>
        <p><Badge bg="primary">POST</Badge> Creates CCAvenue order</p>
        
        <Form.Group className="mb-3">
          <Form.Label><strong>Request Payload:</strong></Form.Label>
          <InputGroup>
            <FormControl
              as="textarea"
              rows={12}
              value={JSON.stringify({
                amount: 100,
                currency: "INR",
                shippingAddress: {
                  fullName: "John Doe",
                  addressLine1: "123 Main Street",
                  city: "Mumbai",
                  state: "Maharashtra",
                  postalCode: "400001",
                  country: "India",
                  phone: "9999999999",
                  email: "john@example.com"
                },
                orderMeta: {
                  userId: "user_123",
                  productId: "prod_456",
                  description: "E-commerce Purchase"
                },
                // environment: "test" 
              }, null, 2)}
              readOnly
            />
            <Button
              variant={copiedItem === 'ccavenue-create' ? 'success' : 'outline-secondary'}
              onClick={() => handleCopy(JSON.stringify({
                amount: 100,
                currency: "INR",
                shippingAddress: {
                  fullName: "John Doe",
                  addressLine1: "123 Main Street",
                  city: "Mumbai",
                  state: "Maharashtra",
                  postalCode: "400001",
                  country: "India",
                  phone: "9999999999",
                  email: "john@example.com"
                },
                orderMeta: {
                  userId: "user_123",
                  productId: "prod_456",
                  description: "E-commerce Purchase"
                },
                // environment: "test"
              }, null, 2), 'ccavenue-create')}
            >
              {copiedItem === 'ccavenue-create' ? '✓ Copied' : 'Copy'}
            </Button>
          </InputGroup>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label><strong>Response:</strong></Form.Label>
          <Form.Control
            as="textarea"
            rows={8}
            value={JSON.stringify({
              redirectUrl: "https://test.ccavenue.com/transaction/initiate",
              paymentData: {
                merchant_id: "M_xxxxxxx",
                order_id: "ORD_123456",
                amount: "100.00",
                currency: "INR",
                redirect_url: `${BaseURL}/api/ccavResponseHandler`, // Your callback URL
                cancel_url: `${BaseURL}/api/ccavResponseHandler`, // Your cancel URL
                billing_name: "John Doe",
                billing_address: "123 Main Street",
                billing_city: "Mumbai",
                billing_state: "Maharashtra",
                billing_zip: "400001",
                billing_country: "India",
                billing_tel: "9999999999",
                billing_email: "john@example.com"
              },
              environment: "test"
            }, null, 2)}
            readOnly
          />
        </Form.Group>
      </Card.Body>
    </Card>

    <Alert variant="info">
      <h6>📋 CCAvenue Setup Requirements:</h6>
      <ol className="mb-0">
        <li>Register as a merchant on CCAvenue</li>
        <li>Configure the following URLs in your CCAvenue dashboard:</li>
        <ul>
          <li><strong>Redirect URL:</strong> {BaseURL}/api/ccavResponseHandler</li>
          <li><strong>Cancel URL:</strong> {BaseURL}/api/ccavResponseHandler</li>
        </ul>
        <li>Get your Merchant ID, Access Code, and Working Key from CCAvenue</li>
        <li>Add these credentials to your backend environment variables</li>
      </ol>
    </Alert>
  </div>
);

export default InstructionsPage;
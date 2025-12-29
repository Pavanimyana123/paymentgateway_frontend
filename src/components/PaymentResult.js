import React, { useState, useEffect } from 'react';
import { Container, Alert, Button, Card, Badge, Spinner } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BaseURL from './BaseURL';

const PaymentResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const status = queryParams.get('status');
        const orderId = queryParams.get('orderId');
        const gateway = queryParams.get('gateway');
        const environment = queryParams.get('environment') || 'test';

        console.log("Payment Result Params:", { status, orderId, gateway, environment });
        
        // For PhonePe, we need to check status even if no status parameter is provided
        if (gateway === 'phonepe' && orderId) {
            // PhonePe doesn't pass status parameter, so we need to check via API
            setPaymentStatus({
                status: 'processing',
                orderId,
                gateway,
                environment
            });
            setIsLoading(false);
            checkPhonePeStatus(orderId, environment);
        } 
        // For other gateways (Razorpay, CC Avenue) that pass status parameter
        else if (orderId) {
            setPaymentStatus({
                status: status || 'processing',
                orderId,
                gateway: gateway || 'unknown',
                environment
            });
            setIsLoading(false);
        } else {
            setIsLoading(false);
        }
    }, [location]);

    const checkPhonePeStatus = async (merchantOrderId, environment) => {
        try {
            console.log(`Checking PhonePe status for: ${merchantOrderId}, env: ${environment}`);
            
            const res = await axios.post(
                `${BaseURL}/api/phonepe/orders`,
                {
                    action: 'check-status',
                    merchantOrderId,
                    environment
                }
            );
            
            console.log("PhonePe status response:", res.data);
            
            if (res.data.success) {
                setPaymentStatus(prev => ({
                    ...prev,
                    status: res.data.status
                }));
            }
        } catch (error) {
            console.error('Failed to check PhonePe status:', error);
            // If error, set status to failed
            setPaymentStatus(prev => ({
                ...prev,
                status: 'ERROR'
            }));
        }
    };

    const handleRetryStatusCheck = () => {
        if (paymentStatus && paymentStatus.gateway === 'phonepe') {
            checkPhonePeStatus(paymentStatus.orderId, paymentStatus.environment);
        }
    };

    if (isLoading) {
        return (
            <Container className="my-5 text-center">
                <Spinner animation="border" />
                <h2 className="mt-3">Loading payment result...</h2>
            </Container>
        );
    }

    if (!paymentStatus) {
        return (
            <Container className="my-5">
                <Alert variant="warning">
                    <h4>No payment information found</h4>
                    <p>Please initiate a payment first.</p>
                    <Button variant="primary" onClick={() => navigate('/')}>
                        Go to Payment Page
                    </Button>
                </Alert>
            </Container>
        );
    }

    const { status, orderId, gateway, environment } = paymentStatus;
    const isSuccess = status === 'Success' || status === 'SUCCESS';
    const isFailed = status === 'Failed' || status === 'FAILED' || status === 'ERROR';
    const isProcessing = status === 'processing' || status === 'PENDING';
    const isLive = environment === 'live';

    return (
        <Container className="my-5">
            <Card className="shadow">
                <Card.Body className="text-center">
                    <Card.Title>
                        {isProcessing ? 'Payment Processing' : 
                         isSuccess ? 'Payment Successful' : 
                         'Payment Failed'}
                        <Badge bg={isLive ? 'danger' : 'warning'} className="ms-2">
                            {isLive ? 'LIVE' : 'TEST'}
                        </Badge>
                        <Badge bg={gateway === 'phonepe' ? 'info' : 'secondary'} className="ms-2">
                            {gateway.toUpperCase()}
                        </Badge>
                    </Card.Title>
                    
                    <Alert variant={
                        isSuccess ? 'success' : 
                        isFailed ? 'danger' : 
                        'warning'
                    } className="mt-3">
                        {isProcessing ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                <h4>⏳ Payment Processing</h4>
                            </>
                        ) : isSuccess ? (
                            <h4>✅ Payment Successful!</h4>
                        ) : (
                            <h4>❌ Payment Failed</h4>
                        )}
                        
                        <p>
                            <strong>Gateway:</strong> {gateway.toUpperCase()}<br />
                            <strong>Order ID:</strong> {orderId}<br />
                            <strong>Environment:</strong> {environment.toUpperCase()}<br />
                            <strong>Status:</strong> {status}
                        </p>
                        
                        {isProcessing && gateway === 'phonepe' && (
                            <div className="mt-3">
                                <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    onClick={handleRetryStatusCheck}
                                >
                                    Refresh Status
                                </Button>
                                <p className="text-muted mt-2 small">
                                    PhonePe payments may take a few moments to process.
                                </p>
                            </div>
                        )}
                    </Alert>
                    
                    <div className="mt-4">
                        <Button 
                            variant="primary" 
                            onClick={() => navigate('/payment-form')}
                            className="me-2"
                        >
                            Make Another Payment
                        </Button>
                        <Button 
                            variant="outline-secondary"
                            onClick={() => navigate('/transactions')}
                        >
                            View Payment History
                        </Button>
                    </div>
                    
                    {isLive && !isProcessing && (
                        <Alert variant="warning" className="mt-3">
                            <strong>Note:</strong> This was a real transaction in LIVE mode. 
                            Real money has been {isSuccess ? 'charged' : 'not charged'}.
                        </Alert>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default PaymentResult;
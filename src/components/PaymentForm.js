import React, { useState, useEffect } from "react";
import { Container, Form, Button, Row, Col, Card, Alert, Badge } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BaseURL from './BaseURL';
import CustomNavbar from './Navbar';

const loadRazorpay = () => {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const PaymentForm = () => {
    const [paymentMode, setPaymentMode] = useState("");
    const [environment, setEnvironment] = useState("test"); // Get from backend
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        amount: "",
        currency: "INR",
    });

    const [address, setAddress] = useState({
        fullName: "John Doe",
        phone: "9876543210",
        email: "john.doe@example.com",
        addressLine1: "Flat No 301, Green Heights",
        city: "Hyderabad",
        state: "Telangana",
        postalCode: "500081",
        country: "India",
    });

    const [companyProfile, setCompanyProfile] = useState(null);

    // Add this useEffect to fetch company profile on component mount
    useEffect(() => {
        fetchCompanyProfile();
    }, []);

    const fetchCompanyProfile = async () => {
        try {
            const res = await axios.get(`${BaseURL}/api/company-profile`);
            if (res.data.success) {
                setCompanyProfile(res.data.profile);
                setEnvironment(res.data.profile.environment)
            }
        } catch (error) {
            console.error("Failed to fetch company profile:", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddressChange = (e) => {
        setAddress({
            ...address,
            [e.target.name]: e.target.value,
        });
    };

    // Combined Razorpay handler using single API
    const handleRazorpayPayment = async () => {
        try {
            const loaded = await loadRazorpay();
            if (!loaded) {
                alert("Razorpay SDK failed to load");
                return;
            }

            // Get complete options from backend
            const response = await axios.post(
                `${BaseURL}/api/razorpay/orders`,
                {
                    action: 'create-order',
                    amount: formData.amount,
                    currency: formData.currency,
                    returnOptions: true // This tells backend to return complete options
                }
            );

            if (!response.data.success) {
                throw new Error(response.data.message || "Failed to create order");
            }

            const { options } = response.data;
            console.log("Razorpay options:", options);

            // Add handler function (must be added on frontend)
            options.handler = async (paymentResponse) => {
                try {
                    const verifyRes = await axios.post(
                        `${BaseURL}/api/razorpay/orders`,
                        {
                            action: 'verify-payment',
                            paymentData: {
                                razorpay_order_id: paymentResponse.razorpay_order_id,
                                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                                razorpay_signature: paymentResponse.razorpay_signature
                            }
                        }
                    );

                    if (verifyRes.data.success) {
                        navigate(
                            `/payment-result?status=Success&orderId=${paymentResponse.razorpay_order_id}&gateway=razorpay&environment=${response.data.environment || 'test'}`
                        );
                    } else {
                        navigate(
                            `/payment-result?status=Failed&orderId=${paymentResponse.razorpay_order_id}&gateway=razorpay&environment=${response.data.environment || 'test'}`
                        );
                    }
                } catch (error) {
                    console.error("Verification error:", error);
                    navigate(
                        `/payment-result?status=Failed&orderId=${paymentResponse.razorpay_order_id}&gateway=razorpay&environment=${response.data.environment || 'test'}`
                    );
                }
            };

            const rzp = new window.Razorpay(options);

            rzp.on("payment.failed", (response) => {
                console.error("Payment failed:", response.error);
                const orderId = response.error.metadata?.order_id || options.order_id;
                navigate(
                    `/payment-result?status=Failed&orderId=${orderId}&gateway=razorpay&environment=${response.data.environment || 'test'}`
                );
            });

            rzp.open();

        } catch (error) {
            console.error("Razorpay payment error:", error);
            alert(`Razorpay payment failed: ${error.message}`);
        }
    };

    // Combined PhonePe handler using single API
    const handlePhonePePayment = async () => {
        try {
            const response = await axios.post(
                `${BaseURL}/api/phonepe/orders`,
                {
                    action: 'create-order',
                    amount: formData.amount,
                    currency: formData.currency
                }
            );

            if (response.data.success) {
                window.location.href = response.data.checkoutPageUrl;
            } else {
                throw new Error(response.data.message || 'Failed to create order');
            }
        } catch (error) {
            console.error("PhonePe payment error:", error);
            alert(`PhonePe payment failed: ${error.message}`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.amount || Number(formData.amount) <= 0) {
            alert("Please enter a valid amount");
            return;
        }

        setIsLoading(true);

        try {
            /* ============ RAZORPAY ============ */
            if (paymentMode === "razorpay") {
                await handleRazorpayPayment();
            }

            /* ============ PHONEPE ============ */
            else if (paymentMode === "phonepe") {
                await handlePhonePePayment();
            }

            /* ============ CC AVENUE ============ */
            else if (paymentMode === "ccavenue") {
                const res = await axios.post(
                    `${BaseURL}/api/ccavenue/create-order`,
                    {
                        amount: Number(formData.amount).toFixed(2),
                        currency: formData.currency,
                        shippingAddress: address,
                        orderMeta: {
                            userId: "USER123",
                            subtotal: 1000,
                            discount: 0,
                            shipping: 50,
                            tax: 200,
                            total: formData.amount,
                            itemsCount: 3,
                        },
                    }
                );

                const { redirectUrl, paymentData } = res.data;

                const form = document.createElement("form");
                form.method = "POST";
                form.action = redirectUrl;

                Object.entries(paymentData).forEach(([key, value]) => {
                    const input = document.createElement("input");
                    input.type = "hidden";
                    input.name = key;
                    input.value = value;
                    form.appendChild(input);
                });
                document.body.appendChild(form);
                form.submit();
            }
        } catch (error) {
            console.error("Payment initiation error:", error);
            alert(`Payment initiation failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const getEnvironmentBadge = () => {
        const variant = environment === "live" ? "success" : "primary";
        const text = environment === "live" ? "LIVE MODE" : "TEST MODE";
        return <Badge bg={variant} className="ms-2">{text}</Badge>;
    };

    return (
        <>
            {/* Include the Navbar at the top */}
            <CustomNavbar />
            <Container className="my-5">
                <Row className="justify-content-center">
                    <Col md={8}>
                        <Card className="shadow">
                            <Card.Body>
                                <Card.Title className="text-center mb-4">
                                    Payment Gateway {getEnvironmentBadge()}
                                </Card.Title>

                                <Alert variant="info" className="mb-4">
                                    <strong>Current Mode:</strong> {environment === "live" ? 
                                        "⚠️ LIVE MODE - Real transactions will be processed" : 
                                        "🛠️ TEST MODE - No real money will be charged"}
                                </Alert>

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Select Payment Gateway</Form.Label>
                                        <Form.Select
                                            value={paymentMode}
                                            onChange={(e) => setPaymentMode(e.target.value)}
                                            required
                                            disabled={isLoading}
                                        >
                                            <option value="">-- Select Gateway --</option>
                                            <option value="razorpay">Razorpay</option>
                                            <option value="phonepe">PhonePe</option>
                                            <option value="ccavenue">CC Avenue</option>
                                        </Form.Select>
                                    </Form.Group>

                                    {paymentMode && (
                                        <>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Amount (in rupees)</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="amount"
                                                    value={formData.amount}
                                                    onChange={handleChange}
                                                    required
                                                    disabled={isLoading}
                                                    placeholder="Enter amount"
                                                    min="1"
                                                    step="1"
                                                />
                                            </Form.Group>

                                            <Form.Group className="mb-3">
                                                <Form.Label>Currency</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={formData.currency}
                                                    readOnly
                                                />
                                            </Form.Group>
                                        </>
                                    )}

                                    {paymentMode === "ccavenue" && (
                                        <>
                                            <h5 className="mt-3">Billing / Shipping Address</h5>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label>Full Name</Form.Label>
                                                        <Form.Control
                                                            name="fullName"
                                                            value={address.fullName}
                                                            onChange={handleAddressChange}
                                                            required
                                                            disabled={isLoading}
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                <Col md={6}>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label>Phone</Form.Label>
                                                        <Form.Control
                                                            name="phone"
                                                            value={address.phone}
                                                            onChange={handleAddressChange}
                                                            required
                                                            disabled={isLoading}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            <Form.Group className="mb-3">
                                                <Form.Label>Email</Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    name="email"
                                                    value={address.email}
                                                    onChange={handleAddressChange}
                                                    required
                                                    disabled={isLoading}
                                                />
                                            </Form.Group>

                                            <Form.Group className="mb-2">
                                                <Form.Label>Address</Form.Label>
                                                <Form.Control
                                                    name="addressLine1"
                                                    value={address.addressLine1}
                                                    onChange={handleAddressChange}
                                                    required
                                                    disabled={isLoading}
                                                />
                                            </Form.Group>

                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label>City</Form.Label>
                                                        <Form.Control
                                                            name="city"
                                                            value={address.city}
                                                            onChange={handleAddressChange}
                                                            required
                                                            disabled={isLoading}
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                <Col md={6}>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label>State</Form.Label>
                                                        <Form.Control
                                                            name="state"
                                                            value={address.state}
                                                            onChange={handleAddressChange}
                                                            required
                                                            disabled={isLoading}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label>Pincode</Form.Label>
                                                        <Form.Control
                                                            name="postalCode"
                                                            value={address.postalCode}
                                                            onChange={handleAddressChange}
                                                            required
                                                            disabled={isLoading}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label>Country</Form.Label>
                                                        <Form.Control
                                                            name="country"
                                                            value={address.country}
                                                            onChange={handleAddressChange}
                                                            required
                                                            disabled={isLoading}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-100 mt-3"
                                        disabled={!paymentMode || isLoading}
                                        variant={environment === "live" ? "success" : "primary"}
                                    >
                                        {isLoading ? "Processing..." : `Proceed to Pay (${environment.toUpperCase()} Mode)`}
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default PaymentForm;
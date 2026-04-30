import React, { useEffect, useState } from "react";
import {
  Container,
  Form,
  Button,
  Card,
  Alert,
  Row,
  Col,
} from "react-bootstrap";
import axios from "axios";
import BaseURL from "./BaseURL";
import CustomNavbar from "./Navbar";
import { useNavigate } from "react-router-dom";

const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CreateSubscription = () => {
  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [isRecurring, setIsRecurring] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [totalCount, setTotalCount] = useState(12);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
    fetchPlans();
  }, []);

  const fetchCustomers = async () => {
    const res = await axios.get(`${BaseURL}/api/razorpay/customers`);
    setCustomers(res.data.customers || []);
  };

  const fetchPlans = async () => {
    const res = await axios.get(`${BaseURL}/api/razorpay/plans`);
    setPlans(res.data.plans || []);
  };

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const loaded = await loadRazorpay();
      if (!loaded) {
        alert("Razorpay SDK failed to load");
        return;
      }

      // ===============================
      // 🔁 RECURRING (SUBSCRIPTION)
      // ===============================
      if (isRecurring) {
        const res = await axios.post(`${BaseURL}/api/razorpay/subscription`, {
          customer_id: selectedCustomer,
          plan_id: selectedPlan,
          total_count: Number(totalCount),
        });

        if (!res.data.success) {
          throw new Error(res.data.error || "Subscription failed");
        }

        const { options, subscription_id } = res.data;

        if (!options?.key || !options?.subscription_id) {
          throw new Error("Invalid subscription options");
        }

        options.handler = async function (response) {
          try {
            const verifyRes = await axios.post(
              `${BaseURL}/api/razorpay/verify-subscription-payment`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
              },
            );

            if (verifyRes.data.success) {
              navigate("/transactions"); // ✅ SUCCESS REDIRECT
            } else {
              setMessage({
                type: "danger",
                text: "Subscription verification failed",
              });
            }
          } catch (err) {
            console.error(err);
            setMessage({
              type: "danger",
              text: "Verification error",
            });
          }
        };

        const rzp = new window.Razorpay(options);

        rzp.on("payment.failed", function (response) {
          console.error("Payment Failed:", response.error);

          setMessage({
            type: "danger",
            text: response.error.description || "Payment failed",
          });
        });

        rzp.open();
      }

      // ===============================
      // 💰 ONE-TIME PAYMENT
      // ===============================
      else {
        const selectedPlanData = plans.find((p) => p.plan_id === selectedPlan);

        if (!selectedPlanData) {
          throw new Error("Plan not found");
        }

        const res = await axios.post(`${BaseURL}/api/razorpay/orders`, {
          action: "create-order",
          amount: selectedPlanData.amount,
          currency: "INR",
          returnOptions: true,
        });

        if (!res.data.success) {
          throw new Error("Order creation failed");
        }

        const { options } = res.data;

        options.handler = async function (response) {
          try {
            const verifyRes = await axios.post(
              `${BaseURL}/api/razorpay/orders`,
              {
                action: "verify-payment",
                paymentData: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                },
              },
            );

            if (verifyRes.data.success) {
              navigate("/subscriptions"); // ✅ SUCCESS REDIRECT
            } else {
              setMessage({
                type: "danger",
                text: "Payment verification failed",
              });
            }
          } catch (err) {
            console.error(err);
            setMessage({
              type: "danger",
              text: "Verification error",
            });
          }
        };

        const rzp = new window.Razorpay(options);

        rzp.on("payment.failed", function (response) {
          console.error("Payment Failed:", response.error);

          setMessage({
            type: "danger",
            text: response.error.description || "Payment failed",
          });
        });

        rzp.open();
      }
    } catch (err) {
      console.error(err);

      setMessage({
        type: "danger",
        text: err.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CustomNavbar />
      <Container className="my-5">
        <Card className="shadow">
          <Card.Body>
            <Card.Title>Create Payment / Subscription</Card.Title>

            {message && <Alert variant={message.type}>{message.text}</Alert>}

            <Form>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Select Customer</Form.Label>
                    <Form.Select
                      value={selectedCustomer}
                      onChange={(e) => setSelectedCustomer(e.target.value)}
                    >
                      <option value="">-- Select Customer --</option>
                      {customers.map((c) => (
                        <option key={c.customer_id} value={c.customer_id}>
                          {c.name} ({c.email})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Select Plan</Form.Label>
                    <Form.Select
                      value={selectedPlan}
                      onChange={(e) => setSelectedPlan(e.target.value)}
                    >
                      <option value="">-- Select Plan --</option>
                      {plans.map((p) => (
                        <option key={p.plan_id} value={p.plan_id}>
                          {p.plan_name} - ₹{p.amount}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Select Duration</Form.Label>
                    <Form.Select
                      value={totalCount}
                      onChange={(e) => setTotalCount(e.target.value)}
                    >
                      <option value={1}>1 Month</option>
                      <option value={3}>3 Months</option>
                      <option value={6}>6 Months</option>
                      <option value={12}>12 Months</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {/* ✅ RECURRING CHECKBOX */}
              {/* <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="AutoPay"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                />
              </Form.Group> */}

              <div className="d-flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => navigate("/subscriptions")}
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleSubscribe}
                  disabled={!selectedCustomer || !selectedPlan || loading}
                >
                  {loading
                    ? "Processing..."
                    : isRecurring
                      ? "Subscribe Now"
                      : "Pay One-Time"}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default CreateSubscription;

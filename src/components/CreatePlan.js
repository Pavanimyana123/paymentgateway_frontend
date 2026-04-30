import React, { useState } from "react";
import { Container, Form, Button, Card, Alert } from "react-bootstrap";
import axios from "axios";
import BaseURL from "./BaseURL";
import CustomNavbar from "./Navbar";
import { useNavigate } from "react-router-dom";

const CreatePlan = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    plan_name: "",
    amount: "",
    currency: "INR",
    period: "monthly",
    interval: 1,
  });

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setResponse(null);

    try {
      const res = await axios.post(`${BaseURL}/api/razorpay/plan`, formData);

      setResponse({
        success: true,
        message: "Plan created successfully",
        data: res.data.plan,
      });
    } catch (err) {
      setResponse({
        success: false,
        message: err.response?.data?.error || "Plan creation failed",
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
            <Card.Title>Create Subscription Plan</Card.Title>

            {response && (
              <Alert variant={response.success ? "success" : "danger"}>
                {response.message}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Plan Name</Form.Label>
                <Form.Control
                  name="plan_name"
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Amount (₹)</Form.Label>
                <Form.Control
                  type="number"
                  name="amount"
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Billing Period</Form.Label>
                <Form.Select name="period" onChange={handleChange}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Interval</Form.Label>
                <Form.Control
                  type="number"
                  name="interval"
                  onChange={handleChange}
                  value={formData.interval}
                />
              </Form.Group>
              <div className="d-flex gap-2">
                {/* Cancel Button */}
                <Button variant="secondary" onClick={() => navigate("/plans")}>
                  Cancel
                </Button>

                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Plan"}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default CreatePlan;

import React, { useState } from "react";
import { Container, Form, Button, Card, Alert } from "react-bootstrap";
import axios from "axios";
import BaseURL from "./BaseURL";
import CustomNavbar from "./Navbar";
import { useNavigate } from "react-router-dom";

const CreateCustomer = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
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
      const res = await axios.post(
        `${BaseURL}/api/razorpay/customer`,
        formData,
      );

      setResponse({
        success: true,
        message: res.data.message,
        data: res.data.customer,
      });
    } catch (err) {
      setResponse({
        success: false,
        message: err.response?.data?.error || "Failed to create customer",
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
            <Card.Title>Create Razorpay Customer</Card.Title>

            {response && (
              <Alert variant={response.success ? "success" : "danger"}>
                {response.message}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control name="name" onChange={handleChange} required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Contact</Form.Label>
                <Form.Control name="contact" onChange={handleChange} required />
              </Form.Group>

              <div className="d-flex gap-2">
                {/* Cancel Button */}
                <Button
                  variant="secondary"
                  onClick={() => navigate("/customers")}
                >
                  Cancel
                </Button>

                {/* Submit Button */}
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Customer"}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default CreateCustomer;

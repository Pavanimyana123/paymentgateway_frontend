import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Table,
  Button,
  Spinner,
  Alert,
  Row,
  Col,
  Form,
  InputGroup,
} from "react-bootstrap";
import { Search, Plus } from "react-bootstrap-icons";
import axios from "axios";
import BaseURL from "./BaseURL";
import CustomNavbar from "./Navbar";
import { useNavigate } from "react-router-dom";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    let data = [...customers];

    if (search) {
      data = data.filter(
        (c) =>
          c.name?.toLowerCase().includes(search.toLowerCase()) ||
          c.email?.toLowerCase().includes(search.toLowerCase()) ||
          c.customer_id?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(data);
  }, [search, customers]);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${BaseURL}/api/razorpay/customers`);
      setCustomers(res.data.customers || []);
      setFiltered(res.data.customers || []);
    } catch (err) {
      setError("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner />
      </Container>
    );
  }

  return (
    <>
      <CustomNavbar />
      <Container className="my-4">
        <div className="d-flex justify-content-between mb-3">
          <h3>Customers</h3>

          <Button onClick={() => navigate("/create-customer")}>
            <Plus className="me-2" /> Create Customer
          </Button>
        </div>

        <Card className="mb-3">
          <Card.Body>
            <InputGroup>
              <InputGroup.Text>
                <Search />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
          </Card.Body>
        </Card>

        {error && <Alert variant="danger">{error}</Alert>}

        <Card>
          <Table hover>
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Contact</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length > 0 ? (
                filtered.map((c) => (
                  <tr key={c.customer_id}>
                    <td>{c.customer_id}</td>
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.contact}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      </Container>
    </>
  );
};

export default Customers;
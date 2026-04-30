import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Table,
  Button,
  Spinner,
  Alert,
  InputGroup,
  Form,
} from "react-bootstrap";
import { Search, Plus } from "react-bootstrap-icons";
import axios from "axios";
import BaseURL from "./BaseURL";
import CustomNavbar from "./Navbar";
import { useNavigate } from "react-router-dom";

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    let data = [...plans];

    if (search) {
      data = data.filter(
        (p) =>
          p.plan_name?.toLowerCase().includes(search.toLowerCase()) ||
          p.plan_id?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(data);
  }, [search, plans]);

  const fetchPlans = async () => {
    try {
      const res = await axios.get(`${BaseURL}/api/razorpay/plans`);
      setPlans(res.data.plans || []);
      setFiltered(res.data.plans || []);
    } catch (err) {
      setError("Failed to load plans");
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
          <h3>Plans</h3>

          <Button onClick={() => navigate("/create-plan")}>
            <Plus className="me-2" /> Create Plan
          </Button>
        </div>

        <Card className="mb-3">
          <Card.Body>
            <InputGroup>
              <InputGroup.Text>
                <Search />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search plans..."
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
                <th>Plan ID</th>
                <th>Name</th>
                <th>Amount</th>
                <th>Interval</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length > 0 ? (
                filtered.map((p) => (
                  <tr key={p.plan_id}>
                    <td>{p.plan_id}</td>
                    <td>{p.plan_name}</td>
                    <td>₹{p.amount}</td>
                    <td>{p.interval_count}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No plans found
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

export default Plans;
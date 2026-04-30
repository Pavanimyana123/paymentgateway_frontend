import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Table,
  Badge,
  Spinner,
  Alert,
  Button,
  Row,
  Col,
  Form,
  InputGroup,
  Pagination,
} from "react-bootstrap";
import { Search, ArrowClockwise } from "react-bootstrap-icons";
import axios from "axios";
import CustomNavbar from "./Navbar";
import BaseURL from "./BaseURL";
import { useNavigate } from "react-router-dom";

const RazorpaySubscriptions = () => {
    const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [environmentFilter, setEnvironmentFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  useEffect(() => {
    filterSubscriptions();
  }, [subscriptions, searchTerm, statusFilter, environmentFilter]);

  // ================= FETCH =================
  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BaseURL}/api/razorpay/subscriptions`);

      if (res.data.success) {
        setSubscriptions(res.data.subscriptions);
        setFilteredSubscriptions(res.data.subscriptions);
      } else {
        throw new Error("Failed to fetch subscriptions");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  // ================= FILTER =================
  const filterSubscriptions = () => {
    let data = [...subscriptions];

    if (searchTerm) {
      data = data.filter(
        (s) =>
          s.subscription_id
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          s.customer_id
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          s.plan_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      data = data.filter((s) => s.status === statusFilter);
    }

    if (environmentFilter !== "all") {
      data = data.filter((s) => s.environment === environmentFilter);
    }

    setFilteredSubscriptions(data);
    setCurrentPage(1);
  };

  // ================= BADGES =================
  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "created":
        return "warning";
      case "cancelled":
        return "danger";
      case "completed":
        return "primary";
      default:
        return "secondary";
    }
  };

  const getEnvironmentBadge = (env) => {
    return env === "live" ? "danger" : "warning";
  };

  // ================= PAGINATION =================
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = filteredSubscriptions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage);

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subscription?")) return;

    try {
      const res = await axios.delete(
        `${BaseURL}/api/razorpay/subscriptions/${id}`
      );

      if (res.data.success) {
        setSubscriptions((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      alert("Delete failed");
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <>
        <CustomNavbar />
        <Container className="my-5 text-center">
          <Spinner animation="border" />
          <h5 className="mt-3">Loading subscriptions...</h5>
        </Container>
      </>
    );
  }

  return (
    <>
      <CustomNavbar />

      <Container className="my-4">
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
  <div>
    <h3>Razorpay Subscriptions</h3>
    <p className="text-muted mb-0">
      Total: {filteredSubscriptions.length}
    </p>
  </div>

  <div className="d-flex gap-2">
    {/* ✅ CREATE BUTTON */}
    <Button
      variant="primary"
      onClick={() => navigate("/create-subscription")}
    >
      + Create Subscription
    </Button>

    {/* 🔄 REFRESH BUTTON */}
    <Button onClick={fetchSubscriptions} variant="outline-primary">
      <ArrowClockwise className="me-2" /> Refresh
    </Button>
  </div>
</div>

        {/* FILTERS */}
        <Card className="mb-4">
          <Card.Body>
            <Row className="g-3">
              <Col md={4}>
                <InputGroup>
                  <InputGroup.Text>
                    <Search />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>

              <Col md={4}>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="created">Created</option>
                  <option value="active">Active</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </Form.Select>
              </Col>

              <Col md={4}>
                <Form.Select
                  value={environmentFilter}
                  onChange={(e) => setEnvironmentFilter(e.target.value)}
                >
                  <option value="all">All Environment</option>
                  <option value="test">Test</option>
                  <option value="live">Live</option>
                </Form.Select>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* ERROR */}
        {error && <Alert variant="danger">{error}</Alert>}

        {/* TABLE */}
        <Card>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover>
                <thead className="bg-light">
                  <tr>
                    <th>Subscription ID</th>
                    <th>Customer</th>
                    <th>Plan</th>
                    <th>Payment ID</th>
                    <th>Status</th>
                    <th>Environment</th>
                    <th>Date</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {currentData.length > 0 ? (
                    currentData.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <strong>{s.subscription_id}</strong>
                        </td>

                        <td>{s.customer_id}</td>

                        <td>{s.plan_id}</td>

                        <td>
                          {s.payment_id || (
                            <span className="text-muted">-</span>
                          )}
                        </td>

                        <td>
                          <Badge bg={getStatusBadge(s.status)}>
                            {s.status}
                          </Badge>
                        </td>

                        <td>
                          <Badge bg={getEnvironmentBadge(s.environment)}>
                            {s.environment}
                          </Badge>
                        </td>

                        <td>
                          {new Date(s.created_at).toLocaleString()}
                        </td>

                        <td className="text-end">
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDelete(s.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        No subscriptions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="p-3 d-flex justify-content-end">
                <Pagination>
                  <Pagination.Prev
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  />

                  {[...Array(totalPages)].map((_, i) => (
                    <Pagination.Item
                      key={i}
                      active={i + 1 === currentPage}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}

                  <Pagination.Next
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  />
                </Pagination>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default RazorpaySubscriptions;
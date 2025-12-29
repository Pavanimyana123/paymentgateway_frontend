import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Card, 
    Table, 
    Badge, 
    Form, 
    InputGroup, 
    Button, 
    Row, 
    Col,
    Pagination,
    Spinner,
    Alert,
    Dropdown,
    Modal
} from 'react-bootstrap';
import { Search, Filter, Download, Eye, Calendar, XCircle } from 'react-bootstrap-icons';
import axios from 'axios';
import CustomNavbar from './Navbar';
import BaseURL from './BaseURL';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Search and Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [gatewayFilter, setGatewayFilter] = useState('all');
    const [environmentFilter, setEnvironmentFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');
    
    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    
    // Modal States
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    // Fetch transactions on component mount
    useEffect(() => {
        fetchTransactions();
    }, []);

    // Filter transactions when filters change
    useEffect(() => {
        filterTransactions();
    }, [transactions, searchTerm, statusFilter, gatewayFilter, environmentFilter, dateFilter]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Replace with your actual API endpoint
            const response = await axios.get(`${BaseURL}/api/transactions`);
            
            if (response.data.success) {
                setTransactions(response.data.transactions);
                setFilteredTransactions(response.data.transactions);
            } else {
                throw new Error(response.data.message || 'Failed to fetch transactions');
            }
        } catch (err) {
            console.error('Error fetching transactions:', err);
            setError(err.message || 'Failed to load transactions. Please try again.');
            
            // For demo purposes - using mock data if API fails
            setTransactions(getMockTransactions());
            setFilteredTransactions(getMockTransactions());
        } finally {
            setLoading(false);
        }
    };

    const filterTransactions = () => {
        let filtered = [...transactions];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(transaction =>
                transaction.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                transaction.payment_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                transaction.gateway.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(transaction => transaction.status === statusFilter);
        }

        // Apply gateway filter
        if (gatewayFilter !== 'all') {
            filtered = filtered.filter(transaction => transaction.gateway === gatewayFilter);
        }

        // Apply environment filter
        if (environmentFilter !== 'all') {
            filtered = filtered.filter(transaction => transaction.environment === environmentFilter);
        }

        // Apply date filter
        if (dateFilter) {
            filtered = filtered.filter(transaction => {
                const transactionDate = new Date(transaction.created_at).toISOString().split('T')[0];
                return transactionDate === dateFilter;
            });
        }

        setFilteredTransactions(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleStatusFilter = (status) => {
        setStatusFilter(status);
    };

    const handleGatewayFilter = (gateway) => {
        setGatewayFilter(gateway);
    };

    const handleEnvironmentFilter = (environment) => {
        setEnvironmentFilter(environment);
    };

    const handleDateFilter = (e) => {
        setDateFilter(e.target.value);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setGatewayFilter('all');
        setEnvironmentFilter('all');
        setDateFilter('');
    };

    const handleViewDetails = (transaction) => {
        setSelectedTransaction(transaction);
        setShowDetailsModal(true);
    };

    const handleCloseDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedTransaction(null);
    };

    const exportToCSV = () => {
        const headers = ['Order ID', 'Payment ID', 'Gateway', 'Amount', 'Currency', 'Status', 'Environment', 'Date'];
        const csvData = filteredTransactions.map(transaction => [
            transaction.order_id,
            transaction.payment_id || 'N/A',
            transaction.gateway,
            transaction.amount,
            transaction.currency,
            transaction.status,
            transaction.environment,
            new Date(transaction.created_at).toLocaleString()
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Helper function to get status badge variant
    const getStatusBadge = (status) => {
        switch (status) {
            case 'SUCCESS':
            case 'Success':
                return 'success';
            case 'FAILED':
            case 'Failed':
                return 'danger';
            case 'CREATED':
            case 'PENDING':
                return 'warning';
            default:
                return 'secondary';
        }
    };

    // Helper function to get environment badge variant
    const getEnvironmentBadge = (environment) => {
        return environment === 'live' ? 'danger' : 'warning';
    };

    // Mock data for demo
    const getMockTransactions = () => {
        const gateways = ['razorpay', 'phonepe', 'ccavenue'];
        const statuses = ['SUCCESS', 'FAILED', 'PENDING'];
        const environments = ['test', 'live'];
        
        return Array.from({ length: 25 }, (_, i) => ({
            id: i + 1,
            order_id: `ORDER_${Date.now()}_${i}`,
            payment_id: i % 3 === 0 ? `PAY_${Date.now()}_${i}` : null,
            gateway: gateways[i % 3],
            amount: (Math.random() * 1000 + 10).toFixed(2),
            currency: 'INR',
            status: statuses[i % 3],
            environment: environments[i % 2],
            created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
            updated_at: new Date(Date.now() - Math.random() * 10000000000).toISOString()
        }));
    };

    if (loading) {
        return (
            <>
                <CustomNavbar />
                <Container className="my-5">
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <h4 className="mt-3">Loading transactions...</h4>
                    </div>
                </Container>
            </>
        );
    }

    return (
        <>
            <CustomNavbar />
            
            <Container fluid="lg" className="my-4">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="h3 mb-1">Transactions</h1>
                        <p className="text-muted mb-0">
                            Total: {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Button 
                        variant="outline-primary" 
                        onClick={exportToCSV}
                        className="d-flex align-items-center"
                    >
                        <Download className="me-2" /> Export CSV
                    </Button>
                </div>

                {/* Filters Card */}
                <Card className="mb-4 shadow-sm">
                    <Card.Body>
                        <Row className="g-3">
                            <Col md={6} lg={4}>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <Search />
                                    </InputGroup.Text>
                                    <Form.Control
                                        placeholder="Search by Order ID, Payment ID, Gateway..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                    />
                                </InputGroup>
                            </Col>

                            <Col md={6} lg={2}>
                                <Form.Select
                                    value={statusFilter}
                                    onChange={(e) => handleStatusFilter(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="SUCCESS">Success</option>
                                    <option value="FAILED">Failed</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="CREATED">Created</option>
                                </Form.Select>
                            </Col>

                            <Col md={6} lg={2}>
                                <Form.Select
                                    value={gatewayFilter}
                                    onChange={(e) => handleGatewayFilter(e.target.value)}
                                >
                                    <option value="all">All Gateways</option>
                                    <option value="razorpay">Razorpay</option>
                                    <option value="phonepe">PhonePe</option>
                                    <option value="ccavenue">CC Avenue</option>
                                </Form.Select>
                            </Col>

                            <Col md={6} lg={2}>
                                <Form.Select
                                    value={environmentFilter}
                                    onChange={(e) => handleEnvironmentFilter(e.target.value)}
                                >
                                    <option value="all">All Environments</option>
                                    <option value="test">Test</option>
                                    <option value="live">Live</option>
                                </Form.Select>
                            </Col>

                            <Col md={6} lg={2}>
                                <Form.Control
                                    type="date"
                                    value={dateFilter}
                                    onChange={handleDateFilter}
                                    placeholder="Filter by date"
                                />
                            </Col>

                            <Col md={6} lg={2}>
                                <Button
                                    variant="outline-secondary"
                                    onClick={clearFilters}
                                    className="w-100 d-flex align-items-center justify-content-center"
                                >
                                    <XCircle className="me-2" /> Clear Filters
                                </Button>
                            </Col>
                        </Row>

                        {/* Active Filters Display */}
                        {(statusFilter !== 'all' || gatewayFilter !== 'all' || environmentFilter !== 'all' || dateFilter || searchTerm) && (
                            <div className="mt-3">
                                <small className="text-muted me-2">Active filters:</small>
                                {statusFilter !== 'all' && (
                                    <Badge bg="info" className="me-2">Status: {statusFilter}</Badge>
                                )}
                                {gatewayFilter !== 'all' && (
                                    <Badge bg="info" className="me-2">Gateway: {gatewayFilter}</Badge>
                                )}
                                {environmentFilter !== 'all' && (
                                    <Badge bg="info" className="me-2">Environment: {environmentFilter}</Badge>
                                )}
                                {dateFilter && (
                                    <Badge bg="info" className="me-2">Date: {dateFilter}</Badge>
                                )}
                                {searchTerm && (
                                    <Badge bg="info" className="me-2">Search: {searchTerm}</Badge>
                                )}
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* Error Alert */}
                {error && (
                    <Alert variant="danger" className="mb-4">
                        <Alert.Heading>Error!</Alert.Heading>
                        <p>{error}</p>
                        <Button variant="outline-danger" size="sm" onClick={fetchTransactions}>
                            Retry
                        </Button>
                    </Alert>
                )}

                {/* Transactions Table */}
                <Card className="shadow-sm">
                    <Card.Body className="p-0">
                        <div className="table-responsive">
                            <Table hover className="mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-4">Order ID</th>
                                        <th>Payment ID</th>
                                        <th>Gateway</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Environment</th>
                                        <th>Date</th>
                                        <th className="text-end pe-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentTransactions.length > 0 ? (
                                        currentTransactions.map((transaction) => (
                                            <tr key={transaction.id || transaction.order_id}>
                                                <td className="ps-4">
                                                    <div className="fw-semibold">{transaction.order_id}</div>
                                                    <small className="text-muted">
                                                        {new Date(transaction.created_at).toLocaleDateString()}
                                                    </small>
                                                </td>
                                                <td>
                                                    {transaction.payment_id ? (
                                                        <code className="text-truncate" style={{ maxWidth: '150px' }}>
                                                            {transaction.payment_id}
                                                        </code>
                                                    ) : (
                                                        <span className="text-muted">-</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <Badge bg="secondary" className="text-uppercase">
                                                        {transaction.gateway}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <div className="fw-bold">
                                                        {transaction.currency} {parseFloat(transaction.amount).toFixed(2)}
                                                    </div>
                                                </td>
                                                <td>
                                                    <Badge bg={getStatusBadge(transaction.status)} className="text-uppercase">
                                                        {transaction.status}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Badge bg={getEnvironmentBadge(transaction.environment)} className="text-uppercase">
                                                        {transaction.environment}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    {new Date(transaction.created_at).toLocaleString()}
                                                </td>
                                                <td className="text-end pe-4">
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => handleViewDetails(transaction)}
                                                        className="d-flex align-items-center"
                                                    >
                                                        <Eye className="me-1" size={14} /> Details
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center py-5">
                                                <div className="text-muted">
                                                    <Filter size={48} className="mb-3" />
                                                    <h5>No transactions found</h5>
                                                    <p>Try adjusting your filters or search term</p>
                                                    {transactions.length === 0 ? (
                                                        <Button variant="primary" onClick={fetchTransactions}>
                                                            Refresh
                                                        </Button>
                                                    ) : (
                                                        <Button variant="outline-primary" onClick={clearFilters}>
                                                            Clear Filters
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {filteredTransactions.length > itemsPerPage && (
                            <div className="d-flex justify-content-between align-items-center p-3 border-top">
                                <div className="text-muted">
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTransactions.length)} of {filteredTransactions.length} entries
                                </div>
                                <Pagination className="mb-0">
                                    <Pagination.Prev 
                                        onClick={() => paginate(currentPage - 1)} 
                                        disabled={currentPage === 1}
                                    />
                                    
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(page => {
                                            // Show first, last, current, and neighbors
                                            if (page === 1 || page === totalPages) return true;
                                            if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                                            return false;
                                        })
                                        .map((page, index, array) => {
                                            // Add ellipsis
                                            const prevPage = array[index - 1];
                                            if (prevPage && page - prevPage > 1) {
                                                return (
                                                    <React.Fragment key={`ellipsis-${page}`}>
                                                        <Pagination.Ellipsis disabled />
                                                        <Pagination.Item
                                                            active={page === currentPage}
                                                            onClick={() => paginate(page)}
                                                        >
                                                            {page}
                                                        </Pagination.Item>
                                                    </React.Fragment>
                                                );
                                            }
                                            return (
                                                <Pagination.Item
                                                    key={page}
                                                    active={page === currentPage}
                                                    onClick={() => paginate(page)}
                                                >
                                                    {page}
                                                </Pagination.Item>
                                            );
                                        })}
                                    
                                    <Pagination.Next 
                                        onClick={() => paginate(currentPage + 1)} 
                                        disabled={currentPage === totalPages}
                                    />
                                </Pagination>
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* Transaction Details Modal */}
                {selectedTransaction && (
                    <Modal show={showDetailsModal} onHide={handleCloseDetailsModal} size="lg">
                        <Modal.Header closeButton>
                            <Modal.Title>Transaction Details</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Row className="g-3">
                                <Col md={6}>
                                    <div className="mb-3">
                                        <label className="form-label text-muted mb-1">Order ID</label>
                                        <p className="fw-bold">{selectedTransaction.order_id}</p>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="mb-3">
                                        <label className="form-label text-muted mb-1">Payment ID</label>
                                        <p className="fw-bold">{selectedTransaction.payment_id || 'N/A'}</p>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="mb-3">
                                        <label className="form-label text-muted mb-1">Gateway</label>
                                        <Badge bg="secondary" className="text-uppercase">
                                            {selectedTransaction.gateway}
                                        </Badge>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="mb-3">
                                        <label className="form-label text-muted mb-1">Environment</label>
                                        <Badge bg={getEnvironmentBadge(selectedTransaction.environment)} className="text-uppercase">
                                            {selectedTransaction.environment}
                                        </Badge>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="mb-3">
                                        <label className="form-label text-muted mb-1">Amount</label>
                                        <p className="fw-bold h5">
                                            {selectedTransaction.currency} {parseFloat(selectedTransaction.amount).toFixed(2)}
                                        </p>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="mb-3">
                                        <label className="form-label text-muted mb-1">Status</label>
                                        <Badge bg={getStatusBadge(selectedTransaction.status)} className="text-uppercase">
                                            {selectedTransaction.status}
                                        </Badge>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="mb-3">
                                        <label className="form-label text-muted mb-1">Created At</label>
                                        <p>{new Date(selectedTransaction.created_at).toLocaleString()}</p>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="mb-3">
                                        <label className="form-label text-muted mb-1">Updated At</label>
                                        <p>{new Date(selectedTransaction.updated_at).toLocaleString()}</p>
                                    </div>
                                </Col>
                                {selectedTransaction.additional_info && (
                                    <Col md={12}>
                                        <div className="mb-3">
                                            <label className="form-label text-muted mb-1">Additional Information</label>
                                            <pre className="bg-light p-3 rounded" style={{ fontSize: '12px' }}>
                                                {JSON.stringify(selectedTransaction.additional_info, null, 2)}
                                            </pre>
                                        </div>
                                    </Col>
                                )}
                            </Row>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseDetailsModal}>
                                Close
                            </Button>
                            <Button variant="primary" onClick={handleCloseDetailsModal}>
                                Download Receipt
                            </Button>
                        </Modal.Footer>
                    </Modal>
                )}
            </Container>

            {/* Add some custom styles */}
            <style jsx="true">{`
                .table th {
                    font-weight: 600;
                    font-size: 0.875rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #6c757d;
                    border-top: none;
                }
                
                .table td {
                    vertical-align: middle;
                    padding: 1rem 0.75rem;
                }
                
                .table tbody tr:hover {
                    background-color: rgba(0, 123, 255, 0.05);
                }
                
                .pagination .page-item.active .page-link {
                    background-color: #0d6efd;
                    border-color: #0d6efd;
                }
                
                .card {
                    border: 1px solid #e9ecef;
                }
                
                code {
                    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
                    font-size: 0.85em;
                }
            `}</style>
        </>
    );
};

export default Transactions;
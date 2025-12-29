// Login.js
import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Hardcoded credentials
        const validEmail = 'iiiqbets@gmail.com';
        const validPassword = 'iiiqbets@123';

        // Simple validation
        if (!email || !password) {
            setError('Please enter both email and password');
            setLoading(false);
            return;
        }

        // Check credentials
        if (email === validEmail && password === validPassword) {
            // Store login status in localStorage
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', email);
            
            // Simulate API call delay
            setTimeout(() => {
                setLoading(false);
                navigate('/company-profile');
            }, 500);
        } else {
            setError('Invalid email or password');
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <Row className="w-100 justify-content-center">
                    <Col xs={12} sm={10} md={8} lg={6} xl={5}>
                        <Card className="shadow-lg border-0">
                            <Card.Header className="bg-primary text-white text-center py-4">
                                <h3 className="mb-0">
                                    <i className="fas fa-lock me-2"></i>
                                    iiiQbets Payment Gateway
                                </h3>
                                <p className="mb-0 mt-2">Admin Login</p>
                            </Card.Header>
                            <Card.Body className="p-4">
                                {error && (
                                    <Alert variant="danger" className="text-center">
                                        {error}
                                    </Alert>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email Address</Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="Enter email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={loading}
                                            className="py-2"
                                        />
                                        <Form.Text className="text-muted">
                                            Use: iiiqbets@gmail.com
                                        </Form.Text>
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="Enter password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                            className="py-2"
                                        />
                                        <Form.Text className="text-muted">
                                            Use: iiiqbets@123
                                        </Form.Text>
                                    </Form.Group>

                                    <Button
                                        variant="primary"
                                        type="submit"
                                        className="w-100 py-2 mb-3"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Logging in...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-sign-in-alt me-2"></i>
                                                Login
                                            </>
                                        )}
                                    </Button>

                                </Form>
                            </Card.Body>
                            {/* <Card.Footer className="text-center py-3 bg-light">
                                <small className="text-muted">
                                    &copy; {new Date().getFullYear()} iiiQbets Payment Gateway Plugin
                                </small>
                            </Card.Footer> */}
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Login;
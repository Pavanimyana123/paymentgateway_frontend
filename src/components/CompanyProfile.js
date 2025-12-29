import React, { useState, useEffect } from 'react';
import {
    Container, Card, Form, Button, Row, Col,
    Alert, Image, Spinner, Badge, Modal
} from 'react-bootstrap';
import {
    Building, Envelope, Telephone, GeoAlt,
    Globe, CurrencyExchange, Clock, Save,
    Upload, Trash, CheckCircle, BuildingFill
} from 'react-bootstrap-icons';
import axios from 'axios';
import CustomNavbar from './Navbar';
import BaseURL from './BaseURL';

const CompanyProfile = () => {
    const [profile, setProfile] = useState({
        company_name: '',
        company_email: '',
        company_phone: '',
        company_address: '',
        company_city: '',
        company_state: '',
        company_country: '',
        company_pincode: '',
        company_gst: '',
        company_pan: '',
        company_website: '',
        company_logo: '',
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        environment: 'test',
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [currencies, setCurrencies] = useState([]);
    const [timezones, setTimezones] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Fetch profile data on component mount
    useEffect(() => {
        fetchProfile();
        fetchCurrencies();
        fetchTimezones();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.get(`${BaseURL}/api/company-profile`);

            if (response.data.success) {
                setProfile(response.data.profile);
                if (response.data.profile.company_logo) {
                    setLogoPreview(`${BaseURL}${response.data.profile.company_logo}`);
                }
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Failed to load company profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrencies = async () => {
        try {
            const response = await axios.get(`${BaseURL}/api/currencies`);
            if (response.data.success) {
                setCurrencies(response.data.currencies);
            }
        } catch (err) {
            console.error('Error fetching currencies:', err);
        }
    };

    const fetchTimezones = async () => {
        try {
            const response = await axios.get(`${BaseURL}/api/timezones`);
            if (response.data.success) {
                setTimezones(response.data.timezones);
            }
        } catch (err) {
            console.error('Error fetching timezones:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            const previewUrl = URL.createObjectURL(file);
            setLogoPreview(previewUrl);
        }
    };

    const handleRemoveLogo = () => {
        setLogoFile(null);
        setLogoPreview('');
        setProfile(prev => ({
            ...prev,
            company_logo: ''
        }));
    };

    const handleDeleteLogo = async () => {
        try {
            await axios.delete(`${BaseURL}/api/company-profile/logo`);
            setLogoPreview('');
            setProfile(prev => ({
                ...prev,
                company_logo: ''
            }));
            setShowDeleteModal(false);
            setSuccess('Logo deleted successfully');
        } catch (err) {
            console.error('Error deleting logo:', err);
            setError('Failed to delete logo');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const formData = new FormData();

            // Add all profile fields
            Object.keys(profile).forEach(key => {
                if (key !== 'company_logo') {
                    formData.append(key, profile[key]);
                }
            });

            // Add logo file if selected
            if (logoFile) {
                formData.append('company_logo', logoFile);
            }

            const response = await axios.post(
                `${BaseURL}/api/company-profile`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.success) {
                setSuccess('Company profile updated successfully!');
                setProfile(response.data.profile);

                // Clear file input
                setLogoFile(null);
                const fileInput = document.querySelector('input[type="file"]');
                if (fileInput) fileInput.value = '';

                // Update preview if new logo was uploaded
                if (response.data.profile.company_logo) {
                    setLogoPreview(`${BaseURL}${response.data.profile.company_logo}`);
                }
            }
        } catch (err) {
            console.error('Error saving profile:', err);
            setError(err.response?.data?.message || 'Failed to save company profile');
        } finally {
            setSaving(false);
        }
    };

    const getCurrencySymbol = (currencyCode) => {
        const currency = currencies.find(c => c.code === currencyCode);
        return currency ? currency.symbol : currencyCode;
    };

    if (loading) {
        return (
            <>
                <CustomNavbar />
                <Container className="my-5">
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <h4 className="mt-3">Loading company profile...</h4>
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
                        <h1 className="h3 mb-1">
                            <Building className="me-2" />
                            Company Profile
                        </h1>
                        <p className="text-muted mb-0">Manage your company information and settings</p>
                    </div>
                    <Badge bg="info" className="px-3 py-2">
                        Last updated: {new Date().toLocaleDateString()}
                    </Badge>
                </div>

                {/* Success/Error Messages */}
                {success && (
                    <Alert variant="success" dismissible onClose={() => setSuccess('')}>
                        <CheckCircle className="me-2" />
                        {success}
                    </Alert>
                )}

                {error && (
                    <Alert variant="danger" dismissible onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                <Row>
                    {/* Left Column - Logo & Basic Info */}
                    <Col lg={4} md={12} className="mb-4">
                        <Card className="shadow-sm h-100">
                            <Card.Body className="text-center">
                                {/* Logo Section */}
                                <div className="mb-4">
                                    <div className="position-relative d-inline-block">
                                        {logoPreview ? (
                                            <Image
                                                src={logoPreview}
                                                alt="Company Logo"
                                                roundedCircle
                                                style={{ width: '180px', height: '180px', objectFit: 'cover' }}
                                                className="border border-3 border-primary"
                                            />
                                        ) : (
                                            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center"
                                                style={{ width: '180px', height: '180px' }}>
                                                <BuildingFill size={80} className="text-secondary" />
                                            </div>
                                        )}

                                        {/* Logo Upload Button */}
                                        <div className="mt-3">
                                            <Form.Group>
                                                <Form.Label className="btn btn-outline-primary btn-sm">
                                                    <Upload className="me-2" />
                                                    Change Logo
                                                    <Form.Control
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleLogoChange}
                                                        style={{ display: 'none' }}
                                                    />
                                                </Form.Label>

                                                {(logoPreview || profile.company_logo) && (
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => setShowDeleteModal(true)}
                                                        className="ms-2"
                                                    >
                                                        <Trash className="me-1" />
                                                        Remove
                                                    </Button>
                                                )}
                                            </Form.Group>
                                            <Form.Text className="text-muted d-block">
                                                Recommended: 300x300px, max 5MB
                                            </Form.Text>
                                        </div>
                                    </div>
                                </div>

                                {/* Basic Info Summary */}
                                <div className="text-start">
                                    <h5 className="border-bottom pb-2 mb-3">Quick Info</h5>

                                    <div className="mb-3">
                                        <small className="text-muted d-block">Company Name</small>
                                        <strong>{profile.company_name || 'Not set'}</strong>
                                    </div>

                                    <div className="mb-3">
                                        <small className="text-muted d-block">
                                            <Envelope className="me-1" />
                                            Email
                                        </small>
                                        <strong>{profile.company_email || 'Not set'}</strong>
                                    </div>

                                    <div className="mb-3">
                                        <small className="text-muted d-block">
                                            <Telephone className="me-1" />
                                            Phone
                                        </small>
                                        <strong>{profile.company_phone || 'Not set'}</strong>
                                    </div>

                                    <div className="mb-3">
                                        <small className="text-muted d-block">
                                            <Globe className="me-1" />
                                            Website
                                        </small>
                                        <strong>{profile.company_website || 'Not set'}</strong>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Right Column - Form */}
                    <Col lg={8} md={12}>
                        <Card className="shadow-sm">
                            <Card.Body>
                                <Form onSubmit={handleSubmit}>
                                    <h5 className="border-bottom pb-2 mb-4">Company Details</h5>

                                    <Row>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Company Name *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="company_name"
                                                    value={profile.company_name}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="Enter company name"
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Company Email *</Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    name="company_email"
                                                    value={profile.company_email}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="Enter company email"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Phone Number</Form.Label>
                                                <Form.Control
                                                    type="tel"
                                                    name="company_phone"
                                                    value={profile.company_phone}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter phone number"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>


                                    <Form.Group className="mb-3">
                                        <Form.Label>Address</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            name="company_address"
                                            value={profile.company_address}
                                            onChange={handleInputChange}
                                            placeholder="Enter company address"
                                        />
                                    </Form.Group>

                                    <Row>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>City</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="company_city"
                                                    value={profile.company_city}
                                                    onChange={handleInputChange}
                                                    placeholder="City"
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>State</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="company_state"
                                                    value={profile.company_state}
                                                    onChange={handleInputChange}
                                                    placeholder="State"
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Pincode</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="company_pincode"
                                                    value={profile.company_pincode}
                                                    onChange={handleInputChange}
                                                    placeholder="Pincode"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <h5 className="border-bottom pb-2 mb-4 mt-4">Business Information</h5>

                                    <Row>

                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Website</Form.Label>
                                                <Form.Control
                                                    type="url"
                                                    name="company_website"
                                                    value={profile.company_website}
                                                    onChange={handleInputChange}
                                                    placeholder="https://example.com"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>GST Number</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="company_gst"
                                                    value={profile.company_gst}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter GST number"
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>PAN Number</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="company_pan"
                                                    value={profile.company_pan}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter PAN number"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <h5 className="border-bottom pb-2 mb-4 mt-4">Payment Settings</h5>

                                    <Row>
                                        {/* <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>
                                                    <CurrencyExchange className="me-2" />
                                                    Default Currency
                                                </Form.Label>
                                                <Form.Select
                                                    name="currency"
                                                    value={profile.currency}
                                                    onChange={handleInputChange}
                                                >
                                                    {currencies.map(currency => (
                                                        <option key={currency.code} value={currency.code}>
                                                            {currency.code} - {currency.name} ({currency.symbol})
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                                <Form.Text className="text-muted">
                                                    Selected: {getCurrencySymbol(profile.currency)}
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>

                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>
                                                    <Clock className="me-2" />
                                                    Timezone
                                                </Form.Label>
                                                <Form.Select
                                                    name="timezone"
                                                    value={profile.timezone}
                                                    onChange={handleInputChange}
                                                >
                                                    {timezones.map(tz => (
                                                        <option key={tz} value={tz}>
                                                            {tz}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col> */}

                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>
                                                    Environment
                                                </Form.Label>

                                                <Form.Select
                                                    name="environment"
                                                    value={profile.environment}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="test">Test</option>
                                                    <option value="live">Live</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>

                                    </Row>

                                    <div className="d-flex justify-content-end mt-2 pt-3">
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            disabled={saving}
                                            className="px-4"
                                        >
                                            {saving ? (
                                                <>
                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="me-2" />
                                                    Save Changes
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Delete Logo Confirmation Modal */}
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Remove Company Logo</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Are you sure you want to remove the company logo?</p>
                        <p className="text-muted small">This action cannot be undone.</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDeleteLogo}>
                            <Trash className="me-2" />
                            Remove Logo
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>

            {/* Add custom styles */}
            <style jsx="true">{`
                .form-label {
                    font-weight: 600;
                    color: #495057;
                }
                
                .card {
                    border: 1px solid #e9ecef;
                }
                
                .border-primary {
                    border-color: #0d6efd !important;
                }
                
                .btn-outline-primary:hover {
                    background-color: #0d6efd;
                    color: white;
                }
                
                input[type="file"] {
                    cursor: pointer;
                }
                
                .company-logo-preview {
                    border: 3px dashed #dee2e6;
                    transition: all 0.3s ease;
                }
                
                .company-logo-preview:hover {
                    border-color: #0d6efd;
                }
            `}</style>
        </>
    );
};

export default CompanyProfile;
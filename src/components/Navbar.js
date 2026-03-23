import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Offcanvas, Dropdown } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import desktopLogo from './logohrms.png'; // Desktop logo
import mobileLogo from './logo.png'; // Mobile logo

const CustomNavbar = () => {
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const email = localStorage.getItem('userEmail') || '';
        setIsLoggedIn(loggedIn);
        setUserEmail(email);
    }, [location]);

    const handleClose = () => setShowOffcanvas(false);
    const handleShow = () => setShowOffcanvas(true);

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        setIsLoggedIn(false);
        setUserEmail('');
        navigate('/login');
    };

    const navItems = [
        { name: 'Company Profile', path: '/company-profile' },
        { name: 'Payment Gateway', path: '/payment-form' },
        { name: 'Transactions', path: '/transactions' },
        { name: 'Instructions', path: '/instructions' },
        { name: 'Split Button', path: '/splitbutton' },
        { name: 'Split Payouts', path: '/splitpayouts' }
    ];

    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    if (!isLoggedIn && location.pathname !== '/') {
        navigate('/');
        return null;
    }

    return (
        <>
            {isLoggedIn && (
                <Navbar variant="dark" expand="lg" className="shadow-sm fixed-top py-2" 
                        style={{ backgroundColor: 'rgb(24, 37, 102)' }}>
                    <Container fluid className="px-3">
                        <div className="d-flex justify-content-between align-items-center w-100">
                            {/* Logo and Brand - Different logos for mobile/desktop */}
                            <Navbar.Brand as={Link} to="/" className="d-flex align-items-center p-0 me-2">
                                {/* Desktop Logo (hidden on mobile) */}
                                <img
                                    src={desktopLogo}
                                    alt="iiiQbets Logo"
                                    className="d-none d-lg-block me-2"
                                    style={{ 
                                        width: '100%',
                                        height: '50px',
                                        objectFit: 'contain',
                                    }}
                                />
                                {/* Mobile Logo (hidden on desktop) */}
                                <img
                                    src={mobileLogo}
                                    alt="iiiQbets Logo"
                                    className="d-lg-none me-2"
                                    style={{ 
                                        width: '40px',
                                        height: '40px',
                                        objectFit: 'contain',
                                    }}
                                />
                                <span className="fw-bold ms-2 d-none d-sm-inline" style={{ fontSize: '1rem' }}>
                                    iiiQbets Payment Gateway Plugin
                                </span>
                                <span className="fw-bold ms-2 d-sm-none" style={{ fontSize: '0.9rem' }}>
                                    iiiQbets PG Plugin
                                </span>
                            </Navbar.Brand>

                            {/* Desktop Navigation and User Dropdown */}
                            <div className="d-none d-lg-flex align-items-center">
                                <Nav className="me-3">
                                    {navItems.map((item) => (
                                        <Nav.Link
                                            key={item.name}
                                            as={Link}
                                            to={item.path}
                                            className={`mx-1 px-2 ${isActive(item.path) ? 'active bg-primary rounded' : ''}`}
                                            style={{ fontSize: '0.9rem' }}
                                        >
                                            {item.name}
                                        </Nav.Link>
                                    ))}
                                </Nav>
                                
                                <Dropdown align="end">
                                    <Dropdown.Toggle 
                                        variant="outline-light" 
                                        id="dropdown-user"
                                        className="d-flex align-items-center py-1 px-2"
                                        style={{ fontSize: '0.9rem' }}
                                    >
                                        <i className="fas fa-user-circle me-1"></i>
                                        <span>{userEmail.split('@')[0]}</span>
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Header>
                                            <small>Logged in as</small>
                                            <div className="fw-bold" style={{ fontSize: '0.85rem' }}>{userEmail}</div>
                                        </Dropdown.Header>
                                        <Dropdown.Divider />
                                        {/* RED LOGOUT IN DESKTOP DROPDOWN */}
                                        <Dropdown.Item 
                                            onClick={handleLogout} 
                                            className="text-danger fw-bold d-flex align-items-center"
                                            style={{ fontSize: '0.9rem' }}
                                        >
                                            <i className="fas fa-sign-out-alt me-2"></i>
                                            Logout
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>

                            {/* Mobile Toggle Button */}
                            <Button
                                variant="outline-light"
                                onClick={handleShow}
                                className="d-lg-none p-1"
                                style={{ width: '40px', height: '40px' }}
                                aria-controls="offcanvasNavbar"
                                aria-label="Toggle navigation"
                            >
                                <span className="navbar-toggler-icon"></span>
                            </Button>
                        </div>
                    </Container>

                    {/* Mobile Offcanvas Navigation */}
                    <Offcanvas
                        show={showOffcanvas}
                        onHide={handleClose}
                        placement="end"
                    >
                        <Offcanvas.Header closeButton className="pb-2">
                            <Offcanvas.Title className="fw-bold d-flex align-items-center">
                                <img
                                    src={mobileLogo} // Using mobile logo in offcanvas
                                    alt="iiiQbets Logo"
                                    style={{ 
                                        width: '35px',
                                        height: '35px',
                                        objectFit: 'contain',
                                        marginRight: '10px'
                                    }}
                                />
                                <div>
                                    <div style={{ fontSize: '1rem' }}>iiiQbets PG Plugin</div>
                                    <small className="text-muted" style={{ fontSize: '0.8rem' }}>Admin Panel</small>
                                </div>
                            </Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body className="p-3">
                            {/* Mobile User Info */}
                            <div className="mb-4 p-3 bg-light rounded">
                                <div className="d-flex align-items-center">
                                    <i className="fas fa-user-circle fa-2x me-3 text-primary"></i>
                                    <div>
                                        <div className="fw-bold text-dark">{userEmail}</div>
                                        <small className="text-muted">Administrator</small>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Navigation */}
                            <Nav className="flex-column">
                                {navItems.map((item) => (
                                    <Nav.Link
                                        key={item.name}
                                        as={Link}
                                        to={item.path}
                                        className={`py-3 d-flex align-items-center ${isActive(item.path) ? 'text-primary fw-bold' : 'text-dark'}`}
                                        onClick={handleClose}
                                    >
                                        <i className={`fas fa-${getIconForPage(item.name)} me-3 ${isActive(item.path) ? 'text-primary' : 'text-secondary'}`}></i>
                                        {item.name}
                                    </Nav.Link>
                                ))}
                            </Nav>

                            {/* RED LOGOUT BUTTON IN MOBILE */}
                            <div className="mt-4 pt-3 border-top">
                                <Button 
                                    variant="danger" 
                                    className="w-100 py-2 d-flex align-items-center justify-content-center"
                                    onClick={() => {
                                        handleLogout();
                                        handleClose();
                                    }}
                                >
                                    <i className="fas fa-sign-out-alt me-2"></i>
                                    Logout
                                </Button>
                            </div>
                        </Offcanvas.Body>
                    </Offcanvas>
                </Navbar>
            )}
            
            {/* Add padding to body to account for fixed navbar */}
            {isLoggedIn && <div style={{ paddingTop: '60px' }}></div>}
        </>
    );
};

// Helper function for mobile icons
const getIconForPage = (pageName) => {
    switch(pageName) {
        case 'Company Profile':
            return 'building';
        case 'Payment Gateway':
            return 'credit-card';
        case 'Transactions':
            return 'history';
        case 'Instructions':
            return 'book';
        default:
            return 'circle';
    }
};

export default CustomNavbar;
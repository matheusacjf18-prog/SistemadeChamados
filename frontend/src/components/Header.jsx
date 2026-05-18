import { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    const [isNavCollapsed, setIsNavCollapsed] = useState(true);

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
            <div className="container">
                <Link className="navbar-brand" to="/">
                    <img 
                        src="/assets/images/RMLogo.png" 
                        alt="RM Technologies Logo" 
                        style={{ maxHeight: '50px' }} 
                    />
                </Link>
                <button className="navbar-toggler" type="button" onClick={() => setIsNavCollapsed(!isNavCollapsed)} aria-controls="navbarNav" aria-expanded={!isNavCollapsed} aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse justify-content-end`} id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <Link className="btn btn-primary px-4 fw-semibold" to="/login">Acessar Sistema</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Header;
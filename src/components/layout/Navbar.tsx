import { useState } from "react";
import "./Navbar.scss";
import logo from "../../assets/Logo.png";

export const Navbar = () => {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);

    return (
        <nav className={`navbar-container ${isMobileSearchActive ? 'mobile-search-open' : ''}`}>
            <div className="navbar-brand">
                <img className="navbar-logo" src={logo} alt="Logo de la aplicación" />
                <span className="navbar-title">Dashboard</span>
            </div>

            <div className="navbar-search">
                <div className="search-wrapper">
                    <button 
                        className="mobile-back-button"
                        onClick={() => setIsMobileSearchActive(false)}
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <span className="material-symbols-outlined search-icon">search</span>
                    <input
                        type="text"
                        className="search-input"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search books..."
                    />
                    {loading && <span className="search-status">...</span>}
                    {error && <span className="search-status error-status">Error</span>}
                </div>
            </div>

            <div className="navbar-actions">
                <button 
                    className="action-button mobile-search-trigger"
                    onClick={() => setIsMobileSearchActive(true)}
                >
                    <span className="material-symbols-outlined">search</span>
                </button>
                <button className="action-button">
                    <span className="material-symbols-outlined">notifications</span>
                </button>
                <div className="navbar-user">
                    <div className="avatar-placeholder">
                        <span className="material-symbols-outlined">person</span>
                    </div>
                    <span className="navbar-username">{localStorage.getItem('username') || 'Usuario'}</span>
                </div>
            </div>
        </nav>
    );
};
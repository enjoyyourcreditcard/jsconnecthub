import React from 'react';
import { Link } from 'react-router-dom';

function Header({ title }) {
    return (
        <header style={{ padding: '10px', background: '#f0f0f0' }}>
            <h1>{title || 'My App'}</h1>
            <nav>
                <Link to="/">Home</Link> | <Link to="/about">About</Link>
            </nav>
        </header>
    );
}

export default Header;

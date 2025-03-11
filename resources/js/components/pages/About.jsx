import React from 'react';
import Header from '../shared/layout/Header';

function About() {
    return (
        <div>
            <Header title="About This App" />
            <main style={{ padding: '20px' }}>
                <h2>Halo, Asad!</h2>
                <p>
                    This is the About page for your Laravel 11 + React app.
                    Built with Vite for speed and awesomeness.
                    You’re a software engineer who’s lazy but smart—hope this saves you some time!
                </p>
            </main>
        </div>
    );
}

export default About;

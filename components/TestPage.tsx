import React, { useState, useEffect } from 'react';

const SERVER_URL = 'http://localhost:11451';

const TestPage = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${SERVER_URL}/auth/hello`, {
            method: 'GET',
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                return response.json();
            })
            .then(data => {
                setData(data);
            })
            .catch(error => {
                setError(error.message);
            });
    }, []);

    return (
        <div>
            <h1>API Test Page</h1>
            {error && <p>Error: {error}</p>}
            {data ? (
                <div>
                    <p>User ID: {data.userId}</p>
                    <p>User Name: {data.userName}</p>
                    <p>Auth: {data.auth}</p>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default TestPage;
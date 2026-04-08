const axios = require('axios');

async function test() {
    try {
        // Need to login to get a token
        const login = await axios.post('http://localhost:8888/api/auth/login', {
            email: 'admin@example.com', // Replace with a valid user if known, or guest? Wait, I don't know the password
            password: 'password123'
        });
        const token = login.data.token;
        console.log("Got token!", token);
    } catch (e) {
        console.error("Login failed:", e.response?.data || e.message);
    }
}
test();

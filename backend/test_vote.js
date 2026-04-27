async function test() {
    try {
        const FormData = require('form-data');
        const form = new FormData();
        form.append('rating', 5);
        form.append('comment', 'This is a test');

        const jwt = require('jsonwebtoken');
        const env = require('./src/config/env');
        const token = jwt.sign({ id: 1, role: 'user', full_name: 'Test', email: 'test@test.com' }, env.jwt.secret, { expiresIn: '1h' });

        const requestOptions = {
            method: 'POST',
            body: form,
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        const res = await fetch('http://localhost:8888/api/tours/1/votes', requestOptions);
        const data = await res.json();
        console.log('STATUS:', res.status);
        console.log('RESPONSE:', data);
    } catch (err) {
        console.error('ERROR RESPONSE:', err.message);
    }
}
test();

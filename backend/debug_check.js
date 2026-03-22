require('dotenv').config();
const mariadb = require('mariadb');

(async () => {
    let conn;
    try {
        conn = await mariadb.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });
        
        const users = await conn.query('SELECT id, full_name, email, role_id FROM users ORDER BY id');
        console.log('=== ALL USERS ===');
        for (const u of users) {
            if (u.id) console.log(`ID:${u.id} | name:${u.full_name} | email:${u.email} | role_id:${u.role_id}`);
        }

        const bookings = await conn.query('SELECT id, user_id, booking_code, customer_name, customer_email, customer_phone, status FROM bookings ORDER BY id');
        console.log('\n=== ALL BOOKINGS ===');
        for (const b of bookings) {
            if (b.id) console.log(`ID:${b.id} | user_id:${b.user_id} | code:${b.booking_code} | name:${b.customer_name} | email:${b.customer_email} | phone:${b.customer_phone} | status:${b.status}`);
        }
        
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        if (conn) await conn.end();
    }
})();

const mysql = require('mysql2/promise');
async function fix() {
    const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Tuyenminh',
        database: 'db_marketing_tour'
    });
    
    // Fix bookings
    let [res] = await conn.execute("UPDATE bookings SET user_id = 7 WHERE customer_name = 'minhtuyen' AND user_id IS NULL");
    console.log(`Updated ${res.affectedRows} bookings`);

    // Fix votes (reviews)
    [res] = await conn.execute("UPDATE votes SET user_id = 7 WHERE customer_name = 'minhtuyen' AND user_id IS NULL");
    console.log(`Updated ${res.affectedRows} votes`);
    
    await conn.end();
}
fix().catch(console.error);

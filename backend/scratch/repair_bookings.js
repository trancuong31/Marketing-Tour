const mysql = require('mysql2/promise');
async function fix() {
    const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Tuyenminh',
        database: 'db_marketing_tour'
    });
    
    // Tìm tất cả booking của minhtuyen chưa có user_id và gán cho ID 7
    const [result] = await conn.execute("UPDATE bookings SET user_id = 7 WHERE customer_name = 'minhtuyen' AND user_id IS NULL");
    
    console.log(`Updated ${result.affectedRows} bookings for minhtuyen`);
    await conn.end();
}
fix().catch(console.error);

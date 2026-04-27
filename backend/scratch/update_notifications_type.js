const mysql = require('mysql2/promise');
async function fix() {
    const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Tuyenminh',
        database: 'db_marketing_tour'
    });
    
    await conn.execute("ALTER TABLE notifications MODIFY COLUMN type ENUM('like', 'reply', 'booking') NOT NULL");
    
    console.log('Updated notifications type');
    await conn.end();
}
fix().catch(console.error);

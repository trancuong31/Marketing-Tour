const mysql = require('mysql2/promise');
async function fix() {
    const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Tuyenminh',
        database: 'db_marketing_tour'
    });
    
    await conn.execute(`
        CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            type ENUM('like', 'reply') NOT NULL,
            sender_name VARCHAR(150),
            message TEXT,
            related_id INT,
            is_read TINYINT DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    console.log('Created notifications table');
    await conn.end();
}
fix().catch(console.error);

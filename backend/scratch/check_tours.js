const mysql = require('mysql2/promise');
async function test() {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Tuyenminh',
            database: 'db_marketing_tour'
        });
        const [rows] = await conn.execute('SELECT id, slug, title FROM tours');
        console.log(JSON.stringify(rows, null, 2));
        await conn.end();
    } catch (err) {
        console.error(err);
    }
}
test();

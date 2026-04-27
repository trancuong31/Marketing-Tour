const { sequelize } = require('./src/config/database');
const { Vote, Tour } = require('./src/models');

async function testVotes() {
    try {
        const { count, rows } = await Vote.findAndCountAll({
            include: [{ model: Tour, attributes: ['id', 'title', 'slug'] }],
            limit: 10,
        });
        console.log('Query successful, found records:', count);
    } catch (err) {
        console.error('Test failed:', err);
    } finally {
        process.exit(0);
    }
}

testVotes();

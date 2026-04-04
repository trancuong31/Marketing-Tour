require('dotenv').config({ path: './backend/.env' });
const { Vote, Tour } = require('./backend/src/models');
const { sequelize } = require('./backend/src/config/database');

async function test() {
    try {
        const topTours = await Vote.findAll({
            where: {},
            attributes: [
                'tour_id',
                [sequelize.fn('AVG', sequelize.col('Vote.rating')), 'avgRating'],
                [sequelize.fn('COUNT', sequelize.col('Vote.id')), 'reviewCount']
            ],
            include: [{ model: Tour, attributes: ['id', 'title'] }],
            group: ['tour_id', 'Tour.id', 'Tour.title'],
            order: [[sequelize.literal('avgRating'), 'DESC'], [sequelize.literal('reviewCount'), 'DESC']],
            limit: 5
        });
        console.log("Success", topTours);
    } catch (e) {
        console.error("Error!!!", e.message, e.sql);
    }
}
test();

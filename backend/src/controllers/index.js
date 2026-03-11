const { categoryController } = require('./categoryController');
const { tourController } = require('./tourController');
const { bookingController } = require('./bookingController');
const { voteController } = require('./voteController');
const { guideController } = require('./guideController');
const { adminController } = require('./adminController');
const authController = require('./authController');

module.exports = {
    categoryController,
    tourController,
    bookingController,
    voteController,
    guideController,
    adminController,
    authController,
};

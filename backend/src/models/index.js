const Role = require('./Role');
const User = require('./User');
const Category = require('./Category');
const Tour = require('./Tour');
const TourImage = require('./TourImage');
const Booking = require('./Booking');
const Guide = require('./Guide');
const Vote = require('./Vote');

// ── Associations ──

// User ↔ Role
Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

// Tour ↔ Category
Category.hasMany(Tour, { foreignKey: 'category_id' });
Tour.belongsTo(Category, { foreignKey: 'category_id' });

// Tour ↔ TourImage
Tour.hasMany(TourImage, { foreignKey: 'tour_id', as: 'images', onDelete: 'CASCADE' });
TourImage.belongsTo(Tour, { foreignKey: 'tour_id' });

// Tour ↔ Booking
Tour.hasMany(Booking, { foreignKey: 'tour_id' });
Booking.belongsTo(Tour, { foreignKey: 'tour_id' });

// User ↔ Booking (nullable)
User.hasMany(Booking, { foreignKey: 'user_id' });
Booking.belongsTo(User, { foreignKey: 'user_id' });

// Tour ↔ Vote
Tour.hasMany(Vote, { foreignKey: 'tour_id', as: 'votes' });
Vote.belongsTo(Tour, { foreignKey: 'tour_id' });

module.exports = {
    Role,
    User,
    Category,
    Tour,
    TourImage,
    Booking,
    Guide,
    Vote,
};

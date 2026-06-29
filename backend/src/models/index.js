const Role = require('./Role');
const User = require('./User');
const Category = require('./Category');
const Tour = require('./Tour');
const TourImage = require('./TourImage');
const TourItinerary = require('./TourItinerary');
const TourDeparture = require('./TourDeparture');
const TourPickupLocation = require('./TourPickupLocation');
const TourOption = require('./TourOption');
const Booking = require('./Booking');
const BookingOption = require('./BookingOption');
const Guide = require('./Guide');
const Vote = require('./Vote');
const VoteLike = require('./VoteLike');
const Notification = require('./Notification');
const Otp = require('./Otp');
const Banner = require('./Banner');
const TourTranslation = require('./TourTranslation');
const TourItineraryTranslation = require('./TourItineraryTranslation');
const CategoryTranslation = require('./CategoryTranslation');
const GuideTranslation = require('./GuideTranslation');

// ── Associations ──

// User ↔ Role
Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

// Tour ↔ Category
Category.hasMany(Tour, { foreignKey: 'category_id' });
Tour.belongsTo(Category, { foreignKey: 'category_id' });

// Category ↔ CategoryTranslation
Category.hasMany(CategoryTranslation, { foreignKey: 'category_id', as: 'translations', onDelete: 'CASCADE' });
CategoryTranslation.belongsTo(Category, { foreignKey: 'category_id' });

// Tour ↔ TourImage
Tour.hasMany(TourImage, { foreignKey: 'tour_id', as: 'images', onDelete: 'CASCADE' });
TourImage.belongsTo(Tour, { foreignKey: 'tour_id' });

// Tour ↔ TourTranslation
Tour.hasMany(TourTranslation, { foreignKey: 'tour_id', as: 'translations', onDelete: 'CASCADE' });
TourTranslation.belongsTo(Tour, { foreignKey: 'tour_id' });

// Tour ↔ TourItinerary
Tour.hasMany(TourItinerary, { foreignKey: 'tour_id', as: 'itineraries', onDelete: 'CASCADE' });
TourItinerary.belongsTo(Tour, { foreignKey: 'tour_id' });

// TourItinerary ↔ TourItineraryTranslation
TourItinerary.hasMany(TourItineraryTranslation, { foreignKey: 'itinerary_id', as: 'translations', onDelete: 'CASCADE' });
TourItineraryTranslation.belongsTo(TourItinerary, { foreignKey: 'itinerary_id' });

// Tour ↔ TourDeparture
Tour.hasMany(TourDeparture, { foreignKey: 'tour_id', as: 'departures', onDelete: 'CASCADE' });
TourDeparture.belongsTo(Tour, { foreignKey: 'tour_id' });

// Tour ↔ TourPickupLocation
Tour.hasMany(TourPickupLocation, { foreignKey: 'tour_id', as: 'pickupLocations', onDelete: 'CASCADE' });
TourPickupLocation.belongsTo(Tour, { foreignKey: 'tour_id' });

// Tour ↔ TourOption
Tour.hasMany(TourOption, { foreignKey: 'tour_id', as: 'options', onDelete: 'CASCADE' });
TourOption.belongsTo(Tour, { foreignKey: 'tour_id' });

// Tour ↔ Booking
Tour.hasMany(Booking, { foreignKey: 'tour_id', as: 'bookings' });
Booking.belongsTo(Tour, { foreignKey: 'tour_id' });

// User ↔ Booking (nullable)
User.hasMany(Booking, { foreignKey: 'user_id' });
Booking.belongsTo(User, { foreignKey: 'user_id' });

// Booking ↔ TourDeparture
TourDeparture.hasMany(Booking, { foreignKey: 'departure_id' });
Booking.belongsTo(TourDeparture, { foreignKey: 'departure_id', as: 'departure' });

// Booking ↔ TourPickupLocation
TourPickupLocation.hasMany(Booking, { foreignKey: 'pickup_location_id' });
Booking.belongsTo(TourPickupLocation, { foreignKey: 'pickup_location_id', as: 'pickupLocation' });

// Booking ↔ BookingOption
Booking.hasMany(BookingOption, { foreignKey: 'booking_id', as: 'bookingOptions', onDelete: 'CASCADE' });
BookingOption.belongsTo(Booking, { foreignKey: 'booking_id' });

// User ↔ Notification
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

// Tour ↔ Vote
Tour.hasMany(Vote, { foreignKey: 'tour_id', as: 'votes' });
Vote.belongsTo(Tour, { foreignKey: 'tour_id' });

// Vote ↔ Vote (Self-association for replies)
Vote.hasMany(Vote, { foreignKey: 'parent_id', as: 'replies', onDelete: 'CASCADE' });
Vote.belongsTo(Vote, { foreignKey: 'parent_id', as: 'parent' });

// Vote ↔ VoteLike
Vote.hasMany(VoteLike, { foreignKey: 'vote_id', as: 'userLikes' });
VoteLike.belongsTo(Vote, { foreignKey: 'vote_id' });

// User ↔ VoteLike
User.hasMany(VoteLike, { foreignKey: 'user_id' });
VoteLike.belongsTo(User, { foreignKey: 'user_id' });

// Guide ↔ GuideTranslation
Guide.hasMany(GuideTranslation, { foreignKey: 'guide_id', as: 'translations', onDelete: 'CASCADE' });
GuideTranslation.belongsTo(Guide, { foreignKey: 'guide_id' });

module.exports = {
    Role,
    User,
    Category,
    Tour,
    TourImage,
    TourItinerary,
    TourDeparture,
    TourPickupLocation,
    TourOption,
    Booking,
    BookingOption,
    Guide,
    Vote,
    VoteLike,
    Notification,
    Otp,
    Banner,
    TourTranslation,
    TourItineraryTranslation,
    CategoryTranslation,
    GuideTranslation,
};

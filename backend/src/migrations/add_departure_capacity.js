/**
 * Adds an immutable total capacity for each departure and preserves the
 * existing available_seats value as the initial capacity for legacy rows.
 * Run: node src/migrations/add_departure_capacity.js
 */
require('../config/env');
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const logger = require('../config/logger');

const run = async () => {
  try {
    await sequelize.authenticate();
    const queryInterface = sequelize.getQueryInterface();
    const columns = await queryInterface.describeTable('tour_departures');

    if (!columns.capacity) {
      await queryInterface.addColumn('tour_departures', 'capacity', {
        type: DataTypes.INTEGER,
        allowNull: true,
        after: 'price_infant',
      });
    }

    await sequelize.query(`
            UPDATE tour_departures AS departure
            LEFT JOIN (
                SELECT
                    departure_id,
                    SUM(adult_qty + child_qty + infant_qty) AS reserved_seats
                FROM bookings
                WHERE status IN ('pending', 'approved')
                GROUP BY departure_id
            ) AS booking_totals ON booking_totals.departure_id = departure.id
            SET departure.capacity = departure.available_seats + COALESCE(booking_totals.reserved_seats, 0)
            WHERE departure.capacity IS NULL
        `);

    await queryInterface.changeColumn('tour_departures', 'capacity', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    logger.info('Departure capacity migration completed.');
    process.exitCode = 0;
  } catch (error) {
    logger.error('Departure capacity migration failed:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

run();

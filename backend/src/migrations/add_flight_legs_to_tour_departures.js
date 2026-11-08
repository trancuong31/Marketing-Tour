/**
 * Migration: Add flight_outbound and flight_inbound columns to tour_departures table
 * Run: node src/migrations/add_flight_legs_to_tour_departures.js
 */
require('../config/env');
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const logger = require('../config/logger');

const migrate = async () => {
  try {
    await sequelize.authenticate();
    const queryInterface = sequelize.getQueryInterface();
    const columns = await queryInterface.describeTable('tour_departures');

    if (!columns.flight_outbound) {
      await queryInterface.addColumn('tour_departures', 'flight_outbound', {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Thông tin chuyến bay chặng đi',
      });
      logger.info('Added column "flight_outbound" to tour_departures.');
    } else {
      logger.info('Column "flight_outbound" already exists.');
    }

    if (!columns.flight_inbound) {
      await queryInterface.addColumn('tour_departures', 'flight_inbound', {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Thông tin chuyến bay chặng về',
      });
      logger.info('Added column "flight_inbound" to tour_departures.');
    } else {
      logger.info('Column "flight_inbound" already exists.');
    }

    process.exitCode = 0;
  } catch (error) {
    logger.error('Migration add_flight_legs_to_tour_departures failed:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

migrate();


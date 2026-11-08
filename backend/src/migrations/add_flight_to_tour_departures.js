/**
 * Migration: Add flight column to tour_departures table
 * Run: node src/migrations/add_flight_to_tour_departures.js
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

    if (!columns.flight) {
      await queryInterface.addColumn('tour_departures', 'flight', {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Chặng bay / thông tin chuyến bay',
      });
      logger.info('Added column "flight" to tour_departures table.');
    } else {
      logger.info('Column "flight" already exists on tour_departures.');
    }

    process.exitCode = 0;
  } catch (error) {
    logger.error('Migration add_flight_to_tour_departures failed:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

migrate();


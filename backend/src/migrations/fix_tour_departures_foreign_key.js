/**
 * Migration: Fix foreign key constraint tour_d on tour_departures to ON DELETE CASCADE
 * Run: node src/migrations/fix_tour_departures_foreign_key.js
 */
require('../config/env');
const { sequelize } = require('../config/database');
const logger = require('../config/logger');

const run = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Connected to database.');

    // Drop existing constraint tour_d if exists
    try {
      await sequelize.query('ALTER TABLE `tour_departures` DROP FOREIGN KEY `tour_d`;');
      logger.info('Dropped old tour_d foreign key constraint.');
    } catch (err) {
      logger.warn(`Could not drop tour_d (might have another name or not exist): ${err.message}`);
    }

    // Add constraint with ON DELETE CASCADE ON UPDATE CASCADE
    await sequelize.query(`
      ALTER TABLE ` + '`tour_departures`' + `
      ADD CONSTRAINT ` + '`tour_d`' + `
      FOREIGN KEY (` + '`tour_id`' + `) REFERENCES ` + '`tours`' + ` (` + '`id`' + `)
      ON DELETE CASCADE
      ON UPDATE CASCADE;
    `);
    logger.info('Added tour_d foreign key constraint with ON DELETE CASCADE ON UPDATE CASCADE.');

    logger.info('Migration successful.');
    process.exitCode = 0;
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

run();

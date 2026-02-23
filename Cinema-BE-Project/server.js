require('dotenv').config();
const app = require('./src/app');
const { sequelize } = require('./src/config/database');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Authenticate with the database
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync models (optional: use { force: true } to drop & recreate tables - careful in production!)
    // await sequelize.sync(); 
    // console.log('Database synced.');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

startServer();

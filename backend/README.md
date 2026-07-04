# EnviroMonitor Backend API

Backend API for the EnviroMonitor environmental monitoring system.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MariaDB with Sequelize ORM
- **Authentication**: JWT
- **Validation**: Joi
- **Logging**: Winston

## Getting Started

### Prerequisites

- Node.js 18+
- MariaDB 10.11+
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repo-url>
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your database credentials
```

### Database Setup

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE enviromonitor;"

# Run migrations (if using Sequelize CLI)
npx sequelize-cli db:migrate
```

### Running the Server

```bash
# Development
npm run dev

# Production
npm start
```

### Using Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## API Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── middlewares/    # Express middlewares
├── models/         # Sequelize models
├── repositories/   # Data access layer
├── routes/         # API routes
├── services/       # Business logic
├── utils/          # Helper functions
├── validations/    # Joi schemas
├── constants/      # Constants & enums
├── jobs/           # Background jobs
├── app.js          # Express app setup
└── server.js       # Server entry point
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with hot reload |
| `npm test` | Run tests with coverage |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## License

MIT

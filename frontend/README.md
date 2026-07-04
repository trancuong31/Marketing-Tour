# EnviroMonitor Frontend

React frontend for the EnviroMonitor environmental monitoring system.

## Tech Stack

- **Framework**: React 18 + Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Styling**: CSS with CSS Variables
- **Testing**: Vitest + MSW

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd frontend
npm install
cp .env.example .env
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/         # Shared components
│   ├── layout/        # Layout components
│   └── ui/            # UI components
├── features/          # Feature modules
│   ├── auth/          # Authentication
│   ├── dashboard/     # Dashboard
│   └── home/          # Home page
├── hooks/             # Shared hooks
├── routes/            # Routing config
├── services/          # API services
├── store/             # Global state
├── tests/             # Test setup
└── types/             # TypeScript types
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |

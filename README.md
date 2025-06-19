# Portugal Golf Trip 2025 - Golf Management System

A comprehensive golf trip management application built for the Portugal Golf Trip 2025. The system provides real-time scoring, fines tracking, activity voting, and course information management with tournament-style matchplay functionality.

## Features

- **Real-time Scoring**: Live scorecard with hole-by-hole score entry
- **Matchplay System**: Betterball Stableford format with team vs team competition
- **Player Management**: Team assignments, handicaps, and profile management
- **Course Information**: Detailed hole layouts with par and handicap data
- **Leaderboards**: Individual and team standings with Stableford calculations
- **Fines Tracking**: Penalty system with per-player per-day tracking
- **Activity Voting**: Group decision system for Friday activities

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Shadcn/UI components with Radix UI primitives
- **Styling**: Tailwind CSS with custom golf-themed variables
- **State Management**: TanStack React Query for server state
- **Build Tool**: Vite for fast development and optimized builds

### Backend
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: Express sessions with PostgreSQL store

### Database
- **Primary Database**: PostgreSQL (configurable via DATABASE_URL)
- **ORM**: Drizzle ORM with schema-first approach
- **Migrations**: Drizzle Kit for database migrations

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- npm or yarn

### Environment Setup

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
3. Configure your `.env` file with the required variables (see Environment Variables section)

### Installation

```bash
# Install dependencies
npm install

# Run database migrations
npm run db:push

# Start development server (runs both frontend and backend)
npm run dev
```

The application will be available at `http://localhost:5000`

## Environment Variables

Required environment variables:

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/golf_trip

# Database Connection Details (automatically set by Replit)
PGHOST=localhost
PGPORT=5432
PGUSER=your_user
PGPASSWORD=your_password
PGDATABASE=golf_trip

# Development Environment
NODE_ENV=development
```

## Database Setup

### Running Migrations
```bash
# Apply schema changes to database
npm run db:push

# Generate migrations (if schema changes)
npm run db:generate
```

### Sample Data
The application includes sample data initialization that runs automatically on first startup. This includes:
- 8 players organized into 2 teams
- Course data for NAU Morgado, Pine Cliffs, and Vila Sol
- Pre-configured matchplay fourballs

## Development

### Available Scripts

```bash
# Development server (frontend + backend)
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Database operations
npm run db:push        # Apply schema changes
npm run db:generate    # Generate migrations
npm run db:studio      # Open Drizzle Studio
```

### Project Structure

```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Route components
│   │   ├── lib/         # Utilities and data
│   │   └── hooks/       # Custom React hooks
├── server/              # Express backend
│   ├── routes.ts        # API endpoints
│   ├── storage.ts       # Database abstraction
│   ├── db.ts           # Database connection
│   └── index.ts        # Server entry point
├── shared/              # Shared types and schemas
│   └── schema.ts        # Drizzle database schema
└── dist/               # Production build output
```

### API Endpoints

#### Players
- `GET /api/players` - Get all players
- `POST /api/players` - Create new player
- `PUT /api/players/:id` - Update player
- `DELETE /api/players/:id` - Delete player

#### Scoring
- `GET /api/scores/all` - Get all scores
- `GET /api/scores/:roundId` - Get scores for specific round
- `POST /api/scores` - Create/update score
- `POST /api/rounds/:id/clear` - Clear all scores for round

#### Matchplay
- `GET /api/matches` - Get all matches
- `POST /api/matches` - Create new match
- `PUT /api/matches/:id` - Update match

#### Teams
- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create new team
- `PUT /api/teams/:id` - Update team

## Deployment

### Production Build
```bash
# Build both frontend and backend
npm run build

# Start production server
npm start
```

### Replit Deployment
The application is configured for Replit deployment with:
- Automatic environment variable management
- PostgreSQL database provisioning
- Autoscale deployment configuration

### Docker (Optional)
```bash
# Build and run with Docker Compose
docker-compose up --build

# Run database migrations in container
docker-compose exec app npm run db:push
```

## Key Components

### Core Entities
- **Players**: Golf trip participants with handicaps and team assignments
- **Teams**: 4-player teams with captains for matchplay competition
- **Rounds**: Golf rounds with course and date information
- **Scores**: Individual hole scores with additional tracking (3-putt, water, etc.)
- **Matches**: Fourball matchplay pairings with betterball scoring
- **Fines**: Penalty tracking system with types and amounts

### Scoring System
- **Stableford Points**: Handicap-adjusted scoring system
- **Betterball**: Team format using best score from each pair
- **Net Scoring**: Gross scores adjusted for player handicaps
- **Matchplay Status**: Live tracking of team leads (e.g., "3UP", "AS")

### Course Data
- **NAU Morgado Course**: 18 holes with par and handicap information
- **Hole-by-hole Details**: Par values, handicap indices, and course layout
- **Multiple Courses**: Support for different courses across trip days

## Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for all new functionality
3. Update documentation for any API changes
4. Test your changes thoroughly before submitting

## License

This project is built for the Portugal Golf Trip 2025 and is intended for private use.
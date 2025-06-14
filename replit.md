# Portugal Golf Trip 2025 - Golf Management System

## Overview

This is a comprehensive golf trip management application built for the Portugal Golf Trip 2025. The system provides real-time scoring, fines tracking, activity voting, and course information management. Built as a full-stack web application with React frontend and Express backend, using PostgreSQL for data persistence and local storage for offline functionality.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Shadcn/UI components with Radix UI primitives
- **Styling**: Tailwind CSS with custom golf-themed color variables
- **State Management**: TanStack React Query for server state, local state with React hooks
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: Express sessions with PostgreSQL store

### Database Architecture
- **Primary Database**: PostgreSQL (configurable via DATABASE_URL)
- **ORM**: Drizzle ORM with schema-first approach
- **Migrations**: Drizzle Kit for database migrations
- **Backup Storage**: Local storage for offline functionality

## Key Components

### Core Entities
1. **Players** - Golf trip participants management
2. **Rounds** - Golf rounds with course and date information
3. **Scores** - Individual hole scores for each player
4. **Fines** - Penalty tracking system with types and amounts
5. **Votes** - Activity voting system for group decisions

### Frontend Pages
- **Home** - Trip overview and quick navigation
- **Schedule** - Daily itinerary and course schedule
- **Courses** - Detailed course information with hole layouts
- **Scoring** - Live scorecard and leaderboard
- **Fines** - Penalty tracking and statistics
- **Activities** - Voting system for Friday activities

### Backend Services
- **Storage Layer** - Abstracted storage interface with memory and database implementations
- **API Routes** - RESTful endpoints for all entities
- **Validation** - Zod schema validation for all inputs

## Data Flow

### Client-Server Communication
1. Frontend makes HTTP requests to `/api/*` endpoints
2. Express server validates requests using Zod schemas
3. Storage layer abstracts database operations
4. Responses return JSON data with proper error handling

### Offline Functionality
- Local storage maintains data when offline
- Seamless sync when connection restored
- Critical data cached for uninterrupted gameplay

### Real-time Features
- Live scoring updates across devices
- Instant leaderboard calculations
- Real-time fine tracking and statistics

## External Dependencies

### Frontend Dependencies
- **UI Components**: @radix-ui/* components for accessible UI primitives
- **Routing**: wouter for lightweight routing
- **HTTP Client**: TanStack React Query with built-in fetch
- **Form Handling**: react-hook-form with @hookform/resolvers
- **Styling**: tailwindcss, class-variance-authority, clsx
- **Icons**: Lucide React icons
- **Date Handling**: date-fns for date manipulation

### Backend Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **ORM**: drizzle-orm with drizzle-zod for validation
- **Session Store**: connect-pg-simple for PostgreSQL session storage
- **Development**: tsx for TypeScript execution, esbuild for production builds

### Development Tools
- **Build**: Vite with React plugin
- **Type Checking**: TypeScript with strict configuration
- **Database**: Drizzle Kit for migrations and schema management
- **Deployment**: Configured for Replit with autoscale deployment

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 runtime
- **Database**: PostgreSQL 16 module
- **Development Server**: Vite dev server with HMR
- **Process Management**: npm scripts for development workflow

### Production Build
- **Frontend**: Vite build outputs to `dist/public`
- **Backend**: esbuild bundles server to `dist/index.js`
- **Static Assets**: Served via Express static middleware
- **Database**: Migrations applied via `npm run db:push`

### Environment Configuration
- **Database**: `DATABASE_URL` environment variable required
- **Development**: NODE_ENV=development for dev features
- **Production**: NODE_ENV=production for optimized builds

### Scaling Considerations
- **Autoscale Deployment**: Configured for Replit's autoscale infrastructure
- **Session Persistence**: PostgreSQL-backed sessions for multi-instance support
- **Asset Optimization**: Vite builds optimized bundles with code splitting

## Changelog

- June 14, 2025: Initial setup with basic golf management features
- June 14, 2025: Enhanced scoring system with player profiles, teams, and advanced tracking
  - Added player management with first/last name and handicaps
  - Implemented team system with captains and 4-player limit
  - Enhanced scoring with 3-putt, picked up, water, and bunker tracking
  - Added team-based leaderboards alongside individual scoring
  - Created Players page for profile and team management
- June 14, 2025: Integrated PostgreSQL database for persistent data storage
  - Replaced in-memory storage with DatabaseStorage class
  - Applied Drizzle schema migrations to PostgreSQL
  - All data now persists across application restarts
  - Maintained existing IStorage interface for seamless transition
- June 14, 2025: Enhanced home page layout and fines system improvements
  - Repositioned navigation cards below daily schedule section
  - Removed "5 Days" overview card as requested
  - Updated fines system with golf day tracking (July 2, 3, 5)
  - Implemented per-player per-day fines functionality with database integration
  - Fixed JSX syntax errors and improved component structure
- June 14, 2025: Fixed UI formatting and accessibility issues
  - Resolved first place leaderboard visibility with yellow background instead of dark green
  - Repositioned scorecard Gross/Net toggle below Score/Stats section as requested
  - Added accessibility DialogDescription components to fix console warnings
  - Improved scorecard layout with clearer scoring mode indicators
  - Enhanced visual hierarchy for better user experience
- June 14, 2025: Enhanced scorecard and leaderboard functionality
  - Added hole numbers (1-18) in header row above par values for better navigation
  - Implemented matching Score/Stats and Gross/Net filters on home page leaderboards
  - Added net scoring calculations with handicap adjustments for both individual and team standings
  - Unified interface design across scoring page and home page leaderboards
  - Improved scorecard table structure with clearer column headers
- June 14, 2025: Fixed leaderboard data consistency and added round management
  - Resolved data inconsistency between scorecard and home page leaderboard calculations
  - Cleaned up duplicate rounds in database that were causing calculation errors
  - Switched from memory storage to database storage for proper data persistence
  - Added round management functionality with ability to select and delete scorecards
  - Implemented proper hole-by-hole handicap calculations using actual course data
  - Added DELETE /api/rounds/:id endpoint and RoundSelector component for scorecard management

## User Preferences

Preferred communication style: Simple, everyday language.
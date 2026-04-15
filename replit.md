# BSE Trading Platform

## Overview

This is a MetaTrader-style trading platform designed specifically for the Botswana Stock Exchange (BSE). The application provides users with real-time stock data, portfolio management, order placement capabilities, and integration with registered brokers. Built as a full-stack web application with a React frontend and Express backend, it leverages modern technologies to deliver a comprehensive trading experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monolithic full-stack architecture with clear separation between client and server components. The system is designed for deployment on Replit with integrated authentication and database management.

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Shadcn/UI components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit's OpenID Connect integration with Passport.js
- **Session Management**: Express sessions with PostgreSQL storage

## Key Components

### Database Schema
- **Users**: Profile information for authenticated users
- **Stocks**: BSE-listed companies with real-time pricing data
- **Portfolios**: User investment portfolios with cash balances
- **Holdings**: Stock positions within portfolios
- **Orders**: Trade orders (buy/sell) with status tracking
- **Price History**: Historical stock price data for charting
- **Brokers**: Registered brokerage firms for order execution
- **Sessions**: User session storage for authentication

### Trading Features
- **Real-time Stock Data**: Live price feeds for BSE stocks
- **Portfolio Management**: Track holdings, P&L, and cash balances
- **Order Management**: Place, modify, and cancel trade orders
- **Broker Integration**: Connect with registered brokers for execution
- **Price Charts**: Interactive stock price visualization
- **Market Analytics**: Basic technical indicators and metrics

### User Interface Components
- **Trading Dashboard**: Main interface with stock charts, order book, and portfolio summary
- **Stock Chart**: Real-time price visualization with technical indicators
- **Trade Panel**: Order placement interface with validation
- **Order Book**: Active and historical order management
- **Portfolio Summary**: Real-time portfolio performance metrics

## Data Flow

1. **Authentication Flow**: Users authenticate via Replit OAuth, creating sessions stored in PostgreSQL
2. **Market Data**: Stock prices are initialized with BSE data and updated through the backend
3. **Trading Flow**: Orders are placed through the frontend, validated on the backend, and stored in the database
4. **Portfolio Updates**: Holdings and balances are recalculated after order execution
5. **Real-time Updates**: WebSocket connections provide live data updates to connected clients

## External Dependencies

### Core Dependencies
- **Database**: PostgreSQL via Neon serverless connection
- **Authentication**: Replit's OpenID Connect service
- **UI Components**: Radix UI primitives for accessible components
- **Charting**: Recharts for financial data visualization
- **Date Handling**: date-fns for timestamp manipulation

### Development Tools
- **Type Safety**: TypeScript with strict configuration
- **Code Quality**: ESLint and Prettier integration
- **Schema Validation**: Zod for runtime type checking
- **Database Migrations**: Drizzle Kit for schema management

## Deployment Strategy

The application is designed for deployment on Replit with the following configuration:

### Environment Setup
- **NODE_ENV**: Production/development environment flag
- **DATABASE_URL**: PostgreSQL connection string (auto-provisioned by Replit)
- **SESSION_SECRET**: Secure session encryption key
- **REPL_ID**: Replit workspace identifier for OAuth

### Build Process
1. **Frontend Build**: Vite compiles React/TypeScript to optimized static assets
2. **Backend Build**: ESBuild bundles Node.js server code with external dependencies
3. **Asset Serving**: Express serves static files in production mode
4. **Database Migration**: Drizzle pushes schema changes to PostgreSQL

### Production Considerations
- **Session Storage**: PostgreSQL-backed sessions for scalability
- **Error Handling**: Comprehensive error boundaries and API error responses
- **Security**: HTTPS enforcement, secure cookies, and CSRF protection
- **Performance**: Asset optimization, query caching, and connection pooling

The architecture prioritizes developer experience with hot reloading in development while maintaining production-ready deployment capabilities. The modular design allows for easy extension of trading features and integration with additional BSE services.
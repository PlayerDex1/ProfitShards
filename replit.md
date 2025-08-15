# Overview

This is a fully functional profit calculator web application for the game "Worldshards". The application allows players to calculate costs, profits, ROI, and efficiency of game equipment including swords, armor, shields, bows, and staffs. Features interactive calculators, equipment comparison tools, and modern UI with dark/light themes. Built with React/TypeScript and ready for deployment.

## Recent Changes (August 2025)
- ✓ Complete React/TypeScript application structure implemented
- ✓ Modern profit calculator with equipment selection (5 equipment types)
- ✓ Interactive results display with ROI, profit, and efficiency metrics
- ✓ Equipment comparison dashboard with visual progress indicators  
- ✓ Dark/light theme system with proper CSS variables and smooth transitions
- ✓ Responsive design optimized for all screen sizes
- ✓ Fixed SelectItem validation errors for proper form functionality
- ✓ SEO optimization with proper meta tags and Portuguese language support
- ✓ Performance optimization with debounced calculations and component memoization
- ✓ Advanced charts for performance tracking and token distribution
- ✓ Complete GitHub Pages deployment configuration with automated CI/CD
- ✓ Production build optimization with code splitting and minification

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on top of Radix UI primitives
- **Styling**: Tailwind CSS with custom design system including CSS variables for theming
- **State Management**: React Query (@tanstack/react-query) for server state and local React hooks for component state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation via @hookform/resolvers

## Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Session Management**: Built-in session handling with connect-pg-simple for PostgreSQL session storage
- **Development**: Hot reload with Vite integration for full-stack development

## Data Storage Architecture
- **Primary Database**: PostgreSQL with Drizzle ORM for schema management
- **Schema Definition**: Centralized in `shared/schema.ts` with type-safe database operations
- **Migration Strategy**: Drizzle Kit for database migrations and schema evolution
- **In-Memory Fallback**: MemStorage class implementation for development/testing scenarios

## Authentication & Authorization
- **User Management**: Basic user system with username/password authentication
- **Session Storage**: PostgreSQL-backed session management
- **Schema**: Users table with UUID primary keys and unique username constraints

## Component Architecture
- **Design System**: Custom theme with light/dark mode support using CSS custom properties
- **Component Library**: Comprehensive UI components including forms, dialogs, tables, charts, and navigation
- **Layout Strategy**: Responsive grid-based layout with sidebar navigation and mobile-responsive design
- **State Management**: Custom hooks for calculator logic, theme management, and mobile detection

# External Dependencies

## Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection for Neon Database
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **drizzle-kit**: Database migration and schema management tool
- **@tanstack/react-query**: Server state management and caching

## UI & Styling
- **@radix-ui/***: Comprehensive set of unstyled, accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe component variants
- **clsx**: Conditional className utility

## Development Tools
- **vite**: Fast build tool and development server
- **tsx**: TypeScript execution for Node.js
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Development tooling for Replit environment

## Form & Validation
- **react-hook-form**: Performant forms with minimal re-renders
- **@hookform/resolvers**: Integration with validation libraries
- **zod**: TypeScript-first schema validation (implied by drizzle-zod)

## Utilities
- **date-fns**: Date manipulation and formatting
- **nanoid**: URL-safe unique string ID generator
- **wouter**: Lightweight React router
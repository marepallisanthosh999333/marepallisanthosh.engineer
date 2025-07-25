# Portfolio Website Migration

## Project Overview
This is a personal portfolio website that was migrated from Bolt to Replit. The project showcases a developer's skills, projects, experience, and includes a contact form with email functionality.

## Current Architecture
- **Frontend**: React with TypeScript, Tailwind CSS, Framer Motion for animations
- **Backend**: Express.js server with Vite integration
- **Database**: PostgreSQL with Drizzle ORM
- **Email Service**: Previously Supabase Edge Functions, migrating to server-side implementation

## Key Components
- Hero section with personal introduction
- About section with background information
- Skills showcase with technologies
- Projects portfolio with descriptions
- Experience timeline
- Contact form with email integration
- Responsive design with animations

## Migration Status
Currently migrating from Bolt to Replit environment. The project uses Supabase Edge Functions for email handling which needs to be migrated to the Replit backend.

## Recent Changes
- 2025-01-25: Successfully completed migration from Bolt to Replit
- Created PostgreSQL database with Drizzle ORM integration
- Migrated Supabase Edge Functions to Express server routes
- Updated portfolio content with actual resume details:
  - About section reflects AI/ML student background
  - Experience shows actual internships (SmartBridge, EduNet Foundation)
  - Projects showcase real data science work (sentiment analysis, stock prediction, options pricing)
  - Skills updated to reflect data science and ML technologies
- Contact form now stores submissions in PostgreSQL database
- Removed all Supabase dependencies

## User Preferences
- Focus on clean, professional design
- Maintain responsive layout
- Ensure contact form functionality works properly
- Keep portfolio content accurate and up-to-date

## Tech Stack
- React 18 with TypeScript
- Express.js backend
- PostgreSQL with Drizzle ORM
- Tailwind CSS for styling
- Framer Motion for animations
- Vite for build tooling
- Wouter for routing
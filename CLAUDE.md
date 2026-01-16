# Project Guidelines for Claude

## Project Overview
Expense Splitter is a mobile-first web application designed to eliminate the friction, awkwardness, and manual labor involved in splitting bills among friends, roommates, and family. By combining AI-powered receipt scanning with automated payment reminders, it transforms a traditionally tedious and socially uncomfortable process into a seamless, instant action—making shared finances as easy as sending a text message.

## Target User
- Primary Persona: "The Social Organizer" (Winston, 25)
    - Goal: To fairly split group expenses without manual calculations or awkward follow-ups.
    - Context: Uses smartphone immediately after group activities; needs the task completed in under 2 minutes.
    - Frustrations: Manual data entry, forgotten debts, feeling like a "nag," and clunky multi-app workflows.
    - Technical Comfort: Medium-High; expects intuitive, "it just works" mobile experiences.


## Technical Stack
- Frontend: React with TypeScript, built with Vite for fast development and optimized production builds.
- Styling: Tailwind CSS with mobile-first responsive utilities. Use class variants over ternary operators.
- Backend Services (AWS Integration):
    - Database: Amazon DynamoDB for production (user data, expenses, groups).
    - AI/OCR: Amazon Textract for automated receipt data extraction.
    - Notifications: Amazon SNS for SMS payment reminders.
    - Storage: Amazon S3 for receipt image storage.
    - Authentication: Simple JWT
    - API Layer: Restful API (HTTP + JSON)
    - Language: Python + FastAPI

## Coding Standards
- Use React for all new files
- Follow functional component patterns in React
- Add comments for complex business logic
- Minimize new dependencies, discuss before adding
- Mobile-first responsive design
- Styling: Use Tailwind classes exclusively within className. Avoid inline styles or separate CSS files for components.
- External Dependencies: Evaluate necessity. Prefer lightweight, well-maintained libraries. No external dependencies for core MVP features without discussion.
- Comments: Add clear comments for complex business logic, but prioritize writing self-documenting code.
- React Patterns: Use functional components with hooks. Follow a consistent structure: imports, types, component, state, handlers, JSX return.
- Type Safety: Define TypeScript interfaces for all core data structures (e.g., Expense, Participant).
- Naming: Use descriptive names. Event handlers must be prefixed with handle (e.g., handleUpload, handleAddParticipant).


## Architecture Principles
- Keep components small and focused
- Separate business logic from UI components
- Use consistent error handling patterns
- Follow RESTful API conventions

## Testing Requirements
- Add unit tests for utility functions
- Include integration tests for API endpoints
- Test mobile responsiveness manually
- Testing frameworks will be added in later

## User Management Strategy
- Friends/family manually added to environment variables
- No self-registration for MVP
- Admin (you) manages user list via .env file
- User limit: 15-20 people

## Constraints
- Support modern browsers only (no IE)

## Scale & Hosting
- Target: 15 - 20 active users (friends & family)
- Expected usage: < 100 expenses / month, < 100 notifications / month
- Backend: Render.com (free tier) or Railway ($5/month)
- Frontend: Vercel/Netlify (free tier)
- Database: DynamoDB on-demand (AWS Free Tier)


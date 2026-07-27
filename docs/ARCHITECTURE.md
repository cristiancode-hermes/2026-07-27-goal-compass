# Goal Compass Architecture

## Overview

Goal Compass is an OKR (Objectives & Key Results) goal management platform built as a full-stack monorepo with Angular 22 frontend and NestJS 11 backend.

## Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Angular 22 (standalone, signals, zoneless) | UI with lazy-loaded routes and signal-based state |
| Styling | CSS Custom Properties + Tailwind v4 | Horizon Blue design system with dark mode |
| Backend | NestJS 11 | REST API with modular architecture |
| Database | TypeORM + SQLite (dev) / PostgreSQL (production) | Data persistence with Neon-ready schema |
| Auth | JWT + Passport.js + bcryptjs | Stateless authentication with role guards |

## Project Structure

```
goal-compass/
├── apps/
│   ├── web/              # Angular 22 frontend
│   │   ├── src/app/
│   │   │   ├── guards/        # Route guards (auth, no-auth)
│   │   │   ├── interceptors/  # HTTP interceptors (auth token)
│   │   │   ├── layouts/       # App shell and navbar
│   │   │   ├── models/        # TypeScript interfaces
│   │   │   ├── pages/         # Lazy-loaded page components
│   │   │   ├── services/      # API services
│   │   │   └── shared/        # Reusable components
│   │   └── ...
│   └── api/              # NestJS 11 backend
│       ├── src/
│       │   ├── auth/          # Authentication module
│       │   ├── users/         # User management
│       │   ├── teams/         # Team management
│       │   ├── cycles/        # Cycle management
│       │   ├── objectives/    # Objective management
│       │   ├── key-results/   # Key result management
│       │   ├── check-ins/     # Check-in system
│       │   ├── initiatives/   # Initiative management
│       │   ├── dashboard/     # Dashboard aggregation
│       │   ├── seed/          # Database seeding
│       │   └── ...
│       └── ...
└── docs/                 # Project documentation
    ├── ARCHITECTURE.md
    ├── API.md
    └── FRONTEND.md
```

## Data Model

- **User** — Platform user (admin or member)
- **Team** — Group of users collaborating on objectives
- **TeamMember** — Join table with role assignment
- **Cycle** — Time-bound period (quarterly, half-yearly, custom)
- **Objective** — High-level goal with progress tracking
- **KeyResult** — Measurable outcome defining objective success
- **CheckIn** — Periodic progress update on a key result
- **Initiative** — Action item helping achieve a key result

## Design System

**"Horizon Blue" palette** — Deep ocean blues provide calm authority; warm sunset orange injects energy. Full design tokens in DESIGN_SYSTEM.md.

## Key Patterns

- Signal-based state management (Angular)
- State triad per component: loading → error → empty → normal
- Progress auto-calculation: weighted average of key results
- Cycle state machine: draft → active → closed
- JWT authentication with role-based guards

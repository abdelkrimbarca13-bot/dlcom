# Repository Guidelines

## Project Structure & Module Organization
This is a Next.js application using the **App Router** architecture. The codebase is organized into several key directories under `src/`:
- **app/**: Contains route definitions, API endpoints, and the main application layout.
- **components/**: Houses UI components including role-specific dashboards (`AdminDashboard`, `EmployeeDashboard`) and shared forms.
- **hooks/**: Custom React hooks for business logic like analytics.
- **lib/**: Core utilities including `prisma` client initialization and `next-auth` configuration.
- **prisma/**: Database schema (`schema.prisma`) and seeding logic (`seed.cjs`, `seed.ts`).

The application implements a strict **Admin/Employee role separation** enforced via `middleware.ts` and NextAuth.

## Build, Test, and Development Commands
The project uses `npm` for dependency management.
- **Development**: `npm run dev`
- **Build**: `npm run build`
- **Production Start**: `npm run start`
- **Linting**: `npm run lint`
- **Database Management**:
  - `npx prisma generate`: Generate the Prisma client.
  - `npx prisma db push`: Sync the schema with the database.
  - `npx prisma db seed`: Seed the database with initial data.

## Coding Style & Naming Conventions
- **TypeScript**: Strictly used for all source files.
- **Styling**: Tailwind CSS is used for all UI components.
- **Validation**: Zod schemas are used for form validation and API request parsing, often paired with `react-hook-form`.
- **UI Components**: Follow a modular approach in `src/components/`, typically using functional components and Lucide icons.
- **State Management**: React hooks and context (via `AuthProvider`) for authentication state.

## Testing Guidelines
Currently, the repository does not have a configured test suite. Developers should manually verify changes in the development environment and ensure `npm run lint` passes before pushing.

## Pull Request Guidelines
As this is not currently a git-tracked repository in the standard sense (no `.git` directory found), follow standard team practices for code sharing. Ensure all `.env` variables are documented in `.env.example` when adding new configuration.

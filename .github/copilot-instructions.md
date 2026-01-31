# PlanUCalgary - AI Coding Agent Instructions

## Project Overview
PlanUCalgary is a course planning tool for University of Calgary. It's a TypeScript monorepo with three packages: `client` (React+Vite), `server` (Express+Prisma), and `shared` (types & utilities).

## Architecture & Key Patterns

### Monorepo Structure
- **Shared package** (`shared/src/`) exports types that both client and server import
- Client imports: `@planucalgary/shared` for business types, `@planucalgary/shared/prisma/client` for Prisma types, `@planucalgary/shared/prisma/browser` for browser-compatible Prisma types
- Server imports: `@planucalgary/shared` for types with Express `RequestHandler` definitions
- After modifying Prisma schema, run `npm run generate --prefix server` to regenerate types in `shared/src/generated/`

### Type-Safe API Pattern
All API endpoints follow strict type contracts defined in `shared/src/*.ts`:
```typescript
// shared/src/course.ts
export type CourseListHandler = RequestHandler<never, CourseListResBody, never, CourseListReqQuery>
```
- Server controllers implement these handler types (e.g., [server/src/api/courses/controllers.ts](server/src/api/courses/controllers.ts))
- Client hooks use the same types (e.g., [client/src/hooks/useCourses.ts](client/src/hooks/useCourses.ts))
- Routes use Zod schemas (auto-generated from Prisma via `prisma-zod-generator`) for validation: [server/src/api/courses/routes.ts](server/src/api/courses/routes.ts)

### Requisite JSON System
Complex course prerequisite logic is stored as JSON validated by a custom validator in [server/src/jsonlogic/requisite_json.ts](server/src/jsonlogic/requisite_json.ts):
- JSON structure supports operators: `and`, `or`, `not`, `units`, `consent`, `admission`, `year`
- See [server/REQUISITE_JSON.md](server/REQUISITE_JSON.md) for full schema documentation
- Validator checks course codes, subject codes, faculty codes against database
- JSON validation happens at runtime with `safe` and `strict` modes

### API Structure
Each resource follows the same pattern in `server/src/api/<resource>/`:
- `routes.ts` - Express routes with Zod validation middleware
- `controllers.ts` - Handler implementations (list, get, create, update, delete)
- `errors.ts` - Custom error classes (e.g., `<Resource>NotFoundError`)

## Developer Workflows

### Initial Setup
```bash
npm install                    # Install all monorepo dependencies
cd server && cp .env.example .env  # Configure database connection
npm run dev                    # Start client (Vite:5173), server (Express:5150), and shared watch mode
```

### Database Workflows
- **Schema changes**: Edit [server/prisma/schema.prisma](server/prisma/schema.prisma), then run `npm run migrate --prefix server`
- **Prisma Studio**: `npm run studio --prefix server` (opens on port 5555)
- **Regenerate types**: `npm run generate --prefix server` (outputs to `shared/src/generated/prisma/`)
- Database runs on Docker Compose (PostgreSQL on port 5817): `docker-compose up -d`

### Testing
- Run tests: `npm test --prefix server`
- Tests use Jest with `ts-jest` for TypeScript support
- Test files follow `*.test.ts` pattern (e.g., [server/src/jsonlogic/utils.test.ts](server/src/jsonlogic/utils.test.ts))

## Project-Specific Conventions

### Import Aliases
- Client uses `@/` for `src/` (configured in [client/vite.config.ts](client/vite.config.ts))
- Server uses absolute imports via `tsconfig-paths` (e.g., `import { prismaClient } from "../../middlewares"`)

### Middleware Stack (server)
Applied in [server/src/app.ts](server/src/app.ts):
1. `prisma()` - Injects Prisma client into `req.prisma`
2. `jwt()` - JWT authentication (excludes `/accounts/signin` and `/accounts/signup`)
3. `auth()` - Attaches user to `req.user`
4. `emptyget()` - Custom middleware for empty GET requests
5. `pagination()` - Adds pagination helpers
6. `admin()` - Protects admin routes (applied per-route)
7. `zod()` - Request validation with Zod schemas

### State Management
- Client uses TanStack Query (`@tanstack/react-query`) for server state
- UI state machines use XState (`xstate`, `@xstate/react`) - see [client/src/lib/stateful-button-machine.ts](client/src/lib/stateful-button-machine.ts)
- Query keys follow pattern: `['resource', ...params]` for automatic cache invalidation

### UI Components
- Radix UI primitives + Tailwind CSS for styling
- Custom components in [client/src/components/ui/](client/src/components/ui/)
- Advanced table component uses TanStack Table: [client/src/components/advanced-table.tsx](client/src/components/advanced-table.tsx)

## Critical Integration Points

### Prisma Generator Output Path
Prisma generates to `shared/src/generated/prisma/` (not `node_modules`):
```prisma
generator client {
  provider = "prisma-client"
  output   = "../../shared/src/generated/prisma/"
}
```
This allows both client and server to import generated types.

### API Base URL
Client hardcodes API URL and JWT token in [client/src/api.ts](client/src/api.ts) - update for production deployment.

### Postinstall Hooks
Root `package.json` runs: `shared` build → `server` Prisma deploy → `server` Prisma generate on `npm install`.

## Common Tasks

**Add new API endpoint**:
1. Define types in `shared/src/<resource>.ts` with `RequestHandler` type
2. Create Zod schemas or import from `shared/src/generated/zod/`
3. Implement controller in `server/src/api/<resource>/controllers.ts`
4. Add route in `server/src/api/<resource>/routes.ts` with `zod()` middleware
5. Register router in [server/src/app.ts](server/src/app.ts)
6. Create custom hook in `client/src/hooks/use<Resource>.ts`

**Modify Prisma schema**:
1. Edit [server/prisma/schema.prisma](server/prisma/schema.prisma)
2. Run `npm run migrate --prefix server` (creates migration + regenerates types)
3. Types automatically available in `@planucalgary/shared/prisma/client`

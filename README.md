## Project structure

The project is a monorepo of three packages:
- `server`: The backend server built with Node.js and Express.
- `client`: The frontend application built with React.
- `shared`: Shared code between the server and client, such as types and utilities.

Each package has its own `src` directory containing the source code, and a `package.json` file for managing dependencies and scripts. The root directory contains a `package.json` file for managing shared dependencies and scripts across the monorepo.

## Getting started

To get started with the project, follow these steps:
1. Clone the repository to your local machine.
2. Navigate to the root directory of the project.
3. Run `npm install` to install all dependencies for the monorepo.
4. Go into `server` directory and create a `.env` file based on the provided `.env.example` file, filling in the necessary environment variables.
5. Run `npm run dev` from the root directory to start both the server and client in development mode.

## Prisma and Shared Package
The project uses Prisma as the ORM for database interactions. The Prisma schema is located in the `server/prisma` directory. The `shared` package contains TypeScript types and utilities that are used by both the server and client, ensuring type safety and consistency across the codebase. The prisma generator is configured to output the generated client to `server/src/generated/prisma`, which is then used by the server and client packages.


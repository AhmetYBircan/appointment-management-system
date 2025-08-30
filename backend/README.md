

# Calendar Appointment System

A NestJS-based calendar application for managing appointments and notes.

## Features

- Create, read, update, and delete appointments
- Add notes to appointments
- View appointments by date range
- Support for all-day events
- PostgreSQL database integration

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   DB_HOST=
   DB_PORT=
   DB_USERNAME=
   DB_PASSWORD=
   DB_DATABASE=
   NODE_ENV=
   ```

4. Create the database:
   ```bash
   ```

5. Start the application:
   ```bash
   npm run start:dev
   ```

```

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```


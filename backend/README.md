# Campus Task Board Backend

Node.js backend server for the Campus Task Collaboration Board.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (optional, server defaults to port 3000):
```
PORT=3000
```

3. Start the development server:
```bash
npm run dev
```

The server will run on http://localhost:3000

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Health
- `GET /api/health` - Check server status


# Campus Task Collaboration Board

A full-stack web application designed to help manage and allocate tasks around the university campus. Built with modern web technologies, this application provides an intuitive Kanban-style board interface for organizing tasks across different categories.

**Developer:** Cyril Michael Dagher  
**Student ID:** 10012300026

---

## 🎯 Project Overview

The Campus Task Collaboration Board is a comprehensive task management system that enables students and staff to collaborate effectively by providing a centralized platform for creating, organizing, and tracking tasks. The application features a clean, minimal design with a focus on usability and functionality.

---

## ✨ Features

### User Authentication
- Secure user registration and login
- Password hashing with bcryptjs
- Session management with JWT tokens
- Protected routes requiring authentication

### Task Management
- **Create Tasks**: Add new tasks with title, description, category, tags, and time estimates
- **Kanban Board**: Visual task organization across four categories:
  - Academics
  - Recreational
  - Sports
  - Events
- **Task Status**: Mark tasks as completed with automatic organization
- **Task Deletion**: Delete tasks with confirmation modal
- **Completed Tasks**: Dedicated section for viewing completed tasks

### Dashboard Features
- **Overview**: Task statistics and category breakdown
- **Projects**: Main Kanban board interface
- **Completed Tasks**: View all completed tasks
- **Milestones**: Track project milestones
- **Planning**: Upcoming tasks and planning tips
- **User Profile**: Profile dropdown with logout functionality

### User Interface
- Modern, minimal design with clean aesthetics
- Responsive layout for different screen sizes
- Modal windows for task creation and deletion
- Intuitive navigation between views
- Real-time task updates

---

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Structure and semantic markup
- **CSS3** - Styling and responsive design
- **JavaScript (ES6+)** - Client-side logic and DOM manipulation
- **Fetch API** - HTTP requests to backend
- **LocalStorage** - Client-side data caching

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database management system
- **bcryptjs** - Password hashing library
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Development Tools
- **Nodemon** - Automatic server restart during development
- **Git** - Version control system
- **Thunder Client/Postman** - API testing

---

## 📁 Project Structure

```
campus.task.collab-board/
├── frontend/
│   ├── index.html          # Login/Registration page
│   ├── dashboard.html      # Main dashboard page
│   ├── css/
│   │   ├── styles.css      # Main dashboard styles
│   │   └── login.css       # Login page styles
│   └── js/
│       ├── api.js          # API communication utilities
│       ├── auth.js         # Authentication logic
│       ├── tasks.js        # Task management logic
│       └── dashboard.js    # Dashboard navigation and UI
│
├── backend/
│   ├── server.js           # Main Express server
│   ├── package.json        # Dependencies and scripts
│   ├── config/
│   │   └── db.js          # Database connection pool
│   └── .gitignore         # Git ignore file
│
├── Documentation.txt       # Comprehensive project documentation
└── README.md              # This file
```

---

## 🚀 Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)
- PostgreSQL database (local or hosted)
- Modern web browser

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure database connection:**
   Update the connection string in `config/db.js` with your PostgreSQL credentials.

4. **Create database tables:**
   Execute the following SQL in pgAdmin or PostgreSQL CLI:
   
   ```sql
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     email VARCHAR(255) UNIQUE NOT NULL,
     password VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   CREATE TABLE tasks (
     id SERIAL PRIMARY KEY,
     title VARCHAR(255) NOT NULL,
     description TEXT,
     category VARCHAR(50) NOT NULL,
     tags TEXT[],
     time VARCHAR(50) DEFAULT '1h 00m',
     completed BOOLEAN DEFAULT FALSE,
     comments INTEGER DEFAULT 0,
     user_id INTEGER REFERENCES users(id),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   The server will run on `http://localhost:3000`

### Frontend Setup

1. **Open the frontend files in a web server:**
   - For development, use a local server (e.g., Live Server extension in VS Code)
   - Ensure the backend server is running before accessing the frontend

2. **Open `index.html` in the browser** to start the application

---

## 📡 API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Health Check
- `GET /api/health` - Check server status

For detailed API documentation, see `Documentation.txt`.

---

## 💻 Usage Guide

### User Registration
1. Open the application in a web browser
2. Fill in the registration form with your name, email, and password
3. Click "Register" button
4. Upon successful registration, you can log in

### User Login
1. Enter your registered email and password
2. Click "Login" button
3. You will be redirected to the dashboard

### Creating a Task
1. Navigate to "Projects" in the main navigation
2. Click the "+" button or "+ Add a Task" in any category column
3. Fill in the task details in the modal:
   - Task Title (required)
   - Description (optional)
   - Estimated Time (optional)
   - Tags (comma-separated, optional)
4. Click "Add Task" to create the task

### Managing Tasks
- **Complete Task**: Check the checkbox to mark a task as completed
- **View Completed**: Completed tasks automatically move to "Completed Tasks" section
- **Delete Task**: Click the three-dot menu (⋯) to delete a task
- **Confirm Deletion**: Confirm deletion in the modal that appears

### Navigation
- **Start**: Welcome page with project information
- **Projects**: Kanban board with task management
- **Overview**: Task statistics and category breakdown
- **Completed**: View all completed tasks
- **Milestones**: Milestone tracking
- **Planning**: Upcoming tasks and planning tips

---

## 🔒 Security Features

- **Password Hashing**: Passwords are hashed using bcryptjs (10 salt rounds) before storage
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Parameterized queries prevent SQL injection attacks
- **CORS**: Cross-origin resource sharing configured for secure API access
- **Authentication**: JWT token-based authentication system

---

## 🧪 Testing

The application has been tested for:
- User registration and login functionality
- Task CRUD operations
- Task completion and deletion
- UI/UX interactions
- API endpoints using Thunder Client/Postman
- Error handling and edge cases

---

## 🎨 Design Philosophy

The application follows a minimal design approach with:
- Clean, uncluttered interface
- Consistent color scheme (primary: #6366f1)
- Card-based design for tasks
- Smooth transitions and hover effects
- Responsive layout for different screen sizes

---

## 📝 Development Process

### Phase 1: Planning and Design
- Defined project requirements
- Designed database schema
- Planned API endpoints
- Created UI mockups

### Phase 2: Backend Development
- Set up Express.js server
- Implemented authentication system
- Created RESTful API endpoints
- Integrated PostgreSQL database
- Implemented password hashing

### Phase 3: Frontend Development
- Built login and registration pages
- Created dashboard interface
- Implemented Kanban board
- Added task management functionality
- Implemented modal windows
- Added navigation and view switching

### Phase 4: Integration and Testing
- Connected frontend to backend API
- Tested all features
- Fixed bugs and issues
- Optimized user experience

---

## 🚧 Future Enhancements

- [ ] Proper JWT token implementation
- [ ] Task assignment to specific users
- [ ] Task due dates and reminders
- [ ] Task priority levels
- [ ] Task attachments and file uploads
- [ ] Task comments and collaboration
- [ ] Advanced search and filtering
- [ ] Drag-and-drop task reordering
- [ ] Dark mode support
- [ ] Mobile app version
- [ ] Real-time updates using WebSockets

---

## 📄 License

This project is developed as part of a university course assignment.

---

## 👤 Author

**Cyril Michael Dagher**  
Student ID: 10012300026

---

## 🙏 Acknowledgments

- Express.js community for excellent documentation
- PostgreSQL community for database support
- All open-source contributors whose libraries made this project possible

---

## 📚 Documentation

For comprehensive technical documentation, please refer to `Documentation.txt` which includes:
- Detailed system architecture
- Database schema
- Complete API documentation
- Implementation details
- Challenges and solutions
- Testing procedures

---

**Note:** This application is developed for educational purposes as part of a university course project.

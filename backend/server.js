const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

// auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, student_id } = req.body;

    if (!name || !email || !password || !student_id) {
      return res.status(400).json({ error: 'All fields are required including Student ID' });
    }

    // Validate student ID format (should be numeric and reasonable length)
    if (!/^\d{8,12}$/.test(student_id)) {
      return res.status(400).json({ error: 'Student ID must be 8-12 digits' });
    }

    // check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR student_id = $2',
      [email, student_id]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email or Student ID already registered' });
    }

    // hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // insert new user (with student_id)
    const result = await pool.query(
      'INSERT INTO users (name, email, password, student_id) VALUES ($1, $2, $3, $4) RETURNING id, name, email, student_id',
      [name, email, hashedPassword, student_id]
    );

    res.status(201).json({ message: 'User created successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user by email - only select needed fields for better performance
    const result = await pool.query(
      'SELECT id, name, email, password, student_id FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // compare password with hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // in real app, return JWT token
    res.json({
      token: 'fake-jwt-token',
      user: { id: user.id, name: user.name, email: user.email, student_id: user.student_id }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// tasks routes
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, u.name as assignee_name 
       FROM tasks t 
       LEFT JOIN users u ON t.assignee_id = u.id 
       ORDER BY t.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, category, tags, time, status, assignee_id, team_id } = req.body;

    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }

    // Default status to 'Pending' if not provided
    const taskStatus = status || 'Pending';

    const result = await pool.query(
      'INSERT INTO tasks (title, description, category, tags, time, status, assignee_id, team_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [title, description || '', category, tags || [], time || '1h 00m', taskStatus, assignee_id || null, team_id || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { title, description, category, tags, time, status, comments, assignee_id, team_id } = req.body;

    // build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (category !== undefined) {
      updates.push(`category = $${paramCount++}`);
      values.push(category);
    }
    if (tags !== undefined) {
      updates.push(`tags = $${paramCount++}`);
      values.push(tags);
    }
    if (time !== undefined) {
      updates.push(`time = $${paramCount++}`);
      values.push(time);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (comments !== undefined) {
      updates.push(`comments = $${paramCount++}`);
      values.push(comments);
    }
    if (assignee_id !== undefined) {
      updates.push(`assignee_id = $${paramCount++}`);
      values.push(assignee_id);
    }
    if (team_id !== undefined) {
      updates.push(`team_id = $${paramCount++}`);
      values.push(team_id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    values.push(taskId);

    const result = await pool.query(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);

    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [taskId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// teams routes
app.post('/api/teams', async (req, res) => {
  try {
    const { name, description, creator_id } = req.body;
    
    console.log('Create team request:', { name, description, creator_id, body: req.body });

    if (!name || !creator_id) {
      return res.status(400).json({ error: 'Team name and creator ID are required' });
    }

    // Ensure creator_id is an integer
    const creatorIdInt = parseInt(creator_id);
    if (isNaN(creatorIdInt)) {
      return res.status(400).json({ error: 'Invalid creator ID format' });
    }

    // Generate a unique team code (6 characters, alphanumeric)
    const generateTeamCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };
    
    let teamCode = generateTeamCode();
    let codeExists = true;
    let attempts = 0;
    
    // Ensure code is unique (check if it exists)
    while (codeExists && attempts < 10) {
      const checkResult = await pool.query(
        'SELECT id FROM teams WHERE team_code = $1',
        [teamCode]
      );
      if (checkResult.rows.length === 0) {
        codeExists = false;
      } else {
        teamCode = generateTeamCode();
        attempts++;
      }
    }

    const result = await pool.query(
      'INSERT INTO teams (name, description, creator_id, team_code) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description || '', creatorIdInt, teamCode]
    );

    console.log('Team created:', result.rows[0]);

    // Add creator as team member
    try {
      await pool.query(
        'INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)',
        [result.rows[0].id, creatorIdInt, 'admin']
      );
      console.log('Team member added successfully');
    } catch (memberError) {
      console.error('Error adding team member:', memberError);
      // If adding member fails, delete the team to maintain consistency
      await pool.query('DELETE FROM teams WHERE id = $1', [result.rows[0].id]);
      throw memberError;
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create team error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint
    });
    // Return more detailed error message for debugging
    const errorMessage = error.message || 'Unknown error';
    if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
      res.status(500).json({ error: 'Database tables not found. Please run the setup script to create teams and team_members tables.' });
    } else if (error.code === '23505') { // Unique violation
      res.status(400).json({ error: 'Team name already exists or user is already a member' });
    } else if (error.code === '23503') { // Foreign key violation
      res.status(400).json({ error: 'Invalid creator ID. User does not exist.' });
    } else {
      res.status(500).json({ error: `Server error: ${errorMessage}` });
    }
  }
});

app.get('/api/teams', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, u.name as creator_name 
       FROM teams t 
       LEFT JOIN users u ON t.creator_id = u.id 
       ORDER BY t.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get teams error:', error);
    const errorMessage = error.message || 'Unknown error';
    if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
      res.status(500).json({ error: 'Database tables not found. Please run the setup script to create teams and team_members tables.' });
    } else {
      res.status(500).json({ error: `Server error: ${errorMessage}` });
    }
  }
});

app.get('/api/teams/:id', async (req, res) => {
  try {
    const teamId = parseInt(req.params.id);
    const result = await pool.query(
      `SELECT t.*, u.name as creator_name 
       FROM teams t 
       LEFT JOIN users u ON t.creator_id = u.id 
       WHERE t.id = $1`,
      [teamId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Get team members
    const membersResult = await pool.query(
      `SELECT tm.*, u.name, u.email, u.student_id 
       FROM team_members tm 
       JOIN users u ON tm.user_id = u.id 
       WHERE tm.team_id = $1`,
      [teamId]
    );

    res.json({ ...result.rows[0], members: membersResult.rows });
  } catch (error) {
    console.error('Get team error:', error);
    const errorMessage = error.message || 'Unknown error';
    if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
      res.status(500).json({ error: 'Database tables not found. Please run the setup script to create teams and team_members tables.' });
    } else {
      res.status(500).json({ error: `Server error: ${errorMessage}` });
    }
  }
});

app.post('/api/teams/:id/join', async (req, res) => {
  try {
    const teamId = parseInt(req.params.id);
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Check if user is already a member
    const existingMember = await pool.query(
      'SELECT * FROM team_members WHERE team_id = $1 AND user_id = $2',
      [teamId, user_id]
    );

    if (existingMember.rows.length > 0) {
      return res.status(400).json({ error: 'User is already a member of this team' });
    }

    const result = await pool.query(
      'INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3) RETURNING *',
      [teamId, user_id, 'member']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Join team error:', error);
    const errorMessage = error.message || 'Unknown error';
    if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
      res.status(500).json({ error: 'Database tables not found. Please run the setup script to create teams and team_members tables.' });
    } else {
      res.status(500).json({ error: `Server error: ${errorMessage}` });
    }
  }
});

// Join team by code
app.post('/api/teams/join-by-code', async (req, res) => {
  try {
    const { team_code, user_id } = req.body;

    if (!team_code || !user_id) {
      return res.status(400).json({ error: 'Team code and user ID are required' });
    }

    // Find team by code
    const teamResult = await pool.query(
      'SELECT id FROM teams WHERE team_code = $1',
      [team_code.toUpperCase()]
    );

    if (teamResult.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found. Please check the team code.' });
    }

    const teamId = teamResult.rows[0].id;
    const userIdInt = parseInt(user_id);
    
    if (isNaN(userIdInt)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    // Check if user is already a member
    const existingMember = await pool.query(
      'SELECT * FROM team_members WHERE team_id = $1 AND user_id = $2',
      [teamId, userIdInt]
    );

    if (existingMember.rows.length > 0) {
      return res.status(400).json({ error: 'You are already a member of this team' });
    }

    // Add user to team
    const result = await pool.query(
      'INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3) RETURNING *',
      [teamId, userIdInt, 'member']
    );

    // Get team details to return
    const teamDetails = await pool.query(
      'SELECT * FROM teams WHERE id = $1',
      [teamId]
    );

    res.status(201).json({
      message: 'Successfully joined team',
      team: teamDetails.rows[0],
      membership: result.rows[0]
    });
  } catch (error) {
    console.error('Join team by code error:', error);
    const errorMessage = error.message || 'Unknown error';
    if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
      res.status(500).json({ error: 'Database tables not found. Please run the setup script to create teams and team_members tables.' });
    } else {
      res.status(500).json({ error: `Server error: ${errorMessage}` });
    }
  }
});

app.get('/api/users/:id/teams', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    console.log('Get user teams request for user ID:', userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const result = await pool.query(
      `SELECT t.*, tm.role 
       FROM teams t 
       JOIN team_members tm ON t.id = tm.team_id 
       WHERE tm.user_id = $1 
       ORDER BY t.created_at DESC`,
      [userId]
    );
    
    console.log(`Found ${result.rows.length} teams for user ${userId}`);
    res.json(result.rows);
  } catch (error) {
    console.error('Get user teams error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    const errorMessage = error.message || 'Unknown error';
    if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
      res.status(500).json({ error: 'Database tables not found. Please run the setup script to create teams and team_members tables.' });
    } else {
      res.status(500).json({ error: `Server error: ${errorMessage}` });
    }
  }
});

app.get('/api/teams/:id/members', async (req, res) => {
  try {
    const teamId = parseInt(req.params.id);
    const result = await pool.query(
      `SELECT tm.*, u.name, u.email, u.student_id 
       FROM team_members tm 
       JOIN users u ON tm.user_id = u.id 
       WHERE tm.team_id = $1 
       ORDER BY tm.created_at ASC`,
      [teamId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get team members error:', error);
    const errorMessage = error.message || 'Unknown error';
    if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
      res.status(500).json({ error: 'Database tables not found. Please run the setup script to create teams and team_members tables.' });
    } else {
      res.status(500).json({ error: `Server error: ${errorMessage}` });
    }
  }
});

// Get all users (for task assignment dropdown)
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, student_id FROM users ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


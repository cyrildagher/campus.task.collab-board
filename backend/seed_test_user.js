/**
 * Seed script to create a test user for development/testing
 * Run with: node seed_test_user.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./config/db');

async function seedTestUser() {
  try {
    const testUser = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
      student_id: '12345678'
    };

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR student_id = $2',
      [testUser.email, testUser.student_id]
    );

    if (existingUser.rows.length > 0) {
      console.log('Test user already exists!');
      console.log('Email:', testUser.email);
      console.log('Password:', testUser.password);
      console.log('Student ID:', testUser.student_id);
      process.exit(0);
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(testUser.password, saltRounds);

    // Insert test user
    const result = await pool.query(
      'INSERT INTO users (name, email, password, student_id) VALUES ($1, $2, $3, $4) RETURNING id, name, email, student_id',
      [testUser.name, testUser.email, hashedPassword, testUser.student_id]
    );

    console.log('✅ Test user created successfully!');
    console.log('Email:', testUser.email);
    console.log('Password:', testUser.password);
    console.log('Student ID:', testUser.student_id);
    console.log('User ID:', result.rows[0].id);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    process.exit(1);
  }
}

seedTestUser();


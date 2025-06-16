const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/userModel');

describe('User Auth Tests', () => {
  const userData = {
    first_name: 'John',
    last_name: 'Doe',
    username: 'johndoe',
    email: 'john@example.com',
    password: 'password123'
  };

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(userData.email);
  });

  it('should not allow registration with existing email', async () => {
    await request(app).post('/api/auth/register').send(userData);

    const res = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400);

    expect(res.body.error).toMatch(/email.*already exists/i);
  });

  it('should login the user', async () => {
    await request(app).post('/api/auth/register').send(userData);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: userData.email,
        password: userData.password
      })
      .expect(200);

    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(userData.email);
  });

  it('should reject login with wrong credentials', async () => {
    await request(app).post('/api/auth/register').send(userData);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: userData.email,
        password: 'wrongpassword'
      })
      .expect(401);

    expect(res.body.error).toMatch(/invalid/i);
  });
});

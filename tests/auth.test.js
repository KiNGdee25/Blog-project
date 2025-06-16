const request = require('supertest');
const app = require('../app'); 

describe('Auth Routes', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        first_name: 'John',
        last_name: 'Doe',
        username: 'johndoe', 
        email: 'john@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'john@example.com');
  });
});

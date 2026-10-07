const request = require('supertest');
const { app, db } = require('../src/app');

afterAll(() => {
  db.close();
});

describe('app', () => {
  it('responds to the health check', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', message: 'Backend server is running' });
  });
});

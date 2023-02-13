import request from 'supertest';
import app from '../src/app';
import {createConnection, closeConnection} from "./config";

beforeAll(async () => {
    await createConnection();
});

afterAll(async () => {
    await closeConnection();
})

let token = '';

describe('Auth Routes', () => {
    it('should register user - (POST)', async () => {
        const response = await request(app).post('/api/register').send({
            first_name: 'ali',
            last_name: 'wali',
            email: 'ali@gmail.com',
            password: 'abc12345',
            password_confirm: 'abc12345'
        });

        expect(response.body).toHaveProperty('id');
        expect(response.statusCode).toBe(201)
    });

    it('should login user - (POST)', async () => {
        const response = await request(app).post('/api/login').send({
            email: 'ali@gmail.com',
            password: 'abc12345',
        });

        let cookie = response.header['set-cookie'];
        token = cookie[0].split(';')[0];

        expect(response.body.message).toBe('success');
        expect(response.statusCode).toBe(200)
    });

    it('should return loggedIn user - (GET)', async () => {
        const response = await request(app).get('/api/me')
            .set('Cookie', [token]);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('id');
    });

    it('should update profile - (PUT)', async () => {
        const response = await request(app).put('/api/update-profile')
            .set('Cookie', [token])
            .send({first_name: 'Sadiq'});

        expect(response.statusCode).toBe(200);
        expect(response.body.first_name).toBe('Sadiq');
    });

    it('should update password - (PATCH)', async () => {
        const response = await request(app).patch('/api/update-password')
            .set('Cookie', [token])
            .send({old_password: 'abc12345', password: '123456789'});

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('success');
    });

    it('should logout the user - (POST)', async () => {
        const response = await request(app).post('/api/logout')
            .set('Cookie', [token]);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('success');
    });
})
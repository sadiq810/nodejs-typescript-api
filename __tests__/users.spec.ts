import request from 'supertest';
import app from '../src/app';
import {createConnection, closeConnection, getToken, seedRoles} from "./config";
let token = '';

beforeAll(async () => {
    await createConnection();
    await seedRoles();
    token = await getToken()
});

afterAll(async () => {
    await closeConnection();
});

describe('Users APIs', () => {
    it('should get users list - (GET)', async () => {
        const response = await request(app).get('/api/users').set('Cookie', [token]);

        expect(response.statusCode).toBe(200)
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('meta');
    });

    it('should create new user - (POST)', async () => {
        const response = await request(app).post('/api/users')
            .set('Cookie', [token])
            .send({
                first_name: 'Saleem',
                last_name: 'khan',
                email: 'saleem2@gmail.com',
                role_id: 2
            });

        expect(response.statusCode).toBe(200)
        expect(response.body).toHaveProperty('id');
    });

    it('should get user by ID - (GET)', async () => {
        const response = await request(app).get('/api/users/2')
            .set('Cookie', [token]);

        expect(response.statusCode).toBe(200)
        expect(response.body).toHaveProperty('id');
    });

    it('should update user by ID - (PUT)', async () => {
        const response = await request(app).put('/api/users/2')
            .set('Cookie', [token])
            .send({first_name: 'Henry'})

        expect(response.statusCode).toBe(200)
        expect(response.body.first_name).toBe('Henry');
    });

    it('should delete user by ID - (DELETE)', async () => {
        const response = await request(app).delete('/api/users/2')
            .set('Cookie', [token])

        expect(response.statusCode).toBe(200)
        expect(response.body.message).toBe('success');
    });
})


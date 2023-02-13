import {newDb} from "pg-mem";
import {User} from '../src/entity/user.entity';
import {Role} from '../src/entity/role.entity';
import {Permission} from '../src/entity/permission.entity';
import {Order} from '../src/entity/order.entity';
import {OrderItem} from '../src/entity/order-item.entity';
import Product from '../src/entity/product.entity';
import request from 'supertest';
import app from '../src/app';

let connection = null;

export const createConnection = async () => {
    const db = newDb({
        autoCreateForeignKeyIndices: true,
    });

    db.public.registerFunction({
        implementation: () => 'test',
        name: 'current_database',
    });

    connection = await db.adapters.createTypeormConnection({
        type: 'postgres',
        entities: [User, Role, Permission, Order, OrderItem, Product]
    });

    await connection.synchronize();
}

export const closeConnection = async () => {
    await connection.close();
}

export const getToken = async () => {
    await request(app).post('/api/register').send({
        first_name: 'Saleem',
        last_name: 'khan',
        email: 'saleem@gmail.com',
        password: '123456789',
        password_confirm: '123456789'
    });

    const response = await request(app).post('/api/login').send({
        email: 'saleem@gmail.com',
        password: '123456789',
    });

    let cookie = response.header['set-cookie'];
    return cookie[0].split(';')[0];
}

export const seedRoles = async () => {
    let permissionRepository = connection.getRepository(Permission);

    let perms = ['view_users', 'edit_users', 'view_roles', 'edit_roles', 'view_products', 'edit_products', 'view_orders', 'edit_orders'];

    let permissions = [];

    for (let i = 0; i < perms.length; i++) {
        permissions.push(await permissionRepository.save({title: perms[i]}));
    }

    let roleRepository = connection.getRepository(Role);

    await roleRepository.save({
        title: 'Admin',
        permissions
    });

    delete permissions[3];

    await roleRepository.save({
        title: 'Editor',
        permissions
    });

    delete permissions[1];
    delete permissions[5];
    delete permissions[7];

    await roleRepository.save({
        title: 'Viewer',
        permissions
    });
}
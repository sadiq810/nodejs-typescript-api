import * as typeorm from 'typeorm';
import {CreateUser, DeleteUser, GetUser, UpdateUser, Users} from "./user.controller";
import {Request, Response} from "express";
import bcrypt from 'bcrypt';

const mockRequest = () => ({
    body: {
    },
    query: {
        page: 1
    },
    params: {
        id: 1
    }
});

const mockResponse = () => ({
    status: jest.fn().mockReturnThis(),
    send: jest.fn()
});

type user = {
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    role_id: number
};

const mockUser: user = {
    first_name: 'Ali',
    last_name: 'Jan',
    email: 'ali@wali.com',
    password: 'abc12345',
    role_id: 1
}

afterEach(() => {
    jest.restoreAllMocks();
})

jest.mock("../entity/user.entity", () => ({}));

jest.mock('typeorm', () => ({
    getManager: jest.fn().mockReturnThis(),
    getRepository: jest.fn().mockReturnThis(),
}))

describe('User Controller', () => {
    it('should return users list', async function () {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                findAndCount: jest.fn().mockResolvedValueOnce( [[], 100])
            })),
        }));

        const mockReq = mockRequest() as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await Users(mockReq, mockRes);

        expect(mockRes.send).toHaveBeenCalledWith({
            data: [],
            meta: {
                total: 100,
                page: 1,
                last_page: 10
            }
        })
    });

    it('should create new user', async function () {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                save: jest.fn().mockResolvedValueOnce( {id: 123, ...mockUser})
            })),
        }));

        // @ts-ignore
        jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce('hashedPassword')

        const mockReq = mockRequest().body = {body: {...mockUser}} as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await CreateUser(mockReq, mockRes);

        expect(mockRes.send).toHaveBeenCalledWith({
            id: 123,
            first_name: 'Ali',
            last_name: 'Jan',
            email: 'ali@wali.com',
            role_id: 1
        });
        expect(bcrypt.hash).toHaveBeenCalledWith('1234', 10)
    });

    it('should throw error on creating new user', async function () {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                save: jest.fn().mockRejectedValueOnce( {message: 'Could not create user.'})
            })),
        }));

        // @ts-ignore
        jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce('hashedPassword')

        const mockReq = mockRequest().body = {body: {...mockUser}} as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await CreateUser(mockReq, mockRes);

        expect(mockRes.send).toHaveBeenCalledWith({message: 'Could not create user.'})
        expect(mockRes.status).toHaveBeenCalledWith(400)
    });

    it('should get user by id', async () => {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                findOne: jest.fn().mockResolvedValueOnce( {id: 123, ...mockUser})
            })),
        }));

        const mockReq = mockRequest() as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await GetUser(mockReq, mockRes);

        expect(mockRes.send).toHaveBeenCalledWith({
            id: 123,
            first_name: 'Ali',
            last_name: 'Jan',
            email: 'ali@wali.com',
            role_id: 1
        });
    });

    it('should throw error while getting user by id', async () => {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                findOne: jest.fn().mockResolvedValueOnce( null)
            })),
        }));

        const mockReq = mockRequest() as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await GetUser(mockReq, mockRes);

        expect(mockRes.send).toHaveBeenCalledWith({message: 'User not found.'});
    });

    it('should throw on update user', async () => {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                findOne: jest.fn().mockResolvedValueOnce(null)
            })),
        }));

        const mockReq = mockRequest() as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await UpdateUser(mockReq, mockRes);

        expect(mockRes.send).toHaveBeenCalledWith({message: 'User not found.'});
        expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should update user by id', async () => {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                findOne: jest.fn().mockImplementation(() => ({id: 123, ...mockUser}) ),
                update: jest.fn()
            })),
        }));

        const mockReq = {...mockRequest(), body: {...mockUser}} as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await UpdateUser(mockReq, mockRes);

        expect(mockRes.send).toHaveBeenCalledWith({
            id: 123,
            first_name: 'Ali',
            last_name: 'Jan',
            email: 'ali@wali.com',
            role_id: 1
        });
    });

    it('should delete user by id', async () => {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                findOne: jest.fn().mockImplementation(() => ({id: 123, ...mockUser}) ),
                delete: jest.fn()
            })),
        }));

        const mockReq = mockRequest() as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await DeleteUser(mockReq, mockRes);

        expect(mockRes.send).toHaveBeenCalledWith({message: 'success'});
    });

    it('should throw error while deleting user by id', async () => {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                findOne: jest.fn().mockResolvedValueOnce(null),
            })),
        }));

        const mockReq = mockRequest() as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await DeleteUser(mockReq, mockRes);

        expect(mockRes.send).toHaveBeenCalledWith({message: 'User not found.'});
        expect(mockRes.status).toHaveBeenCalledWith(404)
    });
})
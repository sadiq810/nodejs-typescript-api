import {Register, Login, AuthenticatedUser, Logout, UpdateProfile, UpdatePassword} from "./auth.controller";
import {Request, Response} from "express";
import * as typeorm from 'typeorm';
import {RegisterValidation} from "../validation/register.validation";
import bcrypt from "bcrypt";
import {getManager} from "typeorm";
import jwt from 'jsonwebtoken'

const mockRequest = () => ({
    body: {
    }
});

const mockResponse = () => ({
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    record: jest.fn(),
    cookie: jest.fn(),
})

afterEach(() => {
    jest.restoreAllMocks();
})

const mockUser = {
    first_name: 'ali',
    last_name: 'wali',
    email: 'ali@gmail.com',
    password: 'abc12345',
    password_confirm: 'abc12345'
};

jest.mock("../entity/user.entity", () => ({}));

jest.mock('typeorm', () => ({
    getManager: jest.fn().mockReturnThis(),
    getRepository: jest.fn().mockReturnThis(),
}))


describe('(Auth) - Register', () => {
    test("should throw validation error" , async () => {
        // @ts-ignore
       jest.spyOn(RegisterValidation, 'validate').mockImplementationOnce(() => ({error: {details: 'Validation error'}}))
        const mockReq = mockRequest() as Request;
        const mockRes = mockResponse() as unknown as Response;

        await Register(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.send).toHaveBeenCalledWith('Validation error')
        expect(RegisterValidation.validate).toHaveBeenCalledWith({})
    });

    it('should throw password mis match error', async () => {
        const mockReq = mockRequest().body = {body: {
                ...mockUser,
                password_confirm: 'abc1234533'
            }} as Request;

        const mockRes = mockResponse() as unknown as Response;

        await Register(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.send).toHaveBeenCalledWith({
            message: "Password don't match."
        })

    });

    it('should create a new user', async () => {
        // @ts-ignore
        jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce(`hashedPassword`);
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                save: jest.fn().mockImplementationOnce(() => ({
                    id: 1,
                    first_name: 'ali',
                    last_name: 'wali',
                    email: 'ali@gmail.com'
                }))
            }))
        }))

        const mockReq = mockRequest().body = {body: mockUser} as Request;

        const mockRes = mockResponse() as unknown as Response;

        await Register(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.send).toHaveBeenCalledWith({
            id: 1,
            first_name: 'ali',
            last_name: 'wali',
            email: 'ali@gmail.com'
        });

        expect(bcrypt.hash).toHaveBeenCalledWith('abc12345', 10)
    });

    it('should throw user creation error', async () => {
        // @ts-ignore
        jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce(`hashedPassword`);
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                save: jest.fn().mockRejectedValueOnce({message: 'User can not be created'})
            }))
        }))

        const mockReq = mockRequest().body = {body: mockUser} as Request;

        const mockRes = mockResponse() as unknown as Response;

        await Register(mockReq, mockRes)

        expect(bcrypt.hash).toHaveBeenCalledWith('abc12345', 10)
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith({message: 'User can not be created'});
    });
});

describe('(Auth) - Login', () => {
    it('should throw invalid credentials error', async () => {

        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
                getRepository: jest.fn().mockImplementationOnce(() => ({
                    findOne: jest.fn().mockResolvedValueOnce(undefined)
                }))
            }));

        const mockReq = mockRequest().body = {body: {email: 'test@gmail.com', password: '12345678'}} as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await Login(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.send).toHaveBeenCalledWith({message: 'Invalid Credentials.'})
    });

    it('should throw password mis-match error', async () => {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
                getRepository: jest.fn().mockImplementationOnce(() => ({
                    findOne: jest.fn().mockResolvedValueOnce(mockUser)
                }))
            }));

        // @ts-ignore
        jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false)

        const mockReq = mockRequest().body = {body: {email: 'test@gmail.com', password: '12345678'}} as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await Login(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.send).toHaveBeenCalledWith({message: 'Invalid Credentials.'})
        expect(bcrypt.compare).toHaveBeenCalledWith('12345678', 'abc12345')
    });

    it('should login user', async () => {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                findOne: jest.fn().mockResolvedValueOnce(mockUser)
            }))
        }));

        // @ts-ignore
        jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true)

        // @ts-ignore
        jest.spyOn(jwt, 'sign').mockResolvedValueOnce('jwt_token')

        const mockReq = mockRequest().body = {body: {email: 'test@gmail.com', password: '12345678'}} as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await Login(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.cookie).toHaveBeenCalledTimes(1);
        expect(jwt.sign).toHaveBeenCalledTimes(1);
        expect(mockRes.send).toHaveBeenCalledWith({message: 'success'})
    });

    it('should get authenticated user', async function () {
        const mockReq = {...mockRequest(), user: {
                id: 1,
                first_name: 'ali',
                last_name: 'wali',
                email: 'ali@gmail.com',
                password: 'abc12345'
            }} as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await AuthenticatedUser(mockReq, mockRes);

        expect(mockRes.send).toHaveBeenCalledWith({
            id: 1,
            first_name: 'ali',
            last_name: 'wali',
            email: 'ali@gmail.com',
        })
    });

    it('should update user profile', async () => {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                update: jest.fn(),
                findOne: jest.fn().mockResolvedValueOnce({
                    id: 1,
                    first_name: 'ali',
                    last_name: 'wali',
                    email: 'ali@gmail.com',
                    password: 'abc12345'
                }),
            }))
        }));

        const mockReq = {...mockRequest(), user: {
                id: 1,
                first_name: 'ali',
                last_name: 'wali',
                email: 'ali@gmail.com',
            }} as unknown as Request;

        const mockRes = mockResponse() as unknown as Response;

        await UpdateProfile(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.send).toHaveBeenCalledWith({
            id: 1,
            first_name: 'ali',
            last_name: 'wali',
            email: 'ali@gmail.com',
        })
    });
});

describe('(Auth) - Update Password', () => {
    it('should throw old password mis-match error', async () => {
        // @ts-ignore
        jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false)

        const mockReq = {...mockRequest(),
            body: {
            old_password: '23423423423'
            },
            user: {
                id: 1,
                first_name: 'ali',
                last_name: 'wali',
                email: 'ali@gmail.com',
                password: '234342343'
            }} as unknown as Request;

        const mockRes = mockResponse() as unknown as Response;

        await UpdatePassword(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.send).toHaveBeenCalledWith({message: 'Old password did not match.'})
    });

    it('should update user password', async () => {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockReturnThis(),
            update: jest.fn()
        }))

        // @ts-ignore
        jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true)

        // @ts-ignore
        jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce('hashedPassword')

        const mockReq = {...mockRequest(),
            body: {
            old_password: '234342343',
                password: 'newPassword'
            },
            user: {
                id: 1,
                first_name: 'ali',
                last_name: 'wali',
                email: 'ali@gmail.com',
                password: '234342343'
            }} as unknown as Request;

        const mockRes = mockResponse() as unknown as Response;

        await UpdatePassword(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.send).toHaveBeenCalledWith({message: 'success'})
        expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10)
        expect(bcrypt.compare).toHaveBeenCalledWith('234342343', '234342343')
    });
});

describe('Auth - logout', () => {
    it('should logout the user', async () => {
        const mockReq = mockRequest() as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await Logout(mockReq, mockRes);

        expect(mockRes.send).toHaveBeenCalledWith({
            message: 'success'
        })
        expect(mockRes.cookie).toHaveBeenCalledWith('jwt', '', {maxAge: 0})
    });
})
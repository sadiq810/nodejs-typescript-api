import {Request, Response} from "express";
import jwt from "jsonwebtoken";
import * as typeorm from "typeorm";
import {AuthMiddleware} from "./auth.middleware";

jest.mock('../entity/user.entity', () => ({}))
jest.mock('typeorm', () => ({
    getManager: jest.fn().mockReturnThis(),
    getRepository: jest.fn().mockReturnThis(),
}))

const mockRequest = () => ({
    cookies: {jwt: 'jwt_token'}
});

const mockResponse = () => ({
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
})

const mockNext = jest.fn();

afterEach(() => jest.restoreAllMocks())

describe('Auth Middleware', () => {
    it('should throw unauthenticated error', async () => {
        // @ts-ignore
        jest.spyOn(jwt, 'verify').mockImplementationOnce(() => (null))

        const mockReq = mockRequest() as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await AuthMiddleware(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.send).toHaveBeenCalledWith({message: 'unauthenticated'})
    });

    it('should pass authentication', async () => {
        // @ts-ignore
        jest.spyOn(jwt, 'verify').mockImplementationOnce(() => ({user_id: 1}))

        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                findOne: jest.fn()
            }))
        }));

        const mockReq = mockRequest() as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await AuthMiddleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
    });

    it('should throw user not found error', async () => {
        // @ts-ignore
        jest.spyOn(jwt, 'verify').mockImplementationOnce(() => ({user_id: 1}))

        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                findOne: jest.fn().mockRejectedValueOnce(null)
            }))
        }));

        const mockReq = mockRequest() as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await AuthMiddleware(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.send).toHaveBeenCalledWith({message: 'unauthenticated'})
    });
})
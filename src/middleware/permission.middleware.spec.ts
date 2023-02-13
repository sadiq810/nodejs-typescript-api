import {Request, Response} from "express";
import {PermissionMiddleware} from "./permission.middleware";

jest.mock('../entity/user.entity', () => ({}))


const mockRequest = () => ({
    method: 'GET',
    user: {
        role: {
            permissions: [{title: 'view_allow'},{title: 'edit_allow'}]
        }
    }
});

const mockResponse = () => ({
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
})

const mockNext = jest.fn();

afterEach(() => jest.restoreAllMocks())

describe('Permission Middleware', () => {
    it('should throw unauthorized error - GET', async () => {
        const mockReq = {...mockRequest(), user: {role: {permissions: []}}} as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await PermissionMiddleware('allow')(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.send).toHaveBeenCalledWith({message: 'unauthorized'})
    });

    it('should throw unauthorized error - POST', async () => {
        const mockReq = {...mockRequest(), method: 'POST', user: {role: {permissions: []}}} as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await PermissionMiddleware('allow')(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.send).toHaveBeenCalledWith({message: 'unauthorized'})
    });

    it('should pass the authorization', async () => {
        const mockReq = mockRequest() as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await PermissionMiddleware('allow')(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledTimes(1)
    });
})
import * as typeorm from 'typeorm';
import {Permissions} from "./permission.controller";
import {Request, Response} from "express";

const mockRequest = () => ({
    body: {},
    query: {},
    params: {}
});

const mockResponse = () => ({
    status: jest.fn().mockReturnThis(),
    send: jest.fn()
});

type permission = {
    id: number
    title: string,
};

const mockPermission: permission = {
    id: 1,
    title: 'edit'
}

jest.mock("../entity/permission.entity", () => ({}));

jest.mock("typeorm", () => ({
    getManager: jest.fn().mockReturnThis(),
    getRepository: jest.fn().mockReturnThis(),
}));

afterEach(() => jest.restoreAllMocks());

describe('Permission Controller', () => {
    it('should return list of permissions', async function () {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                find: jest.fn().mockImplementationOnce(() => ([mockPermission]))
            }))
        }));

        const mockReq = mockRequest() as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await Permissions(mockReq, mockRes);

        expect(mockRes.send).toHaveBeenCalledWith([mockPermission])
    });
})
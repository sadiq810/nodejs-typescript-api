import * as typeorm from 'typeorm';
import {Roles, CreateRole, DeleteRole, GetRole, UpdateRole} from "./role.controller";
import {Request, Response} from "express";

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

type role = {
    id: number
    title: string,
};

const mockRole: role = {
    id: 1,
    title: 'Admin'
}

jest.mock("../entity/role.entity", () => ({}));

jest.mock("typeorm", () => ({
    getManager: jest.fn().mockReturnThis(),
    getRepository: jest.fn().mockReturnThis(),
}));

afterEach(() => jest.restoreAllMocks());

describe('Role Controller', () => {
    it('should return roles list - Roles', async () => {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                find: jest.fn().mockImplementationOnce(() => ([mockRole]))
            }))
        }));

        const mockReq = mockRequest() as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await Roles(mockReq, mockRes);

        expect(mockRes.send).toHaveBeenCalledWith([mockRole])
    });

    it('should create role - CreateRole', async () => {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                save: jest.fn().mockImplementationOnce(() => (mockRole))
            }))
        }));

        const mockReq = mockRequest().body = {body: {title: 'First Role', permissions: []}} as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await CreateRole(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.send).toHaveBeenCalledWith(mockRole);
    });

    it('should throw error while creating role - CreateRole', async () => {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                save: jest.fn().mockRejectedValueOnce({message: 'Internal server error'})
            }))
        }));

        const mockReq = mockRequest().body = {body: {title: 'First Role', permissions: []}} as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await CreateRole(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500)
        expect(mockRes.send).toHaveBeenCalledWith({error: 'Internal server error'})
    });

    it('should get role by id - GetRole', async () => {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                findOne: jest.fn().mockImplementationOnce(() => mockRole)
            }))
        }));

        const mockReq = mockRequest() as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await GetRole(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.send).toHaveBeenCalledWith(mockRole)
    });

    it('should throw role not found error - GetRole', async () => {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                findOne: jest.fn().mockImplementationOnce(() => null)
            }))
        }));

        const mockReq = mockRequest() as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await GetRole(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(404)
        expect(mockRes.send).toHaveBeenCalledWith(null)
    });

    it('should throw error - GetRole', async () => {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                findOne: jest.fn().mockRejectedValueOnce({message: 'Internal server error'})
            }))
        }));

        const mockReq = mockRequest() as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await GetRole(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500)
        expect(mockRes.send).toHaveBeenCalledWith({error: 'Internal server error'})
    });

    it('should throw error - UpdateRole', async () => {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                save: jest.fn().mockRejectedValueOnce({message: 'Internal server error'})
            }))
        }));

        const mockReq = {...mockRequest(), body: {title: 'Test Role', permissions: []}} as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await UpdateRole(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500)
        expect(mockRes.send).toHaveBeenCalledWith({error: 'Internal server error'})
    });

    it('should update role - UpdateRole', async () => {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                save: jest.fn().mockResolvedValueOnce(mockRole)
            }))
        }));

        const mockReq = {...mockRequest(), body: {title: 'Test Role', permissions: []}} as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await UpdateRole(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(202)
        expect(mockRes.send).toHaveBeenCalledWith(mockRole)
    });

    it('should throw error - DeleteRole', async () => {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                delete: jest.fn().mockRejectedValueOnce({message: 'Internal server error'})
            }))
        }));

        const mockReq = mockRequest() as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await DeleteRole(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500)
        expect(mockRes.send).toHaveBeenCalledWith({error: 'Internal server error'})
    });

    it('should delete role - DeleteRole', async () => {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                delete: jest.fn()
            }))
        }));

        const mockReq = mockRequest() as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await DeleteRole(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(204)
        expect(mockRes.send).toHaveBeenCalledWith(null)
    });
});
import * as typeorm from 'typeorm';
import {
    Orders,
    Export,
    Chart
} from "./order.controller";
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

afterEach(() => {
    jest.restoreAllMocks();
})

jest.mock("../entity/order.entity", () => ({}));
jest.mock("../entity/order-item.entity", () => ({}));

jest.mock('typeorm', () => ({
    getManager: jest.fn().mockReturnThis(),
    getRepository: jest.fn().mockReturnThis(),
}));

jest.mock('json2csv', () => ({
    Parser: jest.fn().mockImplementationOnce(() => ({
        parse: jest.fn().mockImplementationOnce(() => ({}))
    })),
}));

describe('Order Controller', () => {
    it('should get list of the orders: Orders()', async () => {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                findAndCount: jest.fn().mockResolvedValueOnce([[], 100])
            }))
        }))

        const mockReq = mockRequest() as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await Orders(mockReq, mockRes);

        expect(mockRes.send).toHaveBeenCalledWith({
            data: [],
            meta: {
                total: 100,
                page: 1,
                last_page: 7
            }
        })
    });

    it('should export list of the orders: Export()', async () => {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                find: jest.fn().mockImplementationOnce(() => ([]))
            }))
        }))

        const mockReq = mockRequest() as unknown as Request;
        const mockRes = {...mockResponse(), header: jest.fn(), attachment: jest.fn()} as unknown as Response;

        await Export(mockReq, mockRes);

        expect(mockRes.send).toHaveBeenCalledWith({});
        expect(mockRes.header).toHaveBeenCalledWith('Content-Type', 'text/csv');
        expect(mockRes.attachment).toHaveBeenCalledWith('orders.csv');
    });

    it('should get chart: Chart()', async () => {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            query: jest.fn().mockImplementationOnce(() => ([]))
        }))

        const mockReq = mockRequest() as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await Chart(mockReq, mockRes);

        expect(mockRes.send).toHaveBeenCalledWith([]);
    });
})
import * as typeorm from 'typeorm';
import {
    Products,
    CreateProduct,
    GetProduct,
    UpdateProduct,
    DeleteProduct
} from "./product.controller";
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

type product = {
    title: string,
    detail: string,
    image?: string,
    price: number
};

const mockProduct: product = {
    title: 'Iphone',
    detail: 'some test detail of the product',
    image: '',
    price: 100.90
}

afterEach(() => {
    jest.restoreAllMocks();
})

jest.mock("../entity/product.entity", () => ({}));

jest.mock('typeorm', () => ({
    getManager: jest.fn().mockReturnThis(),
    getRepository: jest.fn().mockReturnThis(),
}));

describe('Product Controller', () => {
    it('should get list of the products: Products()', async () => {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                findAndCount: jest.fn().mockResolvedValueOnce([[{id: 1, ...mockProduct}], 100])
            }))
        }))

        const mockReq = mockRequest() as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await Products(mockReq, mockRes);

        expect(mockRes.send).toHaveBeenCalledWith({
            data: [{id: 1, ...mockProduct}],
            meta: {
                total: 100,
                page: 1,
                last_page: 7
            }
        })
    });

    it('should create new product: CreateProduct()', async () => {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                save: jest.fn().mockResolvedValueOnce({id: 1, ...mockProduct})
            }))
        }))

        const mockReq = mockRequest() as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await CreateProduct(mockReq, mockRes);

        expect(mockRes.send).toHaveBeenCalledWith({id: 1, ...mockProduct})
    });

    it('should throw error while creating new product: CreateProduct()', async () => {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                save: jest.fn().mockRejectedValueOnce({message: 'Internal server error'})
            }))
        }))

        const mockReq = mockRequest() as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await CreateProduct(mockReq, mockRes);

        expect(mockRes.send).toHaveBeenCalledWith({message: 'Internal server error'});
        expect(mockRes.status).toHaveBeenCalledWith(400)
    });

    it('should get product by id: GetProduct()', async () => {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                findOne: jest.fn().mockResolvedValueOnce({id: 1, ...mockProduct})
            }))
        }))

        const mockReq = mockRequest() as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await GetProduct(mockReq, mockRes);

        expect(mockRes.send).toHaveBeenCalledWith({id: 1, ...mockProduct})
    });

    it('should throw product not found error: GetProduct()', async () => {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                findOne: jest.fn().mockResolvedValueOnce(null)
            }))
        }))

        const mockReq = mockRequest() as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await GetProduct(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(404)
        expect(mockRes.send).toHaveBeenCalledWith({message: 'Product not found.'})
    });

    it('should update product by id: UpdateProduct()', async () => {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                findOne: jest.fn().mockResolvedValue({id: 1, ...mockProduct}),
                update: jest.fn()
            }))
        }))

        const mockReq = mockRequest() as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await UpdateProduct(mockReq, mockRes);

        expect(mockRes.send).toHaveBeenCalledWith({id: 1, ...mockProduct})
    });

    it('should throw product not found error: UpdateProduct()', async () => {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                findOne: jest.fn().mockResolvedValue(null),
                update: jest.fn()
            }))
        }))

        const mockReq = mockRequest() as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await UpdateProduct(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(404)
        expect(mockRes.send).toHaveBeenCalledWith({message: 'Product not found.'})
    });

    it('should delete product by id: DeleteProduct()', async () => {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                findOne: jest.fn().mockResolvedValue({id: 1, ...mockProduct}),
                delete: jest.fn()
            }))
        }))

        const mockReq = mockRequest() as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await DeleteProduct(mockReq, mockRes);

        expect(mockRes.send).toHaveBeenCalledWith({message: 'success'})
    });

    it('should throw product not found error while deleting product by id: DeleteProduct()', async () => {
        // @ts-ignore
        jest.spyOn(typeorm, 'getManager').mockImplementationOnce(() => ({
            getRepository: jest.fn().mockImplementationOnce(() => ({
                findOne: jest.fn().mockResolvedValue(null),
                delete: jest.fn()
            }))
        }))

        const mockReq = mockRequest() as unknown as Request;
        const mockRes = mockResponse() as unknown as Response;

        await DeleteProduct(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(404)
        expect(mockRes.send).toHaveBeenCalledWith({message: 'Product not found.'})
    });
})
import {Request, Response} from "express";
import {getManager} from "typeorm";
import Product from "../entity/product.entity";

export const Products = async (req: Request, res: Response) => {
    const take = 15;
    const page = parseInt(req.query.page as string || '1');

    let repository = getManager().getRepository(Product);

    let [data, total] = await repository.findAndCount({
        take,
        skip: (page - 1) * take
    });

    res.send({
        data,
        meta: {
            total,
            page,
            last_page: Math.ceil(total/take)
        }
    });
}

export const CreateProduct = async (req: Request, res: Response) => {
    try {
        let repository = getManager().getRepository(Product);

        let product = await repository.save(req.body);

        res.send(product);
    } catch (e: any) {
        res.status(400).send({message: e.message});
    }
}

export const GetProduct = async (req: Request, res: Response) => {
    let repository = getManager().getRepository(Product);

    let product = await repository.findOne(req.params.id);

    if (! product)
        return res.status(404).send({message: 'Product not found.'});

    res.send(product);
}

export const UpdateProduct = async (req: Request, res: Response) => {
    let repository = getManager().getRepository(Product);

    let product = await repository.findOne(req.params.id);

    if (! product)
        return res.status(404).send({message: 'Product not found.'});

    await repository.update(req.params.id, req.body);

    product = await repository.findOne(req.params.id);

    res.send(product);
}


export const DeleteProduct = async (req: Request, res: Response) => {
    let repository = getManager().getRepository(Product);

    let product = await repository.findOne(req.params.id);

    if (! product)
        return res.status(404).send({message: 'Product not found.'});

    await repository.delete(product.id);

    res.send({message: 'success'});
}

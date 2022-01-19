import {Request, Response} from "express";
import {getManager} from "typeorm";
import {User} from "../entity/user.entity";
import bcrypt from "bcrypt";

export const Users = async (req: Request, res: Response) => {
    const take = 10;
    const page = parseInt(req.query.page as string || '1');

    let repository = getManager().getRepository(User);

    let [data, total] = await repository.findAndCount({
        take,
        skip: (page - 1) * take,
        relations: ['role']
    });

    let list = data.map(u => {
        let {password, ...data} = u;

        return data;
    });

    res.send({
        data: list,
        meta: {
            total,
            page,
            last_page: Math.ceil(total/take)
        }
    });
}

export const CreateUser = async (req: Request, res: Response) => {
    try {
        let repository = getManager().getRepository(User);
        let {role_id, ...body} = req.body;

        let hash = await bcrypt.hash('1234', 10);
        let {password, ...user} = await repository.save({
            ...body,
            password: hash,
            role: {
                id: role_id
            }
        });

        res.send(user);
    } catch (e: any) {
        res.status(400).send({message: e.message});
    }
}

export const GetUser = async (req: Request, res: Response) => {
    let repository = getManager().getRepository(User);

    let user = await repository.findOne(req.params.id, {
        relations: ['role']
    });

    if (! user)
        return res.status(404).send({message: 'User not found.'});

    let {password, ...data} = user;

    res.send(data);
}

export const UpdateUser = async (req: Request, res: Response) => {
    let repository = getManager().getRepository(User);

    let user = await repository.findOne(req.params.id);

    if (! user)
        return res.status(404).send({message: 'User not found.'});

    let {role_id, ...body} = req.body;

    if (role_id)
        body.role = {id: role_id};

    await repository.update(user.id, {
        ...body
    });

    let {password, ...data} = await repository.findOne(req.params.id);

    res.send(data);
}


export const DeleteUser = async (req: Request, res: Response) => {
    let repository = getManager().getRepository(User);

    let user = await repository.findOne(req.params.id);

    if (! user)
        return res.status(404).send({message: 'User not found.'});

    await repository.delete(user.id);

    res.send({message: 'success'});
}

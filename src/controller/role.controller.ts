import {Request, Response} from "express";
import {getManager} from "typeorm";
import {Role} from "../entity/role.entity";

export const Roles = async (req: Request, res: Response) => {
    let repository = getManager().getRepository(Role);

    res.send(await repository.find());
}

export const CreateRole = async (req: Request, res: Response) => {
    try {
        let {title, permissions} = req.body;
        let repository = getManager().getRepository(Role);
        let role = await repository.save({
            title,
            permissions: permissions.map(id => ({id}))
        });

        res.status(201).send(role);
    } catch (e) {
        res.status(500).send({error: e.message})
    }
}

export const GetRole = async (req: Request, res: Response) => {
    try {
        let repository = getManager().getRepository(Role);
        let role = await repository.findOne(req.params.id, {relations: ['permissions']});

        res.status(role ? 200: 404).send(role);
    } catch (e) {
        res.status(500).send({error: e.message})
    }
}

export const UpdateRole = async (req: Request, res: Response) => {
    try {
        let {title, permissions} = req.body;

        let repository = getManager().getRepository(Role);

        let role = await repository.save({
            id: parseInt(req.params.id),
            title,
            permissions: permissions.map(id => ({id}))
        });

        res.status(202).send(role);
    } catch (e) {
        res.status(500).send({error: e.message})
    }
}

export const DeleteRole = async (req: Request, res: Response) => {
    try {
        let repository = getManager().getRepository(Role);

        await repository.delete(req.params.id);

        res.status(204).send(null);
    } catch (e) {
        res.status(500).send({error: e.message})
    }
}

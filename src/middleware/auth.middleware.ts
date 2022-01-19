import {Request, Response} from "express";
import jwt from "jsonwebtoken";
import {getManager} from "typeorm";
import {User} from "../entity/user.entity";

export const AuthMiddleware = async (req: Request, res: Response, next: Function) => {
    try {
        let token = req.cookies['jwt'];
        let payload: any = jwt.verify(token, process.env.JWT_SECRET);

        if (! payload) {
            return res.status(401).send({message: 'unauthenticated'});
        }

        let repository = getManager().getRepository(User);

        req['user'] = await repository.findOne({id: payload.user_id}, {relations: ['role', 'role.permissions']});

        next();
    } catch (e: any) {
        res.status(401).send({message: 'unauthenticated'});
    }
}

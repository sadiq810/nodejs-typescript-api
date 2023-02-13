import {Request, Response} from "express";
import {User} from "../entity/user.entity";

export const PermissionMiddleware = (access: string) => {
    return (req: Request, res: Response, next: Function) => {
        const user: User = req['user'];
        const permissions = user.role && user.role.permissions ? user.role.permissions: [];

        if (req.method == 'GET') {
            if (! permissions.some(p => (p.title === `view_${access}` || p.title === `edit_${access}`))) {
                return res.status(401).send({
                    message: 'unauthorized'
                })
            }
        } else {
            if (! permissions.some(p => (p.title === `edit_${access}`))) {
                return res.status(401).send({
                    message: 'unauthorized'
                })
            }
        }

        next();
    }
}

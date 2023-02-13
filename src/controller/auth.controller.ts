import {Request, response, Response} from "express";
import {RegisterValidation} from "../validation/register.validation";
import {getManager} from "typeorm";
import {User} from "../entity/user.entity";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

export const Register = async (req: Request, res: Response) => {
    let body = req.body;

    let {error} = RegisterValidation.validate(body);

    if (error) {
        return res.status(400).send(error.details);
    }

    if (body.password !== body.password_confirm) {
        return res.status(400).send({
            message: "Password don't match."
        });
    }

    let hashedPassword = await bcrypt.hash(req.body.password, 10);

    const repository = getManager().getRepository(User);

    try {
        const {password, ...user} = await repository.save({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: hashedPassword,
            role: {
                id: 1
            }
        });

        res.status(201).send(user);
    } catch (e: any) {
        res.status(500).send({message: e.message});
    }
}

export const Login = async (req: Request, res: Response) => {
    let repository = getManager().getRepository(User);

    let user = await repository.findOne({email: req.body.email});

    if (! user) {
        return res.status(404).send({message: 'Invalid Credentials.'})
    }

    let isMatch = await bcrypt.compare(req.body.password, user.password);

    if (! isMatch)
        return res.status(404).send({message: "Invalid Credentials."});

    let token = jwt.sign({user_id: user.id}, process.env.JWT_SECRET);

    res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 *1000 //1 day.
    });

    res.status(200).send({
        message: 'success'
    });
}

export const AuthenticatedUser = async (req: Request, res: Response) => {
    let {password, ...user} = req['user'];
    res.send(user);
}

export const Logout = async (req: Request, res: Response) => {
    res.cookie('jwt', '', {maxAge: 0});

    res.send({message: 'success'});
}

export const UpdateProfile = async (req: Request, res: Response) => {
    let user = req['user'];

    let repository = getManager().getRepository(User);

    await repository.update(user.id, req.body);

    let {password, ...data} = await repository.findOne(user.id);

    res.status(200).send(data);
}

export const UpdatePassword = async (req: Request, res: Response) => {
    let user = req['user'];

    let isMatch = await bcrypt.compare(req.body.old_password, user.password);

    if (! isMatch)
        return res.status(400).send({message: 'Old password did not match.'});

    let repository = getManager().getRepository(User);
    let hashedPassword = await bcrypt.hash(req.body.password, 10);

    await repository.update(user.id, {
        password: hashedPassword
    });

    res.status(200).send({message: 'success'});
}

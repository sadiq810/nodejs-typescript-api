import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn} from "typeorm";
import {Role} from "./role.entity";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 255
    })
    first_name: string;

    @Column({
        length: 255
    })
    last_name: string;

    @Column( {
        unique: true,
        length: 255
    })
    email: string;

    @Column()
    password: string;

    @ManyToOne(() => Role)
    @JoinColumn({name: 'role_id'})
    role: Role
}

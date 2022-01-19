import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export default class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({
        type: 'text'
    })
    detail: string;

    @Column({
        nullable: true
    })
    image: string

    @Column({
        type: 'float',
        default: 0
    })
    price: number
}

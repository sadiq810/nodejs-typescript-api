import {createConnection, getManager} from "typeorm";
import Product from "../entity/product.entity";
import faker from 'faker';
import {Order} from "../entity/order.entity";
import {OrderItem} from "../entity/order-item.entity";
import {randomInt} from "crypto";

createConnection().then(async connection => {
   let orderRepository = getManager().getRepository(Order);
   let orderItemRepository = getManager().getRepository(OrderItem);

   for (let i=0; i<30; i++) {
       const order = await orderRepository.save({
          first_name: faker.name.firstName(),
          last_name: faker.name.lastName(),
           email: faker.internet.email(),
           created_at: faker.date.past(randomInt(5)).toDateString()
       });

       for (let j=0; j<randomInt(2, 8); j++) {
           await orderItemRepository.save({
               order,
               product_title: faker.lorem.words(2),
               price: faker.datatype.number(100),
               quantity: randomInt(1, 5)
           });
       }
   }

   process.exit(0);
});

import {createConnection, getManager} from "typeorm";
import Product from "../entity/product.entity";
import faker from 'faker';

createConnection().then(async connection => {
   let repository = getManager().getRepository(Product);

   for (let i=0; i<30; i++) {
       await repository.save({
          title: faker.lorem.words(2),
          detail: faker.lorem.words(20),
           image: faker.image.imageUrl(200, 200, '', true),
           price: faker.datatype.number(100)
       });
   }

   process.exit(0);
});

import "reflect-metadata";
import {createConnection} from "typeorm";

import app from './app';

require('dotenv').config();

createConnection().then(connection => {
    app.listen(8000, () => {
        console.log('Server is listening on port: 8000');
    })
});



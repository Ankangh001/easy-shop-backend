const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/errorhadler');

app.use(cors());
app.options('*', cors());

//MiddleWare
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use(errorHandler);
app.use('/public/uploads',  express.static(__dirname + '/public/uploads'));

//Routes
const api = process.env.API_URL;

const productRouter = require('./routes/products');
const categoriesRouter = require('./routes/categories');
const usersRouter = require('./routes/users');
const ordersRouter = require('./routes/orders');

app.use(`${api}/products`, productRouter);
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/orders`, ordersRouter);

//Database
mongoose.connect(process.env.DB)
    .then(() => {
        console.log("succes db");
    }).catch((err) => {
        console.log(err);
    })

//Server
app.listen(3000, () => {
    console.log("SERVER STARTED AT PORT 3000")
})
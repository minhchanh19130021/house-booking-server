
import express from 'express';
import middewareController from '../controllers/MiddewareController';
import OrderController from '../controllers/OrderController';
const bodyParser = require('body-parser');


let router = express.Router();

const initOrderRoute = (app) => {

    
  router.use(bodyParser.json());
  router.post("/newBooking", OrderController.bookingHome);

    router.post('/orderByIdUser', OrderController.getOrderByIdUser);
    router.post('/orderByIdUserAndDate', OrderController.getOrderByIdUserAndDate);
    router.post('/orderByIdUserAndMonth', OrderController.getOrderByIdUserAndMonth);
    router.post('/orderByHomeCategoriesOneWeek', OrderController.getOrderByHomeCategoriesOneWeek);
    router.post('/orderByHomeCategoriesOneMonth', OrderController.getOrderByHomeCategoriesOneMonth);
    router.post('/orderByHomeCategoriesThreeMonth', OrderController.getOrderByHomeCategoriesThreeMonth);
    router.post('/orderByHomeCategoriesOneYear', OrderController.getOrderByHomeCategoriesOneYear);

    router.use(bodyParser.json());
    return app.use('/api/v1/', router);
};

export default initOrderRoute;


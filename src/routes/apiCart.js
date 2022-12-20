import express from 'express';
import CartController from '../controllers/CartController';
import middewareController from '../controllers/MiddewareController';

const router = express.Router();

const initCartRoute = (app) => {
    router.post('/cart/get', middewareController.verifyToken, (req,  res) => {
        CartController.getAllCartDetailByUserId(req, res);
    });
    router.put('/cart/put', middewareController.verifyToken, (req, res) => {
        CartController.putNewCartDetail(req, res);
    });
    router.delete('/cart/delete', middewareController.verifyToken, (req, res) => {
        CartController.deleteCartDetail(req, res);
    });
    return app.use('/api/v2/', router);
};

export default initCartRoute;

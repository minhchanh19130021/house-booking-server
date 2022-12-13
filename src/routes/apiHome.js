import express from 'express';
import HomeController from '../controllers/HomeController';

const router = express.Router();

const initFacilityRoute = (app) => {
    router.get('/houses', (req, res) => {
        HomeController.getAllHome(req, res);
    });
    router.get('/houses/city/:slug/:pagination', (req, res) => {
        HomeController.getAllHomeByCity(req, res);
    });
    router.get('/houses/newest', (req, res) => {
        HomeController.getNewestHome(req, res);
    });
    router.get('/houses/best_selling', (req, res) => {
        HomeController.getBestSellingHome(req, res);
    });
    router.post('/detail', (req, res) => {
        HomeController.getDetailHomeById(req, res);
    });
    router.post('/review', (req, res) => {
        HomeController.loadAllReviewByIdHome(req, res);
    });

    return app.use('/api/v2/', router);
};

export default initFacilityRoute;

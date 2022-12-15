import express from "express";
import ReviewController from "../controllers/ReviewController";
import middewareController from '../controllers/MiddewareController';

let router = express.Router();

const initFacilityRoute = (app) => {
  router.get("/review/get", middewareController.verifyToken, (req, res) => {
    ReviewController.getReview(req, res);
  });
  router.put("/review/add", middewareController.verifyToken,(req, res) => {
    ReviewController.putAddNewReview(req, res);
  });

  return app.use("/api/v2/", router);
};

export default initFacilityRoute;

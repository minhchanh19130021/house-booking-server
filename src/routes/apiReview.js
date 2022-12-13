import express from "express";
import ReviewController from "../controllers/ReviewController";

let router = express.Router();

const initFacilityRoute = (app) => {
  router.get("/review/get", (req, res) => {
    ReviewController.getReview(req, res);
  });
  router.put("/review/add", (req, res) => {
    ReviewController.putAddNewReview(req, res);
  });

  return app.use("/api/v2/", router);
};

export default initFacilityRoute;

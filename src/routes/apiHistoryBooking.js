import express from "express";
import HistoryController from "../controllers/HistoryController";
import middewareController from '../controllers/MiddewareController';

let router = express.Router();

const initFacilityRoute = (app) => {
  router.post("/history-booking", middewareController.verifyToken, (req, res) => {
    HistoryController.getHistoryBooking(req, res);
  });

  return app.use("/api/v2/", router);
};

export default initFacilityRoute;

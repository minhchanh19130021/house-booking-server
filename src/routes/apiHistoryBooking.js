import express from "express";
import HistoryController from "../controllers/HistoryController";

let router = express.Router();

const initFacilityRoute = (app) => {
  router.get("/history-booking", (req, res) => {
    HistoryController.getHistoryBooking(req, res);
  });

  return app.use("/api/v2/", router);
};

export default initFacilityRoute;

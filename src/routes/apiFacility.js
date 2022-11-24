import express from "express";
import FacilityController from "../controllers/FacilityController";

let router = express.Router();

const initFacilityRoute = (app) => {
  router.get("/facilities", (req, res)=>{
    FacilityController.getAllFacilities(req, res)
  });
  return app.use("/api/v2/", router);
};

export default initFacilityRoute;

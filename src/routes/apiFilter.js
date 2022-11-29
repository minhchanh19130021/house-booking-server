import express from "express";
import FilterController from "../controllers/FilterController";

let router = express.Router();

const initFacilityRoute = (app) => {
  router.post("/filter", (req, res)=>{
    FilterController.getListHomeByFilter(req, res);
  });
  return app.use("/api/v2/", router);
};

export default initFacilityRoute;

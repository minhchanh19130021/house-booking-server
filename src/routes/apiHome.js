import express from "express";
import HouseController from "../controllers/HomeController";

let router = express.Router();

const initFacilityRoute = (app) => {
  router.get("/houses", (req, res)=>{
    HouseController.getAllHouses(req, res)
  });
  router.get("/houses/city/:slug/:pagination", (req, res)=>{
    HouseController.getAllHousesByCity(req, res)
  });
  return app.use("/api/v2/", router);
};

export default initFacilityRoute;

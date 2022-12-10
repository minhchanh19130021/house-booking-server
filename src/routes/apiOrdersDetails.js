import express from "express";
import OrdersDetailsController from "../controllers/OrdersDetailsController";
const bodyParser = require("body-parser");

let router = express.Router();

const initOrdersDetailsRoute = (app) => {
    
  router.use(bodyParser.json());
  router.post("/addOrdersDetail", OrdersDetailsController.addOrdersDetail);


  return app.use("/api/v1/", router);
};

export default initOrdersDetailsRoute;

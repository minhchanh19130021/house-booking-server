import express from "express";
import OrderController from "../controllers/OrderController";
const bodyParser = require("body-parser");

let router = express.Router();

const initOrderRoute = (app) => {
    
  router.use(bodyParser.json());
  router.post("/newBooking", OrderController.bookingHome);
  // router.get("/getIdOrders", OrderController.getAllIdOrders);


  return app.use("/api/v1/", router);
}; 

export default initOrderRoute;
 
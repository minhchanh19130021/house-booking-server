import express from "express";
import TestController from "../controllers/TestController";

let router = express.Router();

const initTestRoute = (app) => {
  router.get("/test", (req, res)=>{
    TestController.putAddNewHome(req, res)
  });

  return app.use("/api/v2/", router);
};

export default initTestRoute;

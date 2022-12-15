import express from "express";
import TestController from "../controllers/TestController";

let router = express.Router();

const initTestRoute = (app) => {
  router.post("/test", (req, res)=>{
    TestController.testApi(req, res)
  });

  return app.use("/api/v2/", router);
};

export default initTestRoute;

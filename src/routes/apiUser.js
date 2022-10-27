import express from "express";
import UserController from "../controllers/UserController";

let router = express.Router();

const initUserRoute = (app) => {
  router.get("/users", UserController.getAllUsers);
  router.post("/register", UserController.createNewUser);

  return app.use("/api/v2/", router);
};

export default initUserRoute;

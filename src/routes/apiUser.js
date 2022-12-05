import express from "express";
import middewareController from "../controllers/MiddewareController";
import UserController from "../controllers/UserController";
const bodyParser = require("body-parser");

let router = express.Router();

const initUserRoute = (app) => {
  router.post("/login", UserController.loginUser);
  router.post("/register", UserController.registerUser);
  router.get("/verify", UserController.verifyUser);
  router.post(
    "/logout",
    middewareController.verifyToken,
    UserController.logoutUser
  );
  router.post("/refreshToken", UserController.requestRefreshToken);
  router.post("/updateUser", UserController.updateUser);
  router.get("/requestResetPassword", UserController.requestResetPassword);

  router.use(bodyParser.json());

  return app.use("/api/v1/", router);
};

export default initUserRoute;

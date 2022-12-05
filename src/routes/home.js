import express from "express";
import {

  getHome,
  getHomes,

} from "../controllers/home.js";
const router = express.Router();



router.get("/find/:id", getHome);
//GET ALL

router.get("/", getHomes);


export default router;

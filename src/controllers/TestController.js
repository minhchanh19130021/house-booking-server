import Home from "../models/Home";
import { Types } from "mongoose";

require("dotenv").config();

let newHome = {
    "_id": new Types.ObjectId(), 
    "address": {
      "city": "Thủ Đức",
      "district": "Linh Trung",
      "area": "Việt Nam",
      "link": "404 not found",
      "number": "59E"
    },
    "name": "Test Home",
    "price": 1286740,
    "rate": 3,
    "number_review": 0,
    "introduce": "Bungalow bãi biển Cay Sao với khung cảnh biển tuyệt vời",
    "outstanding_facilities": [
      "636f4a79965585de92b3139b",
      "6372490f03fbfda255a6aeb1",
      "6372490f03fbfda255a6aeb2",
      "6372490f03fbfda255a6aeb3"
    ],
    "status": true
  }
  
let putAddNewHome = async (req, res, next) => {
    let home = new Home(newHome);
    home.save(function (err, home) {
        if (err) return console.error(err);
        console.log(home);
      });
    let query = Home.find({});
    query.exec(function (err, homes) {
      var result = [];
      homes.forEach(function (home) {
          result.push(home);
      });
      return res.status(200).json({
        success: true,
        data: result,
      });
    })
};

module.exports = {
    putAddNewHome,
  };
  
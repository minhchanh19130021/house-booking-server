import Home from "../models/Home";
import HomeDetail from "../models/HomeDetail";

require("dotenv").config();
const numberListHomeInOnePage = 3;

let getAllHome = async (req, res, next) => {
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

let getAllHomeByCity = async (req, res, next) => {
  Home.find({'address.city': req.params.slug})
  .populate({path: 'outstanding_facilities', option: {strictPopulate: false}})
  .skip((Number(req.params.pagination)-1) * numberListHomeInOnePage)
  .limit(3) 
  .exec(function (err, homes) {
    let result = [];
    homes.forEach(function (home) {
        result.push(home);
    });
    Home.countDocuments({'address.city': req.params.slug}, (err, countListHouse)=>{
      return res.status(200).json({
        success: true,
        data: result,
        pagination:  Math.floor(countListHouse / numberListHomeInOnePage) + (countListHouse % numberListHomeInOnePage)
      });
    })
  });
};

module.exports = {
  getAllHome,
  getAllHomeByCity
};

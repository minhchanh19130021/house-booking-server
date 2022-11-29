import Home from "../models/Home";
import HomeDetail from "../models/HomeDetail";

require("dotenv").config();

let getAllHouses = async (req, res, next) => {
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

let getAllHousesByCity = async (req, res, next) => {
  Home.find({'address.city': req.params.slug})
  .populate({path: 'outstanding_facilities', option: {strictPopulate: false}})
  .limit(3)
  .skip((req.params.pagination-1) * 3)
  .exec(function (err, homes) {
    let result = [];
    homes.forEach(function (home) {
        result.push(home);
    });
    return res.status(200).json({
      success: true,
      data: result,
    });
  });
};

module.exports = {
  getAllHouses,
  getAllHousesByCity
};

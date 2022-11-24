import Facility from "../models/Facility";
require("dotenv").config();

let getAllFacilities = async (req, res, next) => {
    Facility.find({}, function (err, facilities) {
    var result = [];
    facilities.forEach(function (facility) {
        result.push(facility);
    });
    return res.status(200).json({
      success: true,
      data: result,
    });
  });
};

module.exports = {
  getAllFacilities,
};

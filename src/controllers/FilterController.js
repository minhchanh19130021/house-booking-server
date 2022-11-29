import Home from "../models/Home";
import HomeDetail from "../models/HomeDetail";
import mongoose from "mongoose";

require("dotenv").config();

let getListHomeIdWithSpecified = async (facilities, numberBedroom, numberBathroom, numberBed) => {
  let condition = {}
  if (facilities.length != 0) {
    condition.facilities = {'$in': facilities};
  }
  condition.number_bedroom = numberBedroom == 0 ? {'$ne': 0}: numberBedroom;
  condition.number_bathroom = numberBathroom == 0 ? {'$ne': 0}: numberBathroom;
  condition.number_bed = numberBedroom == 0 ? {'$ne': 0}: numberBed;

  let query = HomeDetail.find(condition)
     .select("home_details._id ");
  query.exec(function (err, homes) {
    var result = [];
    homes.forEach(function (home) {
        result.push(home);
    });   
    return result;
  })
}
let getListHomeByFilter = async (req, res, next) => {
  // '$options': 'i': not capitalization
  console.log(req.body);
  const params = req.body; 
  // set parameter for query
  let city = params.city === 'all' ? '.*' : params.city;
  let minPrice = params.minPrice === '' ? 0 : params.minPrice;
  let maxPrice = params.maxPrice === ''  ? Number.MAX_VALUE : params.maxPrice;
  let stars = params.stars.length === 0 ? [3, 4, 5] : params.stars.map(Number); // need cast to number for in operator below

  // getListHomeIdWithSpecified (params.facilities,  params.numberBedroom,  params.numberBathroom,  params.numberBed);
  // HomeDetail.find(
  //   {'address.city': {'$regex': `${city}`} ,
  //    name: { '$regex': `.*${params.name}.*`, '$options': 'i' } ,
  //    price: {$gt: minPrice},
  //    price: {$lt: maxPrice},
  //    hid: {'$ne': null}
  //   }).
  // populate({path: 'hid', match: {rate: {$in: stars}}, option: {strictPopulate: false}}).
  HomeDetail.aggregate([
    { $lookup: {
        from: "homes",
        localField: "hid",
        foreignField : "_id",
        as: "home_id"
      }
    }, 
    {
      $match: {
        'home_id.address.city': {$regex: `${city}`} ,
        'home_id.name': { $regex: `.*${params.name}.*`, $options: 'i' } ,
        'home_id.price': {$gte: Number(minPrice)},
        'home_id.price': {$lte: Number(maxPrice)},
        'home_id.rate': {$in: stars},
        number_bedroom : params.numberBedroom == 0 ? {$ne: 0}: params.numberBedroom,
        number_bathroom : params.numberBathroom == 0 ? {$ne: 0}: params.numberBathroom,
        number_bed : params.numberBedroom == 0 ? {$ne: 0}: params.numberBed,
        facilities : params.facilities.length === 0 ? {$ne: []} : {$in: params.facilities.map(e=>mongoose.Types.ObjectId(e))}
      }
    },
    { $project : 
      { home_id: 1 } // 1 return only home_id, 0 return everything exclude home_id
    },
    { $lookup: {
      from: "facilities",
      localField: "home_id.outstanding_facilities",
      foreignField : "_id",
      as: "outstanding_facilities"
    }
  }]).exec(function (err, homes) {
    let result = [];
    homes.forEach(function (home) {
        let final = home.home_id[0];
        final.outstanding_facilities = home.outstanding_facilities;
        result.push(final);
    });
    return res.status(200).json({
      success: true,
      data: result,
    });
  });
};

module.exports = {
  getListHomeByFilter
};

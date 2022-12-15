import Review from "../models/Review";
import Order from "../models/Order";
import Home from "../models/Home";
import HomeDetail from "../models/HomeDetail";
import { Types } from "mongoose";

require("dotenv").config();

let getReview = async (req, res, next) => {
  Review.find({oid: Types.ObjectId(req.query.oid)})
  .exec(function (err, review) { 
      return res.status(200).json({
        success: true,
        data: review,
      });
    })
}
let putAddNewReview = async (req, res, next) => {
    req.body._id = new Types.ObjectId();
    let newReview = new Review(req.body);
    const accurate = req.body?.rate?.accurate ? req?.body?.rate?.accurate : 0;
    const cleanliness = req.body?.rate?.cleanliness ? req.body?.rate?.cleanliness : 0;
    const communication = req.body?.rate?.communication ? req.body?.rate?.communication : 0;
    const location = req.body?.rate?.location ? req.body?.rate?.location : 0;
    const experience = req.body?.rate?.experience ? req.body?.rate?.experience : 0;
    const numberReview = req.body?.numberReview ? req.body?.numberReview : 1;

    newReview.save(function (err, review) {
        if (err)  {
        return res.status(500).json({
            success: false,
          })
        }
      });
      HomeDetail.aggregate([
        {$match:{hid: Types.ObjectId(req.body.hid)}},
        // accurate
        { $set: { 
          'rates.accurate': { $multiply: [ "$rates.accurate", numberReview ],  },
        }}
        ,{ $set: { 
          'rates.accurate': { $add: [ "$rates.accurate", accurate ],  },
        }}
        ,{ $set: { 
            'rates.accurate': { $divide: [ "$rates.accurate",  Number(numberReview) + 1 ],  },
        }},
        // cleanliness
        { $set: { 
          'rates.cleanliness': { $multiply: [ "$rates.cleanliness", numberReview ],  },
        }}
        ,{ $set: { 
          'rates.cleanliness': { $add: [ "$rates.cleanliness", cleanliness ],  },
        }}
        ,{ $set: { 
            'rates.cleanliness': { $divide: [ "$rates.cleanliness",  Number(numberReview) + 1 ],  },
        }},
        // communication
        { $set: { 
          'rates.communication': { $multiply: [ "$rates.communication", numberReview ],  },
        }}
        ,{ $set: { 
          'rates.communication': { $add: [ "$rates.communication", communication ],  },
        }}
        ,{ $set: { 
            'rates.communication': { $divide: [ "$rates.communication",  Number(numberReview) + 1 ],  },
        }},  
        // location
        { $set: { 
          'rates.location': { $multiply: [ "$rates.location", numberReview ],  },
        }}
        ,{ $set: { 
          'rates.location': { $add: [ "$rates.location", location ],  },
        }}
        ,{ $set: { 
            'rates.location': { $divide: [ "$rates.location",  Number(numberReview) + 1 ],  },
        }},  
        { $merge: { into: "home_details", whenMatched: "replace"} }
      ]).exec()
        Home.aggregate([
          {$match: {_id: Types.ObjectId(req.body.hid)}},
          { $set: { 
            'rate': { $multiply: [ "$rate", numberReview ],  },
          }}      
          ,{ $set: { 
            'rate': { $add: [ "$rate", experience ],  },
          }}
          ,{ $set: { 
            'rate': { $divide: [ "$rate", Number(numberReview) + 1 ],  },
          }},  
          { $merge: { into: "homes", whenMatched: "replace"} }
        ]).exec();
        Home.findOneAndUpdate(
          {_id: Types.ObjectId(req.body.hid)}, 
          {$inc: {number_review: 1}}
        ).exec()
      await Order.findOneAndUpdate(
          {_id: Types.ObjectId(req.body.oid)},
          { $set: { is_review: true}}
      )
    return res.status(200).json({
      success: true,
    })
};



module.exports = {
    getReview,
    putAddNewReview,
  };
  
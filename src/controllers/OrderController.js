
import {
  join
} from "path";
import Order from "../models/Order";
import OrderDetail from "../models/OrderDetail";
import OrdersDetailsController from "../controllers/OrdersDetailsController";
import OrderId from "../controllers/OrderId"
import {
  Types
} from "mongoose";
require("dotenv").config();




let bookingHome = async (req, res) => {

  //   let sampleOrder = {
  //   "_id": new Types.ObjectId(),    
  //   "hid":  Types.ObjectId("637edcdc1a62375c4f241e39"),
  //   "uid":  Types.ObjectId("638ee48ab1ea3871b675269e"),
  //   "create_date":  new Date().toISOString(),
  //   "total_price": 1000,
  //   "is_review": false // auto false
  // }

  // let sampleOrderDetail= {
  // "_id": new Types.ObjectId(),    
  // "uid":  Types.ObjectId("638ee48ab1ea3871b675269e"),
  // "payment_method": "paypal",
  // "checkin":  new Date().toISOString(),
  // "checkout":  new Date().toISOString(),
  // "number_visitor": {
  //   "adults": 1,
  //   "child": 1,
  //   "baby": 1,
  //   "pet": 1,
  // },
  // "voucher": [],
  // "price": 1,
  // "oid": "",
  // }


  //   let order = new Order(sampleOrder);
  //   let newOrder =  order.save(); 
  //   newOrder.then(o=>{
  //     console.log(o);
  //     sampleOrderDetail.oid = o._id;
  //     console.log(sampleOrderDetail);
  //     let orderDetail = new OrderDetail(sampleOrderDetail);
  //     orderDetail.save(function(err, orderDetail){
  //       if (err) return console.error(err);
  //       else {
  //         return res.status(200).json({
  //           success: true,
  //           data: "oke",
  //         });
  //       }
  //     })
  //   })


  var ido = new Types.ObjectId();
  try {

 
  const newOrder = new Order({
    _id: ido,
    hid: req.body.hid,
    uid: req.body.uid,
    create_date:  new Date(),
    total_price: req.body.total_price,
    is_review: false,
  });
  const newOrderDetail = new OrderDetail({
    _id: new Types.ObjectId(),
    oid: ido,
    payment_method: req.body.payment_method,
    checkin: req.body.checkin,
    checkout: req.body.checkout,
    number_visitor: req.body.number_visitor,
    voucher: req.body.voucher,
    price: req.body.price,
  });
  await newOrder.save();

  // newOrder.then(o => {
  //   console.log(o);
  //   // sampleOrderDetail.oid = o._id;
  //   // console.log(sampleOrderDetail);
  //   // let orderDetail = new OrderDetail(sampleOrderDetail);
  //   newOrderDetail.save(function (err, orderDetail) {
  //     if (err) return console.error(err);
  //     else {
  //       return res.status(200).json({
  //         success: true,
  //         data: "oke",
  //       });
  //     }
  //   })
  // })

  await newOrderDetail.save();

  return res.status(200).json({
    status: true,
    msg: "BookingSuccess",
  });
} catch (error) {
  return res.status(500).json({
    status: false,
    msg: error,
  });
}
};

// let getAllIdOrders = async (req, res, next) => {
//   let query = Order.find({});
//   query.exec(function (err, orders) {
//     var result = [];
//     orders.forEach(function (orders) {
//       result.push(orders._id);
//     });
//     return res.status(200).json({
//       success: true,
//       data: result,
//     });
//   })
// };




module.exports = {
  bookingHome,

};
=======
import Order from '../models/Order';
import mongoose from 'mongoose';

let getOrderByIdUser = async (req, res) => {
    try {
        await Order.find({ uid: req.body.idUser }).exec((err, orders) => {
            if (err) {
                return res.status(404).json({ status: false, msg: err });
            } else {
                let orderMap = [];
                orders.forEach((order) => {
                    orderMap.push(order);
                });
                return res.status(200).json({ status: true, data: orderMap });
            }
        });
    } catch (error) {
        return res.status(500).json({ status: false, msg: error });
    }
};
let getOrderByIdUserAndDate = async (req, res) => {
    try {
        await Order.aggregate([
            {
                $match: {
                    uid: mongoose.Types.ObjectId(req.body.idUser),
                    create_date: {
                        $gte: new Date(req.body.start),
                        $lt: new Date(req.body.end),
                    },
                },
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$create_date' },
                        year: { $year: '$create_date' },
                        date: { $dayOfMonth: '$create_date' },
                    },
                    total_cost_month: { $sum: '$total_price' },
                },
            },
        ]).exec((err, orders) => {
            if (err) {
                return res.status(404).json({ status: false, msg: err });
            } else {
                let orderMap = [];
                orders.forEach((order) => {
                    orderMap.push(order);
                });
                return res.status(200).json({ status: true, data: orderMap });
            }
        });
    } catch (error) {
        return res.status(500).json({ status: false, msg: error });
    }
};
let getOrderByIdUserAndMonth = async (req, res) => {
    try {
        await Order.aggregate([
            {
                $match: {
                    uid: mongoose.Types.ObjectId(req.body.idUser),

                    create_date: {
                        $gte: new Date(req.body.start),
                        $lt: new Date(req.body.end),
                    },
                },
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$create_date' },
                        year: { $year: '$create_date' },
                    },
                    total_cost_month: { $sum: '$total_price' },
                },
            },
        ]).exec((err, orders) => {
            if (err) {
                return res.status(404).json({ status: false, msg: err });
            } else {
                let orderMap = [];
                orders.forEach((order) => {
                    orderMap.push(order);
                });
                return res.status(200).json({ status: true, data: orderMap });
            }
        });
    } catch (error) {
        return res.status(500).json({ status: false, msg: error });
    }
};
let getOrderByHomeCategoriesOneWeek = async (req, res) => {
    try {
        await Order.aggregate([
            {
                $match: {
                    uid: mongoose.Types.ObjectId(req.body.idUser),
                    create_date: {
                        $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
                        $lt: new Date(),
                    },
                },
            },
            {
                $lookup: {
                    from: 'homes',
                    localField: 'hid',
                    foreignField: '_id',
                    as: 'home_id',
                },
            },
            {
                $group: {
                    _id: {
                        type: '$home_id.segmentation',
                    },
                    total_cost_month: { $sum: '$total_price' },
                },
            },
        ]).exec((err, orders) => {
            if (err) {
                return res.status(404).json({ status: false, msg: err });
            } else {
                let orderMap = [];
                orders.forEach((order) => {
                    orderMap.push(order);
                });
                return res.status(200).json({ status: true, data: orderMap });
            }
        });
    } catch (error) {
        return res.status(500).json({ status: false, msg: error });
    }
};
let getOrderByHomeCategoriesOneMonth = async (req, res) => {
    try {
        await Order.aggregate([
            {
                $match: {
                    uid: mongoose.Types.ObjectId(req.body.idUser),
                    create_date: {
                        $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
                        $lt: new Date(),
                    },
                },
            },
            {
                $lookup: {
                    from: 'homes',
                    localField: 'hid',
                    foreignField: '_id',
                    as: 'home_id',
                },
            },
            {
                $group: {
                    _id: {
                        type: '$home_id.segmentation',
                    },
                    total_cost_month: { $sum: '$total_price' },
                },
            },
        ]).exec((err, orders) => {
            if (err) {
                return res.status(404).json({ status: false, msg: err });
            } else {
                let orderMap = [];
                orders.forEach((order) => {
                    orderMap.push(order);
                });
                return res.status(200).json({ status: true, data: orderMap });
            }
        });
    } catch (error) {
        return res.status(500).json({ status: false, msg: error });
    }
};
let getOrderByHomeCategoriesThreeMonth = async (req, res) => {
    try {
        await Order.aggregate([
            {
                $match: {
                    uid: mongoose.Types.ObjectId(req.body.idUser),
                    create_date: {
                        $gte: new Date(new Date().setMonth(new Date().getMonth() - 3)),
                        $lt: new Date(),
                    },
                },
            },
            {
                $lookup: {
                    from: 'homes',
                    localField: 'hid',
                    foreignField: '_id',
                    as: 'home_id',
                },
            },
            {
                $group: {
                    _id: {
                        type: '$home_id.segmentation',
                    },
                    total_cost_month: { $sum: '$total_price' },
                },
            },
        ]).exec((err, orders) => {
            if (err) {
                return res.status(404).json({ status: false, msg: err });
            } else {
                let orderMap = [];
                orders.forEach((order) => {
                    orderMap.push(order);
                });
                return res.status(200).json({ status: true, data: orderMap });
            }
        });
    } catch (error) {
        return res.status(500).json({ status: false, msg: error });
    }
};
let getOrderByHomeCategoriesOneYear = async (req, res) => {
    try {
        await Order.aggregate([
            {
                $match: {
                    uid: mongoose.Types.ObjectId(req.body.idUser),
                    create_date: {
                        $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 7)),
                        $lt: new Date(),
                    },
                },
            },
            {
                $lookup: {
                    from: 'homes',
                    localField: 'hid',
                    foreignField: '_id',
                    as: 'home_id',
                },
            },
            {
                $group: {
                    _id: {
                        type: '$home_id.segmentation',
                    },
                    total_cost_month: { $sum: '$total_price' },
                },
            },
        ]).exec((err, orders) => {
            if (err) {
                return res.status(404).json({ status: false, msg: err });
            } else {
                let orderMap = [];
                orders.forEach((order) => {
                    orderMap.push(order);
                });
                return res.status(200).json({ status: true, data: orderMap });
            }
        });
    } catch (error) {
        return res.status(500).json({ status: false, msg: error });
    }
};

module.exports = {
    getOrderByIdUser,
    getOrderByIdUserAndDate,
    getOrderByIdUserAndMonth,
    getOrderByHomeCategoriesOneWeek,
    getOrderByHomeCategoriesThreeMonth,
    getOrderByHomeCategoriesOneMonth,
    getOrderByHomeCategoriesOneYear,
};


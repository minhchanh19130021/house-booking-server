import Order from '../models/Order';
import OrderDetail from '../models/OrderDetail';
import { Types } from 'mongoose';
import Home from "../models/Home";


require('dotenv').config();

let testApi = async (req, res, next) => {
    let sampleOrder = {
        _id: new Types.ObjectId(),
        hid: Types.ObjectId('637edcdc1a62375c4f241e39'),
        uid: Types.ObjectId('638ee48ab1ea3871b675269e'),
        create_date: new Date().toISOString(),
        total_price: 1000,
        is_review: false, // auto false
    };

    let sampleOrderDetail = {
        _id: new Types.ObjectId(),
        uid: Types.ObjectId('638ee48ab1ea3871b675269e'),
        payment_method: 'paypal',
        checkin: new Date().toISOString(),
        checkout: new Date().toISOString(),
        number_visitor: {
            adults: 1,
            child: 1,
            baby: 1,
            pet: 1,
        },
        voucher: [],
        price: 1,
        oid: '',
    };

    let order = new Order(sampleOrder);
    let newOrder = order.save();
    newOrder.then((o) => {
        console.log(o);
        sampleOrderDetail.oid = o._id;
        console.log(sampleOrderDetail);
        let orderDetail = new OrderDetail(sampleOrderDetail);
        orderDetail.save(function (err, orderDetail) {
            if (err) return console.error(err);
            else {
                return res.status(200).json({
                    success: true,
                    data: 'oke',
                });
            }
        });
    });
  console.log(req.body.hid);
  await Home.findOneAndUpdate(
    {_id: Types.ObjectId(req.body.hid)}, 
    {$inc: {number_review: 1}})
  return res.status(200).json({
      success: true,
    })
};

module.exports = {
    testApi,
};

import OrderDetail from "../models/OrderDetail";
require("dotenv").config();

let addOrdersDetail = async (req, res) => {
  try {
    const newOrderDetail = await new OrderDetail({
        payment_method: req.body.payment_method,
        checkin: req.body.checkin,
        checkout: req.body.checkout,
        number_visitor: req.body.number_visitor,
        voucher: req.body.voucher,
        oid: req.body.oid,
        price: req.body.price,
    }); 
    await newOrderDetail.save();
    return res.status(200).json({
      status: true,
      msg: "Thêm chi tiết đơn thành công",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      msg: error,
    });
  }
};

module.exports = {
  addOrdersDetail,
};
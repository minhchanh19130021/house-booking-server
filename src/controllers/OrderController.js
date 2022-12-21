import Order from '../models/Order';
import Home from '../models/Home';
import OrderDetail from '../models/OrderDetail';
import mongoose from 'mongoose';
import Cart from '../models/Cart';

import { Types } from 'mongoose';
require('dotenv').config();

let bookingHome = async (req, res) => {
    var ido = new Types.ObjectId();
    let dateCheckIn = new Date(req.body.checkin);
    let dateCheckOut = new Date(req.body.checkout);
    console.log(req.body.cartId);

    Home.findOne({ hid: req.body.hid }, async (r, home) => {
        let hostId = home.uid;
        try {
            const newOrder = new Order({
                _id: ido,
                hid: req.body.hid,
                uid: req.body.uid,
                create_date: new Date(),
                total_price: req.body.total_price,
                is_review: false,
                host_id: hostId,
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

            await newOrderDetail.save();

            if (cartId) {
                Cart.deleteOne({ _id: mongoose.Types.ObjectId(req.body.cartId) }).exec();
            } else {
                Cart.aggregate([
                    {
                        $match: {
                            $and: [
                                {
                                    $or: [
                                        {
                                            check_in: {
                                                $gte: new Date(dateCheckIn),
                                                $lte: new Date(dateCheckOut),
                                            },
                                        },
                                        {
                                            checkout: {
                                                $gte: new Date(dateCheckIn),
                                                $lte: new Date(dateCheckOut),
                                            },
                                        },
                                        {
                                            $and: [
                                                {
                                                    check_in: {
                                                        $lte: new Date(dateCheckIn),
                                                    },
                                                },
                                                {
                                                    checkout: {
                                                        $gte: new Date(dateCheckOut),
                                                    },
                                                },
                                            ],
                                        },
                                    ],
                                },
                                { hid: Types.ObjectId(req.body.hid) },
                            ],
                        },
                    },
                    { $set: { is_booked: true } },
                    { $merge: { into: 'carts', whenMatched: 'replace' } },
                ]).exec();
            }

            return res.status(200).json({
                status: true,
                msg: 'BookingSuccess',
            });
        } catch (error) {
            return res.status(500).json({
                status: false,
                msg: error,
            });
        }
    });

    // try {
    //     const newOrder = new Order({
    //         _id: ido,
    //         hid: req.body.hid,
    //         uid: req.body.uid,
    //         create_date: new Date(),
    //         total_price: req.body.total_price,
    //         is_review: false,
    //     });
    //     const newOrderDetail = new OrderDetail({
    //         _id: new Types.ObjectId(),
    //         oid: ido,
    //         payment_method: req.body.payment_method,
    //         checkin: req.body.checkin,
    //         checkout: req.body.checkout,
    //         number_visitor: req.body.number_visitor,
    //         voucher: req.body.voucher,
    //         price: req.body.price,
    //     });

    //     // await newOrder.save();

    //     // await newOrderDetail.save();

    //     if (cartId) {
    //         Cart.deleteOne({ _id: mongoose.Types.ObjectId(req.body.cartId) }).exec();
    //     } else {
    //         Cart.aggregate([
    //             {
    //                 $match: {
    //                     $and: [
    //                         {
    //                             $or: [
    //                                 {
    //                                     check_in: {
    //                                         $gte: new Date(dateCheckIn),
    //                                         $lte: new Date(dateCheckOut),
    //                                     },
    //                                 },
    //                                 {
    //                                     checkout: {
    //                                         $gte: new Date(dateCheckIn),
    //                                         $lte: new Date(dateCheckOut),
    //                                     },
    //                                 },
    //                                 {
    //                                     $and: [
    //                                         {
    //                                             check_in: {
    //                                                 $lte: new Date(dateCheckIn),
    //                                             },
    //                                         },
    //                                         {
    //                                             checkout: {
    //                                                 $gte: new Date(dateCheckOut),
    //                                             },
    //                                         },
    //                                     ],
    //                                 },
    //                             ],
    //                         },
    //                         { hid: Types.ObjectId(req.body.hid) },
    //                     ],
    //                 },
    //             },
    //             { $set: { is_booked: true } },
    //             { $merge: { into: 'carts', whenMatched: 'replace' } },
    //         ]).exec();
    //     }

    //     return res.status(200).json({
    //         status: true,
    //         msg: 'BookingSuccess',
    //     });
    // } catch (error) {
    //     return res.status(500).json({
    //         status: false,
    //         msg: error,
    //     });
    // }
};

let getOrderByIdUser = async (req, res) => {
    try {
        await Order.find({
            host_id: mongoose.Types.ObjectId(req.body.idUser),
        }).exec((err, orders) => {
            if (err) {
                return res.status(404).json({
                    status: false,
                    msg: err,
                });
            } else {
                let orderMap = [];
                orders.forEach((order) => {
                    orderMap.push(order);
                });
                return res.status(200).json({
                    status: true,
                    data: orderMap,
                });
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            msg: error,
        });
    }
};
let getOrderByIdUserAndDate = async (req, res) => {
    try {
        await Order.aggregate([
            {
                $match: {
                    host_id: mongoose.Types.ObjectId(req.body.idUser),
                    create_date: {
                        $gte: new Date(req.body.start),
                        $lt: new Date(req.body.end),
                    },
                },
            },
            {
                $group: {
                    _id: {
                        month: {
                            $month: '$create_date',
                        },
                        year: {
                            $year: '$create_date',
                        },
                        date: {
                            $dayOfMonth: '$create_date',
                        },
                    },
                    total_cost_month: {
                        $sum: '$total_price',
                    },
                },
            },
        ]).exec((err, orders) => {
            if (err) {
                return res.status(404).json({
                    status: false,
                    msg: err,
                });
            } else {
                let orderMap = [];
                orders.forEach((order) => {
                    orderMap.push(order);
                });
                return res.status(200).json({
                    status: true,
                    data: orderMap,
                });
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            msg: error,
        });
    }
};
let getOrderByIdUserAndMonth = async (req, res) => {
    try {
        await Order.aggregate([
            {
                $match: {
                    host_id: mongoose.Types.ObjectId(req.body.idUser),

                    create_date: {
                        $gte: new Date(req.body.start),
                        $lt: new Date(req.body.end),
                    },
                },
            },
            {
                $group: {
                    _id: {
                        month: {
                            $month: '$create_date',
                        },
                        year: {
                            $year: '$create_date',
                        },
                    },
                    total_cost_month: {
                        $sum: '$total_price',
                    },
                },
            },
        ]).exec((err, orders) => {
            if (err) {
                return res.status(404).json({
                    status: false,
                    msg: err,
                });
            } else {
                let orderMap = [];
                orders.forEach((order) => {
                    orderMap.push(order);
                });
                return res.status(200).json({
                    status: true,
                    data: orderMap,
                });
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            msg: error,
        });
    }
};
let getOrderByHomeCategoriesOneWeek = async (req, res) => {
    try {
        await Order.aggregate([
            {
                $match: {
                    host_id: mongoose.Types.ObjectId(req.body.idUser),
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
                    total_cost_month: {
                        $sum: '$total_price',
                    },
                },
            },
        ]).exec((err, orders) => {
            if (err) {
                return res.status(404).json({
                    status: false,
                    msg: err,
                });
            } else {
                let orderMap = [];
                orders.forEach((order) => {
                    orderMap.push(order);
                });
                return res.status(200).json({
                    status: true,
                    data: orderMap,
                });
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            msg: error,
        });
    }
};
let getOrderByHomeCategoriesOneMonth = async (req, res) => {
    try {
        await Order.aggregate([
            {
                $match: {
                    host_id: mongoose.Types.ObjectId(req.body.idUser),
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
                    total_cost_month: {
                        $sum: '$total_price',
                    },
                },
            },
        ]).exec((err, orders) => {
            if (err) {
                return res.status(404).json({
                    status: false,
                    msg: err,
                });
            } else {
                let orderMap = [];
                orders.forEach((order) => {
                    orderMap.push(order);
                });
                return res.status(200).json({
                    status: true,
                    data: orderMap,
                });
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            msg: error,
        });
    }
};
let getOrderByHomeCategoriesThreeMonth = async (req, res) => {
    try {
        await Order.aggregate([
            {
                $match: {
                    host_id: mongoose.Types.ObjectId(req.body.idUser),
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
                    total_cost_month: {
                        $sum: '$total_price',
                    },
                },
            },
        ]).exec((err, orders) => {
            if (err) {
                return res.status(404).json({
                    status: false,
                    msg: err,
                });
            } else {
                let orderMap = [];
                orders.forEach((order) => {
                    orderMap.push(order);
                });
                return res.status(200).json({
                    status: true,
                    data: orderMap,
                });
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            msg: error,
        });
    }
};
let getOrderByHomeCategoriesOneYear = async (req, res) => {
    try {
        await Order.aggregate([
            {
                $match: {
                    host_id: mongoose.Types.ObjectId(req.body.idUser),
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
                    total_cost_month: {
                        $sum: '$total_price',
                    },
                },
            },
        ]).exec((err, orders) => {
            if (err) {
                return res.status(404).json({
                    status: false,
                    msg: err,
                });
            } else {
                let orderMap = [];
                orders.forEach((order) => {
                    orderMap.push(order);
                });
                return res.status(200).json({
                    status: true,
                    data: orderMap,
                });
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            msg: error,
        });
    }
};

module.exports = {
    bookingHome,
    getOrderByIdUser,
    getOrderByIdUserAndDate,
    getOrderByIdUserAndMonth,
    getOrderByHomeCategoriesOneWeek,
    getOrderByHomeCategoriesThreeMonth,
    getOrderByHomeCategoriesOneMonth,
    getOrderByHomeCategoriesOneYear,
    bookingHome,
};

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

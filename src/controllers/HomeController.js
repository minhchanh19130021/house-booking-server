import Home from '../models/Home';
import Order from '../models/Order';
import Review from '../models/Review';

import mongoose from 'mongoose';

require('dotenv').config();
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
    });
};

let getAllHomeByCity = async (req, res, next) => {
    Home.find({ 'address.city': req.params.slug })
        .populate({ path: 'outstanding_facilities', option: { strictPopulate: false } })
        .skip((Number(req.params.pagination) - 1) * numberListHomeInOnePage)
        .limit(3)
        .exec(function (err, homes) {
            let result = [];
            homes.forEach(function (home) {
                result.push(home);
            });
            Home.countDocuments({ 'address.city': req.params.slug }, (err, countListHouse) => {
                return res.status(200).json({
                    success: true,
                    data: result,
                    pagination:
                        Math.floor(countListHouse / numberListHomeInOnePage) +
                        (countListHouse % numberListHomeInOnePage),
                });
            });
        });
};

let getNewestHome = async (req, res, next) => {
    Home.find({})
        .populate({ path: 'outstanding_facilities', option: { strictPopulate: false } })
        .sort({ create_date: -1 })
        .limit(6)
        .exec(function (err, homes) {
            var result = [];
            homes.forEach(function (home) {
                result.push(home);
            });
            return res.status(200).json({
                success: true,
                data: result,
            });
        });
};

let getBestSellingHome = async (req, res, next) => {
    Order.aggregate([
        {
            $lookup: {
                from: 'homes',
                localField: 'hid',
                foreignField: '_id',
                as: 'home_id',
            },
        },
        {
            $lookup: {
                from: 'facilities',
                localField: 'home_id.outstanding_facilities',
                foreignField: '_id',
                as: 'outstanding_facilities',
            },
        },
        {
            $group: {
                _id: '$hid',
                homes: { $first: '$$ROOT' }, // add all field, all document by group into homes but just get first home in list home
                count: { $sum: 1 },
            },
        },
        { $project: { 'homes.home_id': 1, count: 1, 'homes.outstanding_facilities': 1 } },
        { $sort: { count: -1 } },
        { $limit: 6 },
    ]).exec(function (err, homes) {
        var result = [];
        homes.forEach(function (home) {
            result.push(home);
        });
        return res.status(200).json({
            success: true,
            data: result,
        });
    });
};

let getDetailHomeById = async (req, res) => {
    try {
        Home.aggregate([
            {
                $match: {
                    slug: req.body.slugHome,
                },
            },
            {
                $lookup: {
                    from: 'home_details',
                    localField: '_id',
                    foreignField: 'hid',
                    as: 'detail',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'uid',
                    foreignField: '_id',
                    as: 'host',
                },
            },
            {
                $lookup: {
                    from: 'facilities',
                    localField: 'outstanding_facilities',
                    foreignField: '_id',
                    as: 'facilities',
                },
            },
            {
                $lookup: {
                    from: 'regulations',
                    localField: 'detail.regulations.available',
                    foreignField: '_id',
                    as: 'regulations_available',
                },
            },
            // {
            //     $lookup: {
            //         from: 'facilities',
            //         localField: 'outstanding_facilities',
            //         foreignField: '_id',
            //         as: 'facilities',
            //     },
            // },
        ]).exec((err, homes) => {
            if (err) {
                return res.status(404).json({ status: false, msg: err });
            } else {
                return res.status(200).json({ status: true, data: homes });
            }
        });
    } catch (error) {
        return res.status(500).json({ status: false, msg: error });
    }
};

let loadAllReviewByIdHome = async (req, res) => {
    try {
        Order.aggregate([
            {
                $match: {
                    hid: mongoose.Types.ObjectId(req.body.idHome),
                },
            },
            {
                $lookup: {
                    from: 'reviews',
                    localField: '_id',
                    foreignField: 'oid',
                    as: 'review',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'uid',
                    foreignField: '_id',
                    as: 'user',
                },
            },
        ]).exec((err, review) => {
            if (err) {
                return res.status(404).json({ status: false, msg: err });
            } else {
                return res.status(200).json({ status: true, data: review });
            }
        });
    } catch (error) {
        return res.status(500).json({ status: false, msg: error });
    }
};
module.exports = {
    getAllHome,
    getAllHomeByCity,
    getNewestHome,
    getBestSellingHome,
    getDetailHomeById,
    loadAllReviewByIdHome,
};

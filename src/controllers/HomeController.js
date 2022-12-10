import Home from '../models/Home';
import Order from '../models/Order';

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

module.exports = {
    getAllHome,
    getAllHomeByCity,
    getNewestHome,
    getBestSellingHome,
};

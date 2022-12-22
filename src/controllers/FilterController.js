import HomeDetail from '../models/HomeDetail';
import mongoose from 'mongoose';

require('dotenv').config();

const numberListHomeInOnePage = 6;

let getListHomeByFilter = async (req, res, next) => {
    if (!req.body.stars || typeof req.body.stars === 'string') {
        req.body.stars = Array.from(req.body.stars !== undefined ? req.body.stars.split(',') : '').filter(
            (e) => e != '',
        );
    }
    if (!req.body.facilities || typeof req.body.facilities === 'string') {
        req.body.facilities = Array.from(
            req.body.facilities !== undefined ? req.body.facilities.split(',') : '',
        ).filter((e) => e != '');
    }
    const params = req.body;
    // set parameter for query
    let city = params.city === 'all' ? '.*' : params.city;
    let minPrice = !params.minPrice ? 0 : params.minPrice;
    let maxPrice = !params.maxPrice ? Number.MAX_VALUE : params.maxPrice;
    let stars = params?.stars?.length === 0 ? [3, 4, 5] : params.stars.map(Number); // need cast to number for in operator below

    let condition = [
        {
            $lookup: {
                from: 'homes',
                localField: 'hid',
                foreignField: '_id',
                as: 'home_id',
            },
        },
        {
            $match: {
                'home_id.address.city': { $regex: `${city}` },
                'home_id.name': { $regex: `.*${params.name}.*`, $options: 'i' },
                'home_id.price': { $gte: Number(minPrice) },
                'home_id.price': { $lte: Number(maxPrice) },
                'home_id.rate': { $in: stars },
                number_bedroom: params.numberBedroom === '' ? { $ne: 0 } : params.numberBedroom,
                number_bathroom: params.numberBathroom === '' ? { $ne: 0 } : params.numberBathroom,
                number_bed: params.numberBedroom === '' ? { $ne: 0 } : params.numberBed,
                facilities:
                    params.facilities.length === 0
                        ? { $ne: [] }
                        : { $in: params.facilities.map((e) => mongoose.Types.ObjectId(e)) },
            },
        },
        {
            $project: { home_id: 1 }, // 1 return only home_id, 0 return everything exclude home_id
        },
        {
            $lookup: {
                from: 'facilities',
                localField: 'home_id.outstanding_facilities',
                foreignField: '_id',
                as: 'outstanding_facilities',
            },
        },
    ];

    let conditionToCount = [...condition];
    conditionToCount.push({
        $count: 'count', // "count" is name of value
    });
    let countListHouse = await countListHomeByFilter(conditionToCount);
    // skip, limit to pagination
    condition.push({ $skip: (Number(req.query.pagination) - 1) * numberListHomeInOnePage }, { $limit: numberListHomeInOnePage });
    // return list house
    HomeDetail.aggregate(condition).exec(function (err, homes) {
        let result = [];
        homes.forEach(function (home) {
            let final = home.home_id[0];
            final.outstanding_facilities = home.outstanding_facilities;
            result.push(final);
        });
        return res.status(200).json({
            success: true,
            data: result,
            // if countListHouse[0]?.count = undefined then use 0
            pagination:
                Math.ceil((countListHouse[0]?.count || 0) / numberListHomeInOnePage) 
        });
    });
};

let countListHomeByFilter = async function (conditionToCount) {
    return HomeDetail.aggregate(conditionToCount).exec();
};
module.exports = {
    getListHomeByFilter,
};

import Home from '../models/Home';
import User from '../models/User';
import HomeDetail from '../models/HomeDetail';
import Order from '../models/Order';
import { Types } from 'mongoose';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
import Review from '../models/Review';

import mongoose from 'mongoose';
import sendEmail from '../configs/mailer';

require('dotenv').config();
const numberListHomeInOnePage = 6;

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
    Home.find({
        $or: [
            {
                'address.city': { $regex: `.*${req.params.slug}.*`, $options: 'i' },
            },
            {
                'address.district': { $regex: `.*${req.params.slug}.*`, $options: 'i' },
            },
            {
                'address.village': { $regex: `.*${req.params.slug}.*`, $options: 'i' },
            },
        ],
    })
        .populate({ path: 'outstanding_facilities', option: { strictPopulate: false } })
        .skip((Number(req.params.pagination) - 1) * numberListHomeInOnePage)
        .limit(numberListHomeInOnePage)
        .exec(function (err, homes) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    data: [],
                    pagination: 0
                });
            }
            else {
                let result = [];
                homes.forEach(function (home) {
                    result.push(home);
                });
                Home.countDocuments({  $or: [
                    {
                        'address.city': { $regex: `.*${req.params.slug}.*`, $options: 'i' },
                    },
                    {
                        'address.district': { $regex: `.*${req.params.slug}.*`, $options: 'i' },
                    },
                    {
                        'address.village': { $regex: `.*${req.params.slug}.*`, $options: 'i' },
                    },
                ], }, (err, countListHouse) => {
                    return res.status(200).json({
                        success: true,
                        data: result,
                        pagination:
                            Math.ceil(countListHouse / numberListHomeInOnePage) ,
                    });
                });
            }
        });
};

let getNewestHome = async (req, res, next) => {
    Home.find({})
        .populate({ path: 'outstanding_facilities', option: { strictPopulate: false } })
        .sort({ create_date: -1 })
        .limit(6)
        .exec(function (err, homes) {
            var result = [];
            if (err) {
                return res.status(500).json({
                    success: false,
                    data: result,
                });
            }
            else {
                homes.forEach(function (home) {
                    result.push(home);
                });
                return res.status(200).json({
                    success: true,
                    data: result,
                });
            }          
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
        if (err) {
            return res.status(500).json({
                success: false,
                data: result,
            });
        }
        else {
            homes.forEach(function (home) {
                result.push(home);
            });
            return res.status(200).json({
                success: true,
                data: result,
            });
        }       
    });
};

let getMostViewedHome = async (req, res, next) => {
    Home.find({})
        .populate({ path: 'outstanding_facilities', option: { strictPopulate: false } })
        .sort({ total_view: -1 })
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
let getSuggestionHome = async (req, res, next) => {
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
        { $limit: 32 },
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
                    localField: 'detail.facilities',
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
                $unwind: {
                    path: '$review',
                    preserveNullAndEmptyArrays: false,
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

let findHomeByLocation = async (req, res) => {
    try {
        Home.find({
            $or: [
                {
                    'address.city': { $regex: req.body.key, $options: 'i' },
                },
                {
                    'address.district': { $regex: req.body.key, $options: 'i' },
                },
                {
                    'address.village': { $regex: req.body.key, $options: 'i' },
                },
            ],
        }).exec((err, homes) => {
            if (err) {
                return res.status(404).json({ status: false, msg: 'L????i h???? th????ng' });
            } else {
                return res.status(200).json({ status: true, data: homes });
            }
        });
    } catch (error) {
        return res.status(500).json({ status: false, msg: error });
    }
};

let createHome = async (req, res) => {
    try {
        //create random password
        const salt = await bcrypt.genSalt(10);
        let randomPassword = (Math.random() + 1).toString(36).substring(3).toString();
        const hashPassword = await bcrypt.hash(randomPassword.toString(), salt);

        // create link active
        var date = new Date();
        var mail = {
            id: req.body.id,
            created: date.toString(),
        };
        const token_mail_verification = jwt.sign(mail, process.env.VERIFY_TOKEN_USER_SECRET, {
            expiresIn: '365d',
        });
        var url = '${process.env.REACT_APP_API_URL}/v1/' + 'verify?id=' + token_mail_verification;
        const oldHostByUsernameAndMail = await User.findOne({
            username: req.body.username,
            email: req.body.email,
            type: 'host',
        });
        const oldHostByEmail = await User.findOne({ email: req.body.email });
        const oldHostByUsername = await User.findOne({ username: req.body.username });
        const oldHomeByName = await Home.findOne({ name: req.body.name });
        if (oldHostByUsernameAndMail) {
            const newHome = new Home({
                _id: new Types.ObjectId(),
                uid: oldHostByUsernameAndMail._id,
                name: req.body.name.trim(),
                price: req.body.price,
                address: {
                    city: req.body.address.city.split('_')[1],
                    district: req.body.address.district.split('_')[1],
                    village: req.body.address.village.split('_')[1],
                    specifically:
                        req.body.address.specifically +
                        ' ' +
                        req.body.address.village.split('_')[1] +
                        ' ' +
                        req.body.address.district.split('_')[1] +
                        ' ' +
                        req.body.address.city.split('_')[1],
                },
                introduce: req.body.introduce.trim(),
                segmentation: req.body.segmentation,
                discount: req.body.discount,
                outstanding_facilities: req.body.facilities,
                slug: removeVietnameseTones(req.body.name).replace(/ /g, '-'),
                folder_image: req.body.name.trim(),
                avatar: req.body.images[0],
            });
            const newHomeDetails = new HomeDetail({
                _id: new Types.ObjectId(),
                hid: newHome._id,
                description: req.body.description.trim(),
                minimum_night: req.body.minimum_night,
                maximum_night: req.body.maximum_night,
                number_living_room: req.body.number_living_room,
                number_bedroom: req.body.number_bedroom,
                number_bed: req.body.number_bed,
                number_bathroom: req.body.number_bathroom,
                check_in: `tr??????c ` + req.body.check_in,
                check_out: `sau ` + req.body.check_out,
                facilities: req.body.facilities,
                maximum_number_visitor: {
                    adult_children: req.body.adult,
                    baby: req.body.baby,
                    pet: req.body.pets,
                },
                regulations: {
                    available: req.body.regulationsAvailable,
                },
                image: req.body.images,
            });
            await newHome.save();
            await newHomeDetails.save();
            return res.status(200).json({
                status: true,
                msg: '????ng ky?? tha??nh th??ng',
                home: newHome,
                homeDetail: newHomeDetails,
            });
        }
        if (oldHostByEmail) {
            return res.status(400).json({
                status: false,
                msg: '??i??a chi?? email ???? t???n t???i',
            });
        }
        if (oldHostByUsername) {
            return res.status(400).json({
                status: false,
                msg: 'T??n ????ng nh????p ???? t???n t???i',
            });
        }
        if (oldHomeByName) {
            return res.status(400).json({
                status: false,
                msg: 'T??n nha?? ??a?? t????n ta??i',
            });
        }
        const newHost = new User({
            _id: new Types.ObjectId(),
            firstname: req.body.firstname.trim(),
            lastname: req.body.lastname.trim(),
            username: req.body.username.trim(),
            birthday: req.body.birthday,
            gender: req.body.gender,
            email: req.body.email,
            phone: req.body.phone,
            type: 'host',
            password: hashPassword.trim(),
            code_active: token_mail_verification,
            address: {
                city: req.body.address_u.city.split('_')[1],
                district: req.body.address_u.district.split('_')[1],
                village: req.body.address_u.village.split('_')[1],
                specifically:
                    req.body.address_u.specifically +
                    ' ' +
                    req.body.address_u.village.split('_')[1] +
                    ' ' +
                    req.body.address_u.district.split('_')[1] +
                    ' ' +
                    req.body.address_u.city.split('_')[1],
            },
        });
        await sendEmail(
            newHost?.email,
            `Xa??c Minh ??i??a Chi?? Email`,
            ``,
            newHost.username,
            `Chu??ng t??i r????t vui vi?? ba??n ??a?? ????ng ky?? ta??i khoa??n tr??n DNA. Tr?????c khi c?? th??? s??? d???ng t??i kho???n c???a m??nh, b???n c???n x??c minh r???ng ????y l?? ?????a ch??? email c???a b???n b???ng c??ch nh???p v??o ????y. ?????? ????ng nh????p b????ng t??n ta??i khoa??n vui lo??ng l??u la??i th??ng tin sau. <br/>
            <p>T??n ta??i khoa??n: <strong>${newHost.username}</strong></p>
            <p>M????t kh????u: <strong>${randomPassword.toString()}</strong></p>
            `,
            url,
            `Nh????p Va??o ????y ?????? Xa??c Minh`,
        );
        await newHost.save();

        const newHome = new Home({
            _id: new Types.ObjectId(),
            uid: newHost._id,
            name: req.body.name.trim(),
            price: req.body.price,
            address: {
                city: req.body.address.city.split('_')[1],
                district: req.body.address.district.split('_')[1],
                village: req.body.address.village.split('_')[1],
                specifically:
                    req.body.address.specifically +
                    ' ' +
                    req.body.address.village.split('_')[1] +
                    ' ' +
                    req.body.address.district.split('_')[1] +
                    ' ' +
                    req.body.address.city.split('_')[1],
            },
            introduce: req.body.introduce.trim(),
            segmentation: req.body.segmentation,
            discount: req.body.discount,
            outstanding_facilities: req.body.facilities,
            slug: removeVietnameseTones(req.body.name).replace(/ /g, '-'),
            folder_image: req.body.name.trim(),
            avatar: req.body.images[0],
        });
        const newHomeDetails = new HomeDetail({
            _id: new Types.ObjectId(),
            hid: newHome._id,
            description: req.body.description.trim(),
            minimum_night: req.body.minimum_night,
            maximum_night: req.body.maximum_night,
            number_living_room: req.body.number_living_room,
            number_bedroom: req.body.number_bedroom,
            number_bed: req.body.number_bed,
            number_bathroom: req.body.number_bathroom,
            check_in: `tr??????c ` + req.body.check_in,
            check_out: `sau ` + req.body.check_out,
            facilities: req.body.facilities,
            maximum_number_visitor: {
                adult_children: req.body.adult,
                baby: req.body.baby,
                pet: req.body.pets,
            },
            regulations: {
                available: req.body.regulationsAvailable,
            },
            image: req.body.images,
        });
        await newHome.save();
        await newHomeDetails.save();
        return res.status(200).json({
            status: true,
            msg: '????ng ky?? tha??nh th??ng',
            host: newHost,
            home: newHome,
            homeDetail: newHomeDetails,
        });
        // newHome.then((handle) => {
        //     newHomeDetails.hid = handle._id;
        //     newHomeDetails.save((err, detail) => {
        //         if (err) {
        //             return res.status(404).json({ status: false, msg: 'L????i h???? th????ng' });
        //         } else {
        //             return res.status(200).json({
        //                 status: true,
        //                 msg: '????ng ky?? tha??nh th??ng',
        //                 home: newHome,
        //                 homeDetail: newHomeDetails,
        //             });
        //         }
        //     });
        // });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, msg: error });
    }
};
function removeVietnameseTones(str) {
    str = str.replace(/??|??|???|???|??|??|???|???|???|???|???|??|???|???|???|???|???/g, 'a');
    str = str.replace(/??|??|???|???|???|??|???|???|???|???|???/g, 'e');
    str = str.replace(/??|??|???|???|??/g, 'i');
    str = str.replace(/??|??|???|???|??|??|???|???|???|???|???|??|???|???|???|???|???/g, 'o');
    str = str.replace(/??|??|???|???|??|??|???|???|???|???|???/g, 'u');
    str = str.replace(/???|??|???|???|???/g, 'y');
    str = str.replace(/??/g, 'd');
    str = str.replace(/??|??|???|???|??|??|???|???|???|???|???|??|???|???|???|???|???/g, 'A');
    str = str.replace(/??|??|???|???|???|??|???|???|???|???|???/g, 'E');
    str = str.replace(/??|??|???|???|??/g, 'I');
    str = str.replace(/??|??|???|???|??|??|???|???|???|???|???|??|???|???|???|???|???/g, 'O');
    str = str.replace(/??|??|???|???|??|??|???|???|???|???|???/g, 'U');
    str = str.replace(/???|??|???|???|???/g, 'Y');
    str = str.replace(/??/g, 'D');
    // Some system encode vietnamese combining accent as individual utf-8 characters
    // M???t v??i b??? encode coi c??c d???u m??, d???u ch??? nh?? m???t k?? t??? ri??ng bi???t n??n th??m hai d??ng n??y
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ''); // ?? ?? ?? ?? ??  huy???n, s???c, ng??, h???i, n???ng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ''); // ?? ?? ??  ??, ??, ??, ??, ??
    // Remove extra spaces
    // B??? c??c kho???ng tr???ng li???n nhau
    str = str.replace(/ + /g, ' ');
    str = str.trim();
    // Remove punctuations
    // B??? d???u c??u, k?? t??? ?????c bi???t
    str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, ' ');
    return str;
}

let increaseViewHome = async (req, res, next) => {
    Home.findOneAndUpdate(
        {_id: Types.ObjectId(req.body.hid)}, 
        {$inc: {total_view: 1}}
      ).exec(function (err) {         
            if (err) {
                return res.status(500).json({
                    success: false,
                });
            } 
            else {
                return res.status(200).json({
                    success: true,
                });
            }            
        });
};
module.exports = {
    getAllHome,
    getAllHomeByCity,
    getNewestHome,
    getBestSellingHome,
    getMostViewedHome,
    getSuggestionHome,
    getDetailHomeById,
    loadAllReviewByIdHome,
    findHomeByLocation,
    createHome,
    increaseViewHome
};

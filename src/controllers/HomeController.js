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
                    'address.city': new RegExp(req.body.txtSearch, 'i'),
                },
                {
                    'address.district': new RegExp(req.body.txtSearch, 'i'),
                },
                {
                    'address.area': new RegExp(req.body.txtSearch, 'i'),
                },
            ],
        }).exec((err, homes) => {
            if (err) {
                return res.status(404).json({ status: false, msg: 'Lỗi hệ thống' });
            } else {
                var homeMap = {};

                homes.forEach(function (home) {
                    homeMap[home._id] = home;
                });
                return res.status(200).json({ status: true, data: homeMap });
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
        var url = 'http://localhost:8080/api/v1/' + 'verify?id=' + token_mail_verification;
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
                check_in: `trước ` + req.body.check_in,
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
                msg: 'Đăng ký thành thông',
                home: newHome,
                homeDetail: newHomeDetails,
            });
        }
        if (oldHostByEmail) {
            return res.status(400).json({
                status: false,
                msg: 'Địa chỉ email đã tồn tại',
            });
        }
        if (oldHostByUsername) {
            return res.status(400).json({
                status: false,
                msg: 'Tên đăng nhập đã tồn tại',
            });
        }
        if (oldHomeByName) {
            return res.status(400).json({
                status: false,
                msg: 'Tên nhà đã tồn tại',
            });
        }
        const newHost = new User({
            _id: new Types.ObjectId(),
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            username: req.body.username,
            birthday: req.body.birthday,
            gender: req.body.gender,
            email: req.body.email,
            phone: req.body.phone,
            type: 'host',
            password: hashPassword,
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
            `Xác Minh Địa Chỉ Email`,
            ``,
            newHost.username,
            `Chúng tôi rất vui vì bạn đã đăng ký tài khoản trên DNA. Trước khi có thể sử dụng tài khoản của mình, bạn cần xác minh rằng đây là địa chỉ email của bạn bằng cách nhấp vào đây. Để đăng nhập bằng tên tài khoản vui lòng lưu lại thông tin sau. <br/>
            <p>Tên tài khoản: <strong>${newHost.username}</strong></p>
            <p>Mật khẩu: <strong>${randomPassword.toString()}</strong></p>
            `,
            url,
            `Nhấp Vào Đây Để Xác Minh`,
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
            check_in: `trước ` + req.body.check_in,
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
            msg: 'Đăng ký thành thông',
            host: newHost,
            home: newHome,
            homeDetail: newHomeDetails,
        });
        // newHome.then((handle) => {
        //     newHomeDetails.hid = handle._id;
        //     newHomeDetails.save((err, detail) => {
        //         if (err) {
        //             return res.status(404).json({ status: false, msg: 'Lỗi hệ thống' });
        //         } else {
        //             return res.status(200).json({
        //                 status: true,
        //                 msg: 'Đăng ký thành thông',
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
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
    str = str.replace(/Đ/g, 'D');
    // Some system encode vietnamese combining accent as individual utf-8 characters
    // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ''); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ''); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
    // Remove extra spaces
    // Bỏ các khoảng trắng liền nhau
    str = str.replace(/ + /g, ' ');
    str = str.trim();
    // Remove punctuations
    // Bỏ dấu câu, kí tự đặc biệt
    str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, ' ');
    return str;
}
module.exports = {
    getAllHome,
    getAllHomeByCity,
    getNewestHome,
    getBestSellingHome,
    getDetailHomeById,
    loadAllReviewByIdHome,
    findHomeByLocation,
    createHome,
};

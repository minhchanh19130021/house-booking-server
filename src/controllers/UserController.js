import sendEmail from '../configs/mailer';
import User from '../models/User';
import { Types } from 'mongoose';
const fetch = require('node-fetch');
require('dotenv').config();
var bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
import mongoose from 'mongoose';

let refreshTokens = [];
let loginUserWithGoogle = async (req, res) => {
    const CLIENT_ID_GOOGLE = '579552701437-98rmrd5c0n7d4hac8ibuscs54udmrnt9.apps.googleusercontent.com';
    try {
        const client = new OAuth2Client(CLIENT_ID_GOOGLE);
        const ticket = await client
            .verifyIdToken({
                idToken: req.body.idToken,
                audience: CLIENT_ID_GOOGLE,
            })
            .then((response) => {
                const { email, email_verified, family_name, given_name, picture } = response.payload;
                if (email_verified) {
                    User.findOne({ email }).exec(async (err, user) => {
                        if (err) {
                            return res.status(400).json({ status: false, msg: 'Lỗi hệ thống' });
                        } else {
                            if (user) {
                                const accessTokenUser = generateAccessToken(user);
                                const refreshTokenUser = generateRefreshToken(user);

                                refreshTokens.push(refreshTokenUser);
                                res.cookie('refreshTokenUser', refreshTokenUser, {
                                    httpOnly: true,
                                    secure: false,
                                    path: '/',
                                    sameSite: 'strict',
                                });
                                const { _id, email, username } = user;
                                return res.status(200).json({
                                    status: true,
                                    msg: 'Đăng nhập thành công',
                                    user: { _id, email, username, accessToken: accessTokenUser, status: true },
                                });
                            } else {
                                const salt = await bcrypt.genSalt(10);
                                let randomPassword = (Math.random() + 1).toString(36).substring(3).toString();
                                const hashPassword = await bcrypt.hash(randomPassword.toString(), salt);

                                const newUser = new User({
                                    _id: new Types.ObjectId(),
                                    firstname: family_name,
                                    lastname: given_name,
                                    username: email.split('@')[0],
                                    birthday: new Date().toISOString().slice(0, 10),
                                    gender: 'Nam',
                                    email: email,
                                    password: hashPassword,
                                    type: 'visitor',
                                    active: true,
                                    code_active: null,
                                    address: {
                                        city: null,
                                        district: null,
                                        village: null,
                                        specifically: null,
                                    },
                                });
                                newUser.save(async (err, data) => {
                                    if (err) {
                                        return res.status(400).json({ status: false, msg: 'Lỗi hệ thống' });
                                    } else {
                                        const accessTokenUser = generateAccessToken(user);
                                        const refreshTokenUser = generateRefreshToken(user);

                                        refreshTokens.push(refreshTokenUser);
                                        res.cookie('refreshTokenUser', refreshTokenUser, {
                                            httpOnly: true,
                                            secure: false,
                                            path: '/',
                                            sameSite: 'strict',
                                        });

                                        const { _id, username } = newUser;
                                        await sendEmail(
                                            newUser?.email,
                                            `Hỗ Trợ Đăng Nhập Bằng Tên Tài Khoản`,
                                            ``,
                                            newUser?.username,
                                            `Cảm ơn bạn đã sử dụng dịch vụ Đặt Nhà Online.<br>Mật khẩu khi đăng nhập bằng tên tài khoản của bạn là <strong>${randomPassword.toString()}</strong>`,
                                            'http://localhost:3000/',
                                            `Trang Chủ`,
                                        );
                                        return res.status(200).json({
                                            status: true,
                                            msg: 'Đăng nhập thành công',
                                            user: { _id, username, accessToken: accessTokenUser, status: true },
                                        });
                                    }
                                });
                            }
                        }
                    });
                }
            });
    } catch (error) {
        return res.status(500).json({ status: false, msg: error });
    }
};

let loginUserWithGoogles = async (req, res) => {
    const CLIENT_ID_GOOGLE = '579552701437-98rmrd5c0n7d4hac8ibuscs54udmrnt9.apps.googleusercontent.com';
    try {
        // const client = new OAuth2Client(CLIENT_ID_GOOGLE);
        // const ticket = await client
        //     .verifyIdToken({
        //         idToken: req.body.idToken,
        //         audience: CLIENT_ID_GOOGLE,
        //     })
        //     .then((response) => {
        const { email, email_verified, family_name, given_name, avatar } = req.body;
        if (email_verified) {
            User.findOne({ email }).exec(async (err, user) => {
                if (err) {
                    return res.status(400).json({ status: false, msg: 'Lỗi hệ thống' });
                } else {
                    if (user) {
                        const accessTokenUser = generateAccessToken(user);
                        const refreshTokenUser = generateRefreshToken(user);

                        refreshTokens.push(refreshTokenUser);
                        res.cookie('refreshTokenUser', refreshTokenUser, {
                            httpOnly: true,
                            secure: false,
                            path: '/',
                            sameSite: 'strict',
                        });
                        const { _id, email, username } = user;
                        return res.status(200).json({
                            status: true,
                            msg: 'Đăng nhập thành công',
                            user: { _id, email, username, accessToken: accessTokenUser, status: true },
                        });
                    } else {
                        const salt = await bcrypt.genSalt(10);
                        let randomPassword = (Math.random() + 1).toString(36).substring(3).toString();
                        const hashPassword = await bcrypt.hash(randomPassword.toString(), salt);

                        const newUser = new User({
                            _id: new Types.ObjectId(),
                            firstname: family_name,
                            lastname: given_name,
                            username: email.split('@')[0],
                            birthday: new Date().toISOString().slice(0, 10),
                            gender: 'Nam',
                            email: email,
                            password: hashPassword,
                            type: 'visitor',
                            active: true,
                            code_active: null,
                            address: {
                                city: null,
                                district: null,
                                village: null,
                                specifically: null,
                            },
                            avatar,
                        });
                        newUser.save(async (err, data) => {
                            if (err) {
                                return res.status(400).json({ status: false, msg: 'Lỗi hệ thống' });
                            } else {
                                const accessTokenUser = generateAccessToken(user);
                                const refreshTokenUser = generateRefreshToken(user);

                                refreshTokens.push(refreshTokenUser);
                                res.cookie('refreshTokenUser', refreshTokenUser, {
                                    httpOnly: true,
                                    secure: false,
                                    path: '/',
                                    sameSite: 'strict',
                                });

                                const { _id, username } = newUser;
                                await sendEmail(
                                    newUser?.email,
                                    `Hỗ Trợ Đăng Nhập Bằng Tên Tài Khoản`,
                                    ``,
                                    newUser?.username,
                                    `Cảm ơn bạn đã sử dụng dịch vụ Đặt Nhà Online.<br>Mật khẩu khi đăng nhập bằng tên tài khoản của bạn là <strong>${randomPassword.toString()}</strong>`,
                                    'http://localhost:3000/',
                                    `Trang Chủ`,
                                );
                                return res.status(200).json({
                                    status: true,
                                    msg: 'Đăng nhập thành công',
                                    user: { _id, username, accessToken: accessTokenUser, status: true },
                                });
                            }
                        });
                    }
                }
            });
        }
        // });
    } catch (error) {
        return res.status(500).json({ status: false, msg: error });
    }
};

let loginUserWithFacebook = async (req, res) => {
    try {
        const { userID, accessToken } = req.body;

        let urlGraphFacebook = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;
        fetch(urlGraphFacebook)
            .then((response) => response.json())
            .then((response) => {
                const { email, name } = response;
                User.findOne({ email }).exec(async (err, user) => {
                    if (err) {
                        return res.status(400).json({ status: false, msg: 'Lỗi hệ thống' });
                    } else {
                        if (user) {
                            const accessTokenUser = generateAccessToken(user);
                            const refreshTokenUser = generateRefreshToken(user);

                            refreshTokens.push(refreshTokenUser);
                            res.cookie('refreshTokenUser', refreshTokenUser, {
                                httpOnly: true,
                                secure: false,
                                path: '/',
                                sameSite: 'strict',
                            });
                            const { _id, email, username } = user;
                            return res.status(200).json({
                                status: true,
                                msg: 'Đăng nhập thành công',
                                user: { _id, email, username, accessToken: accessTokenUser, status: true },
                            });
                        } else {
                            const salt = await bcrypt.genSalt(10);
                            let randomPassword = (Math.random() + 1).toString(36).substring(3).toString();
                            const hashPassword = await bcrypt.hash(randomPassword.toString(), salt);

                            const newUser = new User({
                                _id: new Types.ObjectId(),
                                firstname: name.split(' ')[0],
                                lastname: name.split(' ')[1],
                                username: email.split('@')[0],
                                birthday: new Date().toISOString().slice(0, 10),
                                gender: 'Nam',
                                email: email,
                                password: hashPassword,
                                type: 'visitor',
                                active: true,
                                code_active: null,
                                address: {
                                    city: null,
                                    district: null,
                                    village: null,
                                    specifically: null,
                                },
                            });
                            newUser.save(async (err, data) => {
                                if (err) {
                                    return res.status(400).json({ status: false, msg: 'Lỗi hệ thống' });
                                } else {
                                    const accessTokenUser = generateAccessToken(user);
                                    const refreshTokenUser = generateRefreshToken(user);

                                    refreshTokens.push(refreshTokenUser);
                                    res.cookie('refreshTokenUser', refreshTokenUser, {
                                        httpOnly: true,
                                        secure: false,
                                        path: '/',
                                        sameSite: 'strict',
                                    });

                                    const { _id, username } = newUser;
                                    await sendEmail(
                                        newUser?.email,
                                        `Hỗ Trợ Đăng Nhập Bằng Tên Tài Khoản`,
                                        ``,
                                        newUser?.username,
                                        `Cảm ơn bạn đã sử dụng dịch vụ Đặt Nhà Online.<br>Mật khẩu khi đăng nhập bằng tên tài khoản của bạn là <strong>${randomPassword.toString()}</strong>`,
                                        'http://localhost:3000/',
                                        `Trang Chủ`,
                                    );
                                    return res.status(200).json({
                                        status: true,
                                        msg: 'Đăng nhập thành công',
                                        user: { _id, username, accessToken: accessTokenUser, status: true },
                                    });
                                }
                            });
                        }
                    }
                });
            });
    } catch (error) {
        return res.status(500).json({ status: false, msg: 'Hệ thống đang bảo trì' });
    }
};

let loginUser = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });

        if (!user) {
            return res.status(200).json({ status: false, msg: 'Tên đăng nhập không chính xác' });
        } else {
            if (!user.active) {
                return res.status(200).json({ status: false, msg: 'Tài khoản chưa được kích hoạt' });
            }

            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if (!validPassword) {
                return res.status(200).json({
                    status: false,
                    msg: 'Mật khẩu không chính xác',
                });
            }
            if (user && validPassword) {
                const accessTokenUser = generateAccessToken(user);
                const refreshTokenUser = generateRefreshToken(user);

                refreshTokens.push(refreshTokenUser);
                res.cookie('refreshTokenUser', refreshTokenUser, {
                    httpOnly: true,
                    secure: false,
                    path: '/',
                    sameSite: 'strict',
                });
                const { _id, email, username, avatar, type } = user;
                return res.status(200).json({
                    status: true,
                    msg: 'Đăng nhập thành công',
                    _id,
                    username,
                    avatar,
                    type,
                    accessToken: accessTokenUser,
                });
            }
        }
    } catch (error) {
        return res.status(500).json({ status: false, msg: 'Hệ thống đang bảo trì' });
    }
};
let changePassword = async (req, res) => {
    try {
        const oldUser = await User.findOne({ _id: mongoose.Types.ObjectId(req.body.idUser) });
        if (!oldUser) {
            return res.status(404).json({ status: false, msg: 'Không tìm thấy tài khoản' });
        }

        console.log(req.body.oldPassword);
        const validPassword = await bcrypt.compare(req.body.oldPassword, oldUser.password);

        if (!validPassword) {
            return res.status(404).json({ status: false, msg: 'Mật khẩu cũ không chính xác' });
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(req.body.confirmPassword, salt);

            oldUser.password = hashPassword;
            await oldUser.save();
            return res.status(200).json({ status: true, msg: 'Thay đổi mật khẩu thành công' });
        }
    } catch (error) {
        // console.log(error);
        return res.status(500).json({ status: false, msg: error.message });
    }
};
let registerUser = async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);
        const token_mail_verification = jwt.sign(
            { email: req.body.email, username: req.body.username },
            process.env.VERIFY_TOKEN_USER_SECRET,
            {
                expiresIn: '365d',
            },
        );
        var url = 'http://localhost:8080/api/v1/' + 'verify?id=' + token_mail_verification;
        //create new user
        const oldUserByEmail = await User.findOne({ email: req.body.email });
        const oldUserByUsername = await User.findOne({
            username: req.body.username,
        });
        if (oldUserByUsername) {
            return res.status(400).json({
                status: false,
                msg: 'Tên đăng nhập đã tồn tại',
            });
        } else if (oldUserByEmail) {
            return res.status(400).json({
                status: false,
                msg: 'Địa chỉ email đã tồn tại',
            });
        }
        const city = req.body.address.city.split('_')[1];
        const district = req.body.address.district.split('_')[1];
        const village = req.body.address.village.split('_')[1];

        const newUser = await new User({
            _id: new Types.ObjectId(),
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            username: req.body.username,
            birthday: req.body.birthday,
            gender: req.body.gender,
            email: req.body.email,
            password: hashPassword,
            address: {
                city: city,
                district: district,
                village: village,
                specifically: req.body.address.specifically + ' ' + village + ' ' + district + ' ' + city,
            },
            type: 'visitor',
            code_active: token_mail_verification,
        });

        await sendEmail(
            newUser?.email,
            `Xác Minh Địa Chỉ Email`,
            ``,
            newUser.username,
            `Chúng tôi rất vui vì bạn đã đăng ký tài khoản trên DNA. Trước khi có thể sử dụng tài khoản của mình, bạn cần xác minh rằng đây là địa chỉ email của bạn bằng cách nhấp vào đây`,
            url,
            `Nhấp Vào Đây Để Xác Minh`,
        );

        await newUser.save();
        return res.status(200).json({
            status: true,
            msg: 'Đăng ký thành công vui lòng kiểm tra email để kích hoạt tài khoản',
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            msg: error,
        });
    }
};

let verifyUser = async (req, res) => {
    const verify = jwt.verify(req.query.id, process.env.VERIFY_TOKEN_USER_SECRET, async (err, decode) => {
        if (err) {
            res.writeHead(307, {
                Location: 'http://localhost:3000/confirm-fail',
            });
            res.end();
        } else {
            try {
                const user = await User.findOne({ email: decode?.email });
                if (!user) {
                    res.writeHead(307, {
                        Location: 'http://localhost:3000/confirm-fail',
                    });
                } else {
                    user.active = true;
                    user.code_active = null;
                    await user.save();

                    res.writeHead(307, {
                        Location: 'http://localhost:3000/confirm-success',
                    });
                    res.end();
                }
            } catch (error) {
                return res.status(500).json({ status: false, msg: error });
            }
        }
    });
};

let requestResetPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            const token = jwt.sign({ email: user?.email, id: user?._id }, process.env.RESET_PASSWORD_SECRET, {
                expiresIn: '3m',
            });
            const url = `http://localhost:3000/new-password/id=${user._id}/token=${token}`;
            await sendEmail(
                user?.email,
                `Quên Mật Khẩu`,
                ``,
                user?.username,
                `Chúng tôi nhận được yêu cầu khôi phục mật khẩu từ bạn. Vui lòng nhấn vào liên kết phía bên dưới để cập nhật mật khẩu mới.
                Lưu ý đường dẫn chỉ có tác dụng trong vòng 3 phút`,
                url,
                `Cập nhật mật khẩu mới`,
            );

            return res.status(200).json({
                status: true,
                msg: 'Vui lòng kiểm tra email để tạo mật khẩu mới',
            });
        }
        return res.status(404).json({
            status: false,
            msg: 'Không tìm thấy tài khoản phù hợp với email',
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            msg: error.message,
        });
    }
};

let verifyLinkResetPassword = async (req, res) => {
    try {
        const verify = jwt.verify(req.body.token, process.env.RESET_PASSWORD_SECRET, async (err, decode) => {
            if (err) {
                return res.status(400).json({
                    status: false,
                    msg: 'Đường dẫn hết thời gian sử dụng',
                });
            }

            const oldUser = await User.findOne({
                _id: decode?.id,
                email: decode?.email,
            });

            const salt = await bcrypt.genSalt(10);
            const encryptedPassword = await bcrypt.hash(req.body.password, salt);
            oldUser.password = encryptedPassword;
            await oldUser.save();

            return res.status(200).json({
                status: true,
                msg: 'Thay đổi mật khẩu thành công',
                data: oldUser,
            });
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            msg: error.message,
        });
    }
};

let requestRefreshToken = async (req, res) => {
    try {
        const refreshTokenFromUser = await req.cookies.refreshTokenUser;
        const userByRefreshToken = await User.findOne({
            refreshToken: refreshTokenFromUser,
        });
        if (!refreshTokenFromUser) {
            return res.status(401).json({ status: false, msg: 'Bạn chưa có refreshToken' });
        } else {
            if (!refreshTokens.includes(refreshTokenFromUser)) {
                return res.status(401).json({ status: false, msg: 'RefreshToken không phù hợp' });
            }
            jwt.verify(refreshTokenFromUser, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
                if (err) {
                    console.log(err);
                } else {
                    refreshTokens = refreshTokens.filter((token) => token !== refreshTokenFromUser);
                    const newAccessToken = generateAccessToken(user);
                    const newRefreshToken = generateRefreshToken(user);
                    // userByRefreshToken.refreshToken = newAccessToken;
                    // userByRefreshToken.save();
                    refreshTokens.push(newRefreshToken);

                    res.cookie('refreshTokenUser', newRefreshToken, {
                        httpOnly: true,
                        secure: false,
                        path: '/',
                        sameSite: 'strict',
                    });
                    return res.status(200).json({
                        status: true,
                        msg: 'RefreshToken thành công',
                        accessToken: newAccessToken,
                    });
                }
            });
        }
    } catch (error) {
        return res.status(500).json({ status: false, msg: error });
    }
};

let logoutUser = async (req, res) => {
    try {
        res.clearCookie('refreshTokenUser');
        refreshTokens = refreshTokens.filter((token) => token !== req.cookies.refreshTokenUser);
        return res.status(200).json({ status: true, msg: 'Đăng xuất thành công' });
    } catch (error) {
        return res.status(500).json({ status: false, msg: error });
    }
};
let checkExistedUsername = async (req, res) => {
    try {
        const oldUser = await User.findOne({ username: req.body.username });
        if (oldUser) {
            return res.status(404).json({ status: false, msg: 'Tên đăng nhập đã tồn tại' });
        } else {
            return res.status(200).json({ status: false, msg: '' });
        }
    } catch (error) {
        return res.status(500).json({ status: false, msg: error });
    }
};

let getUserById = async (req, res, next) => {
    User.find({ _id: Types.ObjectId(req.body?.uid) }).exec(function (err, user) {
        return res.status(200).json({
            success: true,
            data: user,
        });
    });
};

let updateUserInformation = async (req, res, next) => {
    let user = await User.findOneAndUpdate(
        { _id: req.body._id },
        {
            $set: {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                username: req.body.username,
                gender: req.body.gender,
                birthday: req.body.birthday,
                gender: req.body.gender,
                avatar: req.body.avatar,
            },
        },
    );
    if (user) {
        return res.status(200).json({
            success: true,
        });
    } else {
        return res.status(500).json({
            success: false,
        });
    }
};

let updateUserBonusPoint = async (req, res, next) => {
    let user = await User.findOneAndUpdate(
        { _id: req.body._id },
        {
            $set: {
                bonus_point: req.body.bonus_point,
            },
        },
    );
    if (user) {
        return res.status(200).json({
            success: true,
        });
    } else {
        return res.status(500).json({
            success: false,
        });
    }
};

let isLogin = async (req, res, next) => {
    return res.status(200).json({
        success: true,
    });
};

function generateAccessToken(user) {
    return jwt.sign(
        {
            id: user?._id,
            type: user?.type,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1d' },
    );
}

function generateRefreshToken(user) {
    return jwt.sign(
        {
            id: user?._id,
            type: user?.type,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '365d' },
    );
}

module.exports = {
    registerUser,
    loginUser,
    verifyUser,
    logoutUser,
    requestRefreshToken,
    requestResetPassword,
    verifyLinkResetPassword,
    getUserById,
    updateUserInformation,
    isLogin,
    loginUserWithGoogle,
    loginUserWithGoogles,
    loginUserWithFacebook,
    updateUserBonusPoint,
    checkExistedUsername,
    changePassword,
};

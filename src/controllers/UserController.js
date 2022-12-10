import sendEmail from '../configs/mailer';
import User from '../models/User';
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
import { Types } from 'mongoose';

let refreshTokens = [];

let registerUser = async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);
        var date = new Date();
        var mail = {
            id: req.body.id,
            created: date.toString(),
        };
        const token_mail_verification = jwt.sign(mail, process.env.VERIFY_TOKEN_USER_SECRET, {
            expiresIn: '1d',
        });
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
            msg: 'Đăng ký thành công',
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            msg: error,
        });
    }
};

let verifyUser = async (req, res) => {
    const token = await req.query.id;
    const user = await User.findOne({ code_active: token });
    try {
        if (!user) {
            // res.send("<h1>Bad Request</h1>");
            res.writeHead(307, {
                Location: 'http://localhost:3000/confirm-fail',
            });

            // return res.status(200).json({ msg: "thất bại" });
        } else {
            // res.send("<h1>Email " + mailOptions.to + " is been Successfully verified");
            user.active = true;
            user.code_active = null;
            await user.save();

            res.writeHead(307, {
                Location: 'http://localhost:3000/confirm-success',
            });
            res.end();
            // res.redired(307, "http://localhost:3000/confirm-success");
            // return res.status(200).json({ msg: "thành cong" });
        }
    } catch (error) {
        return res.status(500).json({ status: false, msg: error });
    }
};

let requestResetPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            const token = jwt.sign({ email: user.email, id: user.id }, process.env.RESET_PASSWORD_SECRET, {
                expiresIn: '5m',
            });
            const url = `http://localhost:3000/new-password/id=${user._id}/token=${token}`;
            await sendEmail(
                user?.email,
                `Quên Mật Khẩu`,
                ``,
                user?.username,
                `Chúng tôi nhận được yêu cầu khôi phục mật khẩu từ bạn. Vui lòng nhấn vào liên kết phía bên dưới để cập nhật mật khẩu mới.`,
                url,
                `Cập nhật mật khẩu mới`,
            );

            return res.status(200).json({
                status: true,
                msg: 'Vui lòng kiểm tra email để tạo mật khẩu mới',
                link: url,
            });
        }
        return res.status(404).json({
            status: false,
            msg: 'Không tìm thấy tài khoản phù hợp với email',
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            msg: error,
        });
    }
};

let verifyLinkResetPassword = async (req, res) => {
    try {
        const verify = jwt.verify(req.body.token, process.env.RESET_PASSWORD_SECRET);

        if (verify) {
            const oldUser = await User.findOne({
                _id: req.body.id,
                email: verify.email,
            });
            if (!oldUser) {
                return res.status(404).json({
                    status: false,
                    msg: 'Đường dẫn không chính xác. Vui lòng kiểm tra lại email',
                });
            } else {
                const salt = await bcrypt.genSalt(10);
                const encryptedPassword = await bcrypt.hash(req.body.password, salt);
                oldUser.password = encryptedPassword;
                await oldUser.save();

                return res.status(200).json({
                    status: true,
                    msg: 'Thay đổi mật khẩu thành công',
                    data: oldUser,
                });
            }
        } else {
            return res.status(400).json({
                msg: 'Đường dẫn hết thời gian sử dụng',
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: false,
            msg: error,
        });
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
                const { password, codeActive, type, ...other } = user._doc;
                return res.status(200).json({
                    status: true,
                    msg: 'Đăng nhập thành công',
                    ...other,
                    accessToken: accessTokenUser,
                });
            }
        }
    } catch (error) {
        return res.status(500).json({ status: false, msg: 'Hệ thống đang bảo trì' });
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
let updateUser = async (req, res) => {
    try {
        const refreshTokenFromUser = await req.cookies.refreshTokenUser;
        const userByRefreshToken = await User.findOne({
            refreshToken: refreshTokenFromUser,
        });

        if (!userByRefreshToken) {
            return res.status(404).json({ status: false, msg: 'Bạn chưa đăng nhập' });
        } else {
            userByRefreshToken.firstname = req.body.firstname;
            userByRefreshToken.lastname = req.body.lastname;
            userByRefreshToken.username = req.body.username;
            userByRefreshToken.gender = req.body.gender;
            userByRefreshToken.birthday = req.body.birthday;
            userByRefreshToken.email = req.body.email;

            await userByRefreshToken.save();
            return res.status(200).json({ status: true, msg: 'Cập nhập thông tin thành công' });
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

function generateAccessToken(user) {
    return jwt.sign(
        {
            id: user.id,
            type: user.type,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1d' },
    );
}
function generateRefreshToken(user) {
    return jwt.sign(
        {
            id: user.id,
            type: user.type,
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
    updateUser,
    requestResetPassword,
    verifyLinkResetPassword,
};

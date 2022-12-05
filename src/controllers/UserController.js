import User from "../models/User";
require("dotenv").config();
const bcrypt = require("bcrypt");
var nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
var LocalStorage = require("node-localstorage").LocalStorage,
  localStorage = new LocalStorage("./scratch");

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
    const token_mail_verification = jwt.sign(
      mail,
      process.env.VERIFY_TOKEN_USER_SECRET,
      {
        expiresIn: "1d",
      }
    );
    var url =
      "http://localhost:8080/api/v1/" + "verify?id=" + token_mail_verification;
    //create new user
    const oldUserByEmail = await User.findOne({ email: req.body.email });
    const oldUserByUsername = await User.findOne({
      username: req.body.username,
    });
    if (oldUserByUsername) {
      return res.status(400).json({
        status: false,
        msg: "Tên đăng nhập đã tồn tại",
      });
    } else if (oldUserByEmail) {
      return res.status(400).json({
        status: false,
        msg: "Địa chỉ email đã tồn tại",
      });
    }
    const city = req.body.address.city.split("_")[1];
    const district = req.body.address.district.split("_")[1];
    const village = req.body.address.village.split("_")[1];

    const newUser = await new User({
      id: req.body.id,
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
        specifically:
          req.body.address.specifically +
          " " +
          village +
          " " +
          district +
          " " +
          city,
      },
      type: "visitor",
      active: req.body.active,
      codeActive: token_mail_verification,
    });

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "tmdt.2022.v1@gmail.com",
        pass: "rmuftepcchlbpsog",
      },
    });
    var mailOptions = {
      from: "2022 tmdt",
      to: "19130021@st.hcmuaf.edu.vn",
      subject: "Account Verification",
      text: "Click on the link below to veriy your account " + url,
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(502).json({
          success: false,
          data: "fail",
        });
      } else {
        console.log("Email sent: " + info.response);
        return res.status(200).json({
          success: true,
          data: "ok",
        });
      }
    });
    res.cookie("active", token_mail_verification, {
      httpOnly: true,
      secure: false,
      path: "/",
      sameSite: "strict",
    });

    await newUser.save();
    return res.status(200).json({
      status: true,
      msg: "Đăng ký thành công",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      msg: error,
    });
  }
};

let requestResetPassword = (req, res) => {
  try {
    const oldUserByEmail = User.findOne({ email: req.body.email });
    if (!oldUserByEmail) {
      return res
        .status(200)
        .json({ status: false, msg: "Không tim thấy tài khoản" });
    } else {
      var mail = {
        id: req.body.email,
        created: new Date().toString(),
      };
      const token_reset_password = jwt.sign(
        mail,
        process.env.RESET_PASSWORD_SECRET,
        {
          expiresIn: "1d",
        }
      );
      const link = `http://localhost:8080/reset-password/id=${oldUserByEmail._id}/token=${token_reset_password}`;
      return res.status(200).json({
        status: true,
        msg: "Yêu cầu khôi phục tài khoản thành công",
        link: link,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

let verifyResetPassword = async (req, res) => {
  try {
    const token = req.query.id;
    const user = await User.findOne({ username: token });
    if (!user) {
      res.writeHead(307, {
        Location: "http://localhost:3000/confirm-fail",
      });
    } else {
      res.writeHead(307, {
        Location: "http://localhost:3000/confirm-success",
      });
      res.end();
    }
  } catch (error) {
    console.log(error);
  }
};

let verifyUser = async (req, res) => {
  try {
    const token = await req.query.id;
    const user = await User.findOne({ codeActive: token });

    if (!user) {
      res.writeHead(307, {
        Location: "http://localhost:3000/confirm-fail",
      });
    } else {
      user.active = true;
      user.codeActive = null;
      user.save();

      res.writeHead(307, {
        Location: "http://localhost:3000/confirm-success",
      });
      res.end();
    }
  } catch (error) {
    return res.status(500).json({ status: false, msg: error });
  }
};

let loginUser = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      return res
        .status(200)
        .json({ status: false, msg: "Tên đăng nhập không chính xác" });
    } else {
      if (!user.active) {
        return res
          .status(200)
          .json({ status: false, msg: "Tài khoản chưa được kích hoạt" });
      }

      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!validPassword) {
        return res.status(200).json({
          status: false,
          msg: "Mật khẩu không chính xác",
        });
      }
      if (user && validPassword) {
        const accessTokenUser = generateAccessToken(user);
        const refreshTokenUser = generateRefreshToken(user);

        refreshTokens.push(refreshTokenUser);
        res.cookie("refreshTokenUser", refreshTokenUser, {
          httpOnly: true,
          secure: false,
          path: "/",
          sameSite: "strict",
        });
        const { password, codeActive, type, ...other } = user._doc;
        return res.status(200).json({
          status: true,
          msg: "Đăng nhập thành công",
          ...other,
          accessToken: accessTokenUser,
        });
      }
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, msg: "Hệ thống đang bảo trì" });
  }
};

let requestRefreshToken = async (req, res) => {
  try {
    const refreshTokenFromUser = await req.cookies.refreshTokenUser;
    const userByRefreshToken = await User.findOne({
      refreshToken: refreshTokenFromUser,
    });
    if (!refreshTokenFromUser) {
      return res
        .status(401)
        .json({ status: false, msg: "Bạn chưa có refreshToken" });
    } else {
      if (!refreshTokens.includes(refreshTokenFromUser)) {
        return res
          .status(401)
          .json({ status: false, msg: "RefreshToken không phù hợp" });
      }
      jwt.verify(
        refreshTokenFromUser,
        process.env.REFRESH_TOKEN_SECRET,
        (err, user) => {
          if (err) {
            console.log(err);
          } else {
            refreshTokens = refreshTokens.filter(
              (token) => token !== refreshTokenFromUser
            );
            const newAccessToken = generateAccessToken(user);
            const newRefreshToken = generateRefreshToken(user);
            // userByRefreshToken.refreshToken = newAccessToken;
            // userByRefreshToken.save();
            refreshTokens.push(newRefreshToken);

            res.cookie("refreshTokenUser", newRefreshToken, {
              httpOnly: true,
              secure: false,
              path: "/",
              sameSite: "strict",
            });
            return res.status(200).json({
              status: true,
              msg: "RefreshToken thành công",
              accessToken: newAccessToken,
            });
          }
        }
      );
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
      return res.status(404).json({ status: false, msg: "Bạn chưa đăng nhập" });
    } else {
      userByRefreshToken.firstname = req.body.firstname;
      userByRefreshToken.lastname = req.body.lastname;
      userByRefreshToken.username = req.body.username;
      userByRefreshToken.gender = req.body.gender;
      userByRefreshToken.birthday = req.body.birthday;
      userByRefreshToken.email = req.body.email;

      await userByRefreshToken.save();
      return res
        .status(200)
        .json({ status: true, msg: "Cập nhập thông tin thành công" });
    }
  } catch (error) {
    return res.status(500).json({ status: false, msg: error });
  }
};

let logoutUser = async (req, res) => {
  try {
    res.clearCookie("refreshTokenUser");
    refreshTokens = refreshTokens.filter(
      (token) => token !== req.cookies.refreshTokenUser
    );
    return res.status(200).json({ status: true, msg: "Đăng xuất thành công" });
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
    { expiresIn: "1d" }
  );
}
function generateRefreshToken(user) {
  return jwt.sign(
    {
      id: user.id,
      type: user.type,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "365d" }
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
};

const jwt = require('jsonwebtoken');

const middewareController = {
    verifyToken: (req, res, next) => {
        const token = req?.headers?.token;
        if (token == 'Bearer undefined' || token == undefined) {
            return res.status(401).json('Bạn chưa có mã token');
        }
        if (token) {
            const accessToken = token.split(' ')[1];
            jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
                if (err) {
                    res.status(403).json('Token không chính xác');
                }
                next();
            });
        } else {
                return res.status(401).json('Bạn chưa có mã token');
        }
    },
};

module.exports = middewareController;

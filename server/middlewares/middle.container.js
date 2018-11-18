const jwt = require("jsonwebtoken");
module.exports = {
    jwtTokenByPasser: (req, res, next) => {
        const token = req.headers["auth"];
        if (!token) {
            res.status(401);
            res.json({
                success: false,
                message: "No token provided"
            });
        } else {
            jwt.verify(token, "football_geek", (err, token) => {
                if (err) {
                    res.json({
                        success: false,
                        message: "Token Invalid",
                        err
                    });
                } else {
                    req.decoded = token;
                    next();
                }
            });
        }
    }
}
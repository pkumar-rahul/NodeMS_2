const jwt = require("jsonwebtoken");
module.exports = async function isAuthenticated(req, res, next) {
    if (req.headers["authorization"]) {
        const token = req.headers["authorization"].split(" ")[1];
        jwt.verify(token, "OurSecretKey", (err, user) => {
            if (err) {
                return res.json({ message: err });
            } else {
                req.user = user;
                next();
            }
        });
    } else {
      res.status(500).json({ message: "Token Not Found !" });
    }
};
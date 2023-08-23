const jwt = require("jsonwebtoken");
const fetchuser = (req, res, next) => {
  const JWT_Secret = "Ishaan";
  const token = req.header("auth-token");
  if (!token) {
    res.status(400).send({ error: "please verify" });
  }
  try {
    const data = jwt.verify(token, JWT_Secret);
    req.user = data.user;
    next();
  } catch (error) {
    res.send(401);
  }
};
module.exports = fetchuser;

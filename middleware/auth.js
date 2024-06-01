const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      throw new Error("Authentification échouée");
    }

    const decodedToken = jwt.verify(token, process.env.RANDOM_TOKEN_SECRET);

    if (!decodedToken.userId) {
      throw new Error("Authentification échouée");
    }

    req.auth = {
      userId: decodedToken.userId,
      role: decodedToken.role,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: "Authentification échouée" });
  }
};

import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "Token Missing" });
    }

    try {
      const decoded = await jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded);
      req.user = decoded.id;
      next();
    } catch (error) {
      return res
        .status(401)
        .json({ success: false, message: "Token is Invalid" });
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Something Went Wrong While Validating the Token",
    });
  }
};

const adminOnly = (req, res, next) => {
  const token = req.cookies["token"];

  const adminSecretKey = "adminTheLeader";

  if (!token)
    return res.status(403).json({
      success: false,
      message: "Only Admin can access this route",
    });

  const jwtData = jwt.verify(token, process.env.JWT_SECRET);

  const isMatched = jwtData.secretKey === adminSecretKey;

  if (!isMatched)
    return res.status(403).json({
      success: false,
      message: "Only Admin can access this route",
    });

  next();
};

const socketAuthenticator = async (err, socket, next) => {
  try {
    if (err) return next(err);

    const authToken = socket.request.cookies["token"];

    if (!authToken) return next(new Error("Please login to access this route"));

    const decodedData = jwt.verify(authToken, process.env.JWT_SECRET);

    const user = await UserModel.findById(decodedData._id);

    if (!user) return next(new Error("Please login to access this route"));

    socket.user = user;

    return next();
  } catch (error) {
    console.log(error);
    return next(new Error("Please login to access this route"));
  }
};

export { isAuthenticated, adminOnly, socketAuthenticator };

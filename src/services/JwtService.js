const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const generalAccessToken = async (payload) => {
  const accessToken = jwt.sign(
    {
      ...payload,
    },
    process.env.ACCESS_TOKEN,
    { expiresIn: "2h" }
  );
  return accessToken;
};

const generalRefreshToken = async (payload) => {
  const refreshToken = jwt.sign(
    {
      ...payload,
    },
    process.env.REFRESH_TOKEN,
    { expiresIn: "365d" }
  );
  return refreshToken;
};

const refreshTokenJwtService = async (token) => {
  try {
    const user = jwt.verify(token, process.env.REFRESH_TOKEN);

    const access_token = await generalAccessToken({
      id: user?.id,
      isAdmin: user?.isAdmin,
    });

    return {
      status: "OK",
      message: "Successfully refresh token",
      access_token,
    };
  } catch (e) {
    return {
      status: "ERR",
      message: "The refresh token is invalid",
      data: err,
    };
  }
};

module.exports = {
  generalAccessToken,
  generalRefreshToken,
  refreshTokenJwtService,
};

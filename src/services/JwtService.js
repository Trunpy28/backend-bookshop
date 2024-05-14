const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const generalAccessToken = async (payload) => {
    const accessToken = jwt.sign({
        ...payload
    },process.env.ACCESS_TOKEN,{expiresIn: '3h'})
    return accessToken;
}

const generalRefreshToken = async (payload) => {
    const refreshToken = jwt.sign({
        ...payload
    },process.env.REFRESH_TOKEN,{expiresIn: '365d'})
    return refreshToken;
}

const refreshTokenJwtService = (token) => {
    return new Promise((resolve, reject) => {
        try {
            jwt.verify(token,process.env.REFRESH_TOKEN,async (err,user) => {
                if(err){
                    resolve({
                        status: 'ERR',
                        message: 'The refresh token is invalid',
                        data: err
                    })
                }

                const access_token = await generalAccessToken({
                    id: user?.id,
                    isAdmin: user?.isAdmin
                });

                resolve({
                    status: 'OK',
                    message: 'Successfully refresh token',
                    access_token
                })
            })

        }catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    generalAccessToken,
    generalRefreshToken,
    refreshTokenJwtService
}
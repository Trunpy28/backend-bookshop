const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const generalAccessToken = async (payload) => {
    const accessToken = jwt.sign({
        payload
    },process.env.ACCESS_TOKEN,{expiresIn: '1h'})
    return accessToken;
}

const generalRefreshToken = async (payload) => {
    const refreshToken = jwt.sign({
        payload
    },process.env.REFRESH_TOKEN,{expiresIn: '365d'})
    return refreshToken;
}

const refreshTokenJwtService = (token) => {
    return new Promise((resolve, reject) => {
        try {
            console.log('token',token);
            jwt.verify(token,process.env.REFRESH_TOKEN,async (err,user) => {
                if(err){
                    resolve({
                        status: 'ERROR',
                        message: 'The refresh token is invalid',
                        data: err
                    })
                }

                const {payload} = user;
                const access_token = await generalAccessToken({
                    id: payload?.id,
                    isAdmin: payload?.isAdmin
                });
                console.log('access_token',access_token);

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
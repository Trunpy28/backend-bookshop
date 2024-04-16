const jwt =require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const authMiddleware = (req,res,next) => {
    const token = req.headers.token.split(' ')[1]
    jwt.verify(token,process.env.ACCESS_TOKEN,function(err,user) {
        if(err){
            return res.status(404).json({
                message: 'The authentication token',
                status: 'ERROR'
            })
        }
        const {payload} = user;
        if(payload?.isAdmin){
            next();
        }else{
            return res.status(404).json({
                message: 'The authentication token',
                status: 'ERROR'
            })
        }
    });
}

const authUserMiddleware = (req,res,next) => {
    const token = req.headers.token.split(' ')[1];
    const userId = req.params.id
    jwt.verify(token,process.env.ACCESS_TOKEN,function(err,user) {
        if(err){
            return res.status(404).json({
                message: 'The authentication token',
                status: 'ERROR'
            })
        }
        const {payload} = user;
        if(payload?.isAdmin || payload?.is === userId){
            next();
        }else{S
            return res.status(404).json({
                message: 'The authentication token',
                status: 'ERROR'
            })
        }
    });
}
module.exports = {
    authMiddleware,
    authUserMiddleware
}
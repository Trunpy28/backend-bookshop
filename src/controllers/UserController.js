const UserServices = require('../services/UserService');
const JwtService = require('../services/JwtService');

const createUser = async (req,res) => {
    try {
        const {name,email,password,confirmPassword,phone,address} = req.body;
        const regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        const ischeckEmail = regex.test(email);
        if(!name || !email || !password || !confirmPassword || !phone || !address) {
            return res.status(200).json({
                status: 'ERR',
                message: 'Please fill all the fields'
            })
        }else if(!ischeckEmail){
            return res.status(200).json({
                status: 'ERR',
                message: 'Please enter a valid email'
            })
        }else if(password !== confirmPassword){
            return res.status(200).json({
                status: 'ERR',
                message: 'Passwords do not match'
            })
        }

        const respond = await UserServices.createUser(req.body);
        return res.status(200).json(respond);
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const loginUser = async (req,res) => {
    try {
        const {email} = req.body;
        const regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        const ischeckEmail = regex.test(email);
        if(!ischeckEmail){
            return res.status(200).json({
                status: 'ERR',
                message: 'Please enter a valid email'
            })
        }

        const respond = await UserServices.loginUser(req.body);
        return res.status(200).json(respond);
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const updateUser = async (req,res) => {
    try {
        const userId = req.params.id;
        const data = req.body;
        if(!userId){
            return res.status(200).json({
                status: 'ERR',
                message: 'The userId is required'
            })
        }

        const respond = await UserServices.updateUser(userId,data);
        return res.status(200).json(respond);
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const deleteUser = async (req,res) => {
    try {
        const userId = req.params.id;

        if(!userId){
            return res.status(200).json({
                status: 'ERR',
                message: 'The userId is required'
            })
        }
        const respond = await UserServices.deleteUser(userId);
        return res.status(200).json(respond);
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const getAllUser = async (req,res) => {
    try {
        const respond = await UserServices.getAllUser();
        return res.status(200).json(respond);
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const getDetailUser = async (req,res) => {
    try {
        const userId = req.params.id;

        if(!userId){
            return res.status(200).json({
                status: 'ERR',
                message: 'The userId is required'
            })
        }
        const respond = await UserServices.getDetailUser(userId);
        return res.status(200).json(respond);
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const refreshToken = async (req,res) => {
    try {
        const token = req.headers.token.split(' ')[1];

        if(!token){
            return res.status(200).json({
                status: 'ERR',
                message: 'The token is required'
            })
        }
        const respond = await JwtService.refreshTokenJwtService(token);
        return res.status(200).json(respond);
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

module.exports = {
    createUser,
    loginUser,
    updateUser,
    deleteUser,
    getAllUser,
    getDetailUser,
    refreshToken
}
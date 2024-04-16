const User = require("../models/UserModel");
// @ts-ignore
const bCrypt = require("bCrypt");
const jwt = require('jsonwebtoken');
const { generalAccessToken, generalRefreshToken } = require("./JwtService");

const createUser = (newUser) => {
    return new Promise(async (resolve, reject) => {
        const {name,email,password,confirmPassword,phone,address} = newUser;
        try {
            const checkUser = await User.findOne({
                email: email
            })
            if(checkUser !== null) {
                resolve({
                    status: 'OK',
                    message: 'The email already exists'
                })
            }
            const hash = bCrypt.hashSync(password, 10);
            const createdUser = await User.create({
                name, 
                email, 
                password: hash,  
                confirmPassword: hash,
                phone,
                address
            });
            if (createdUser){
                resolve({
                    status: 'OK',
                    message: 'User created successfully',
                    data: createdUser
                })
            }
        }catch (e) {
            reject(e);
        }
    })
}

const loginUser = (userLogin) => {
    return new Promise(async (resolve, reject) => {
        const {email,password} = userLogin;
        try {
            const checkUser = await User.findOne({
                email: email
            })
            if(checkUser === null) {
                resolve({
                    status: 'OK',
                    message: 'The user is not defined'
                })
            }
            const comparePassword = bCrypt.compareSync(password, checkUser.password);

            if(!comparePassword) {
                resolve({
                    status: 'OK',
                    message: 'The password or user is incorrect'
                })
            }

            const access_token = await generalAccessToken({
                id: checkUser.id,
                isAdmin: checkUser.isAdmin
            })
            const refresh_token = await generalRefreshToken({
                id: checkUser.id,
                isAdmin: checkUser.isAdmin
            })

            resolve({
                status: 'OK',
                message: 'User login successfully',
                access_token: access_token,
                refresh_token: refresh_token
            })

        }catch (e) {
            reject(e);
        }
    })
}

const updateUser = (id,data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkUser = await User.findById(id);

            if(checkUser === null) {
                resolve({
                    status: 'OK',
                    message: 'The user is not defined'
                })
            }
            
            const updatedUser = await User.findByIdAndUpdate(id,data,{new: true});
            
            resolve({
                status: 'OK',
                message: 'User updated successfully',
                data: updatedUser
            })
        }catch (e) {
            reject(e);
        }
    })
}

const deleteUser = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkUser = await User.findById(id);

            if(checkUser === null) {
                resolve({
                    status: 'OK',
                    message: 'The user is not defined'
                })
            }
            
            await User.findByIdAndDelete(id);
            
            resolve({
                status: 'OK',
                message: 'Delete user successfully'
            })
        }catch (e) {
            reject(e);
        }
    })
}

const getAllUser = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allUser = await User.find();
            
            resolve({
                status: 'OK',
                message: 'Get all user successfully',
                data: allUser
            })
        }catch (e) {
            reject(e);
        }
    })
}

const getDetailUser = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findById(id);

            if(user === null) {
                resolve({
                    status: 'OK',
                    message: 'The user is not defined'
                })
            }
            
            resolve({
                status: 'OK',
                message: 'Get user info successfully',
                data: user
            })
        }catch (e) {
            reject(e);
        }
    })
}


module.exports = {
    createUser,
    loginUser,
    updateUser,
    deleteUser,
    getAllUser,
    getDetailUser
}
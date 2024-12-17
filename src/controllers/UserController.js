const UserServices = require('../services/UserService');
const JwtService = require('../services/JwtService');

const createUser = async (req,res) => {
    try {
        const {name,email,password,confirmPassword,phone,address} = req.body;
        const regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        const ischeckEmail = regex.test(email);
        if(!email || !password || !confirmPassword) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Hãy điền đầy đủ các thông tin bắt buộc!'
            })
        }else if(!ischeckEmail){
            return res.status(400).json({
                status: 'ERR',
                message: 'Hãy nhập email hợp lệ!'
            })
        }else if(password !== confirmPassword){
            return res.status(400).json({
                status: 'ERR',
                message: 'Mật khẩu không khớp!'
            })
        }

        if(password.length < 8){
            return res.status(400).json({
                status: 'ERR',
                message: 'Mật khẩu phải có ít nhất 8 ký tự!'
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
        const {email, password} = req.body;
        const regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        const ischeckEmail = regex.test(email);
        
        if(!email || !password) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The input is require'
            })
        }
        else if(!ischeckEmail){
            return res.status(200).json({
                status: 'ERR',
                message: 'Please enter a valid email'
            })
        }

        const respond = await UserServices.loginUser(req.body);
        const {refresh_token, ...newRespond} = respond;

        res.cookie('refresh_token', refresh_token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            samesite: 'strict'
        })
        
        delete respond?.refresh_token;
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
                message: 'Thiếu userId'
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

const deleteMany = async (req,res) => {
    try {
        const ids = req.body.ids;

        if(!ids){
            return res.status(200).json({
                status: 'ERR',
                message: 'Thiếu danh sách ids'
            })
        }
        const respond = await UserServices.deleteMany(ids);
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
        const refreshToken = req.cookies.refresh_token;
        if(!refreshToken){
            return res.status(200).json({
                status: 'ERR',
                message: 'The token is required'
            })
        }
        const respond = await JwtService.refreshTokenJwtService(refreshToken);
        
        return res.status(200).json(respond);
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const logoutUser = async (req,res) => {
    try {
        res.clearCookie('refresh_token');

        return res.status(200).json({
            status: 'OK',
            message: 'Đăng xuất thành công'
        });
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const forgotPassword = async (req,res) => {
    try {
        const email = req.params.email;
        const regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        const ischeckEmail = regex.test(email);
        if(!email || !ischeckEmail) return res.status(404).json({
            message: "Email không hợp lệ!"
        });

        await UserServices.forgotPassword(email);
        return res.status(200).json({
            message: "Mã xác nhận đã gửi về email của bạn. Vui lòng kiểm tra hộp thư đến và xác nhận mã!"
        });
    }
    catch(error) {
        return res.status(404).json({
            message: error.message
        })
    }
}

const verifyResetPasswordToken = async (req,res) => {
    try {
        const { email } = req.params;
        const token = req.body.OTP;
        const tokenRegex = /^\d{6}$/;
        if(!email || !token || !tokenRegex.test(token)) {
            return res.status(400).json({
                message: "Token không hợp lệ!"
            })
        }

        const verify = await UserServices.verifyResetPasswordToken(email, token);
        if(!verify) {
            return res.status(400).json({
                message: "OTP không hợp lệ!"
            })
        }
        return res.status(200).json({
            message: "OTP hợp lệ!"
        })
    }catch(error) {
        return res.status(400).json({
            message: error.message
        })
    }
}

const resetPassword = async (req,res) => {
    try {
        const { email, verify_code: token, password } = req.body;
        if(!password || !email || !token) {
            return res.status(400).json({
                message: "Thiếu thông tin cần thiết!"
            })
        }

        if(password.length < 8) {
            return res.status(400).json({
                message: "Mật khẩu phải có ít nhất 8 ký tự!"
            })
        }

        await UserServices.resetPassword(email, token, password);
        return res.status(200).json({
            message: "Mật khẩu đã được thay đổi thành công!"
        })
    }
    catch(error) {
        return res.status(400).json({
            message: error.message
        })
    }
}

module.exports = {
    createUser,
    loginUser,
    logoutUser,
    updateUser,
    deleteUser,
    getAllUser,
    getDetailUser,
    deleteMany,
    refreshToken,
    forgotPassword,
    verifyResetPasswordToken,
    resetPassword
}
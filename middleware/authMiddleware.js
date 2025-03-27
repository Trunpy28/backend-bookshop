import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const authMiddleware = async (req, res, next) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer")) {
        return res.status(401).json({
            success: false,
            message: "Không có quyền truy cập"
        })
    }

    const accessToken = req.headers.authorization.split(' ')[1];
    if (!accessToken) {
        return res.status(401).json({
            message: "Không có quyền truy cập"
        })
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN);
        req.user = decoded;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            message: "Không có quyền truy cập"
        })
    }
}

// Middleware kiểm tra quyền truy cập: chỉ admin hoặc chính người dùng mới có quyền
const authUserMiddleware = async (req, res, next) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer")) {
        return res.status(401).json({
            message: "Không có quyền truy cập"
        })
    }

    const accessToken = req.headers.authorization.split(' ')[1];
    const userId = req.params.id;

    try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN);
        
        // Kiểm tra xem người dùng có phải là admin hoặc chính họ không
        if (decoded?.isAdmin || decoded?.id === userId) {
            req.user = decoded;
            next();
        } else {
            return res.status(403).json({
                message: "Không đủ quyền để thực hiện hành động này"
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            message: "Token xác thực không hợp lệ"
        })
    }
}

const adminAuthMiddleware = (req, res, next) => {
    if(!req.user) {
        return res.status(401).json({
            message: "Người dùng chưa đăng nhập"
        })
    }
    
    if(!req?.user?.isAdmin) {
        return res.status(403).json({
            message: "Không đủ quyền, bạn phải là quản trị viên"
        })
    }

    next();
}

export {
    authMiddleware,
    authUserMiddleware,
    adminAuthMiddleware
}
import UserServices from '../services/UserService.js'; // Import dịch vụ UserServices
import UserProvider from '../models/UserProviders.js'; // Import model UserProvider (nếu cần lưu thông tin provider)
import JwtService from '../services/JwtService.js';

const googleAuthCallback = async (req, res) => {
  try {
    const { id, email, name, avatar } = req.user; // Passport tự động gán thông tin user từ Google profile vào req.user

    // Kiểm tra xem người dùng đã tồn tại trong cơ sở dữ liệu chưa
    let user = await UserServices.findUserByEmail(email);
    
    if (!user) {
      // Nếu người dùng chưa tồn tại, tạo mới người dùng
      user = await UserServices.createUserOAuth({
        email,
        name,
        avatar,
      });
    }

    // Kiểm tra xem đã có thông tin từ Google chưa
    let userProvider = await UserProvider.findOne({ provider: 'google', providerId: id });
    if (!userProvider) {
      // Lưu thông tin provider vào bảng UserProviders
      userProvider = await UserProvider.create({
        userId: user._id,
        provider: 'google',
        providerId: req.user.id,
      });
    }

    // Tạo access token và refresh token
    const accessToken = await JwtService.generalAccessToken({
        id: user.id,
        isAdmin: user.isAdmin,
      });
    const refreshToken = await JwtService.generalRefreshToken({
        id: user.id,
        isAdmin: user.isAdmin,
    });

    // Lưu refresh token vào cookie
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    // Trả về thông tin người dùng và access token
    res.redirect(`${process.env.CLIENT_URL}/sign-in?access_token=${accessToken}`);
  } catch (e) {
    console.error(e);
    res.status(500).json({
      status: 'ERR',
      message: 'Có lỗi xảy ra trong quá trình đăng nhập',
    });
  }
};

export {
  googleAuthCallback,
};

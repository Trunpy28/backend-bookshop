import User from "../models/UserModel.js";
import bCrypt from "bcrypt";
import otpGenerator from "otp-generator";
import JwtService from "./JwtService.js";
import EmailService from "./EmailService.js";

const createUser = async (newUser) => {
  const { name, email, password, phone, address, avatar } = newUser;
  
  // Kiểm tra email tồn tại
  const checkUser = await User.findOne({
    email: email,
  });
  if (checkUser !== null) {
    throw new Error("Email đã tồn tại!");
  }
  
  // Yêu cầu mật khẩu cho đăng ký thông thường
  if (!password) {
    throw new Error("Mật khẩu là trường bắt buộc!");
  }
  
  const hashedPassword = bCrypt.hashSync(password, 10);
  
  const userData = {
    email,
    password: hashedPassword,
  };
  
  // Thêm các trường tùy chọn nếu được cung cấp
  if (name) userData.name = name;
  if (phone) userData.phone = phone;
  if (address) userData.address = address;
  if (avatar) userData.avatar = avatar;
  
  const createdUser = await User.create(userData);
  
  if (createdUser) {
    return {
      status: "OK",
      message: "Tạo tài khoản thành công!",
    };
  }
};

const loginUser = async (userLogin) => {
  const { email, password } = userLogin;
  
  // Kiểm tra email tồn tại
  const checkUser = await User.findOne({
    email: email,
  }).select("+password");
  
  if (checkUser === null) {
    throw new Error("Email không tồn tại!");
  }
  
  // Kiểm tra xem tài khoản có password hay không (nếu là tài khoản OAuth sẽ không có)
  if (!checkUser.password) {
    throw new Error("Tài khoản này được đăng ký bằng Google hoặc Facebook. Vui lòng sử dụng phương thức đăng nhập tương ứng!");
  }
  
  const comparePassword = bCrypt.compareSync(password, checkUser.password);

  if (!comparePassword) {
    throw new Error("Mật khẩu hoặc email không đúng");
  }

  const access_token = await JwtService.generalAccessToken({
    id: checkUser.id,
    isAdmin: checkUser.isAdmin,
  });
  const refresh_token = await JwtService.generalRefreshToken({
    id: checkUser.id,
    isAdmin: checkUser.isAdmin,
  });

  return {
    access_token: access_token,
    refresh_token: refresh_token,
  };
};

const updateUser = async (id, data) => {
  // Kiểm tra user tồn tại
  const checkUser = await User.findById(id);

  if (checkUser === null) {
    throw new Error("Tài khoản không tồn tại!");
  }

  // Chỉ cập nhật những trường được cung cấp
  const updatedUser = await User.findByIdAndUpdate(id, 
    { $set: data },
    { new: true }
  );

  return {
    status: "OK",
    message: "Cập nhật thành công!",
    data: updatedUser,
  };
};

const deleteUser = async (id) => {
  const checkUser = await User.findById(id);

  if (checkUser === null) {
    throw new Error("Tài khoản không tồn tại!");
  }

  await User.findByIdAndDelete(id);

  return {
    status: "OK",
    message: "Xóa tài khoản thành công!",
  };
};

const getAllUser = async () => {
  const allUser = await User.find();

  return {
    status: "OK",
    message: "Lấy thông tin các tài khoản thành công!",
    data: allUser,
  };
};

const getDetailUser = async (id) => {
  const user = await User.findById(id);
  if (user === null) {
    throw new Error("Tài khoản không tồn tại!");
  }

  return {
    status: "OK",
    message: "Lấy thông tin tài khoản thành công!",
    data: user,
  };
};

const forgotPassword = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user) return;

    const resetPasswordOTP = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    user.resetPasswordToken = resetPasswordOTP;
    user.resetPasswordExpiresIn = Date.now() + 5 * 60 * 1000;
    await EmailService.sendEmailResetPassword(email, resetPasswordOTP);

    await user.save();
  } catch (error) {
    console.error("Error while saving user:", error);
    throw new Error("Cannot create token!");
  }
};

const verifyResetPasswordToken = async (email, token) => {
  try {
    const user = await User.findOne({ email, resetPasswordToken: token });
    if (!user) return false;
    if (Date.now() > new Date(user.resetPasswordExpiresIn).getTime())
      return false;
    return true;
  } catch (error) {
    throw new Error("Token không hợp lệ!");
  }
};

const resetPassword = async (email, token, password) => {
  const user = await User.findOne({ email, resetPasswordToken: token });
  if (!user) throw new Error("Khôi phục mật khẩu thất bại!");
  if (Date.now() > new Date(user.resetPasswordExpiresIn).getTime())
    throw new Error("OTP đã hết hạn!");

  user.password = bCrypt.hashSync(password, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpiresIn = null;
  await user.save();
};

const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

// Tạo người dùng mới
const createUserOAuth = async ({ email, name, avatar }) => {
  const user = new User({
    email,
    name,
    avatar,
  });

  return await user.save();
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new Error('Không tìm thấy người dùng');
  }

  const isPasswordValid = bCrypt.compareSync(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new Error('Mật khẩu hiện tại không chính xác');
  }

  if (newPassword.length < 8) {
    throw new Error('Mật khẩu mới phải có ít nhất 8 ký tự');
  }

  const hashedPassword = bCrypt.hashSync(newPassword, 10);
  user.password = hashedPassword;

  await user.save();

  return {
    status: 'OK',
    message: 'Đổi mật khẩu thành công'
  };
};

const findUserById = async (userId) => {
  return await User.findById(userId);
};

const getUsersPaginated = async (options) => {
  try {
    let { 
      page = 1, 
      limit = 10, 
      name,
      email,
      phone,
      role
    } = options;
    
    page = Number.parseInt(page);
    limit = Number.parseInt(limit);

    const query = {};
    
    // Tìm theo tên người dùng
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    // Tìm theo email
    if (email) {
      query.email = { $regex: email, $options: 'i' };
    }

    // Tìm theo số điện thoại
    if (phone) {
      query.phone = { $regex: phone, $options: 'i' };
    }

    // Lọc theo vai trò
    if (role !== undefined) {
      if (role === 'admin') {
        query.isAdmin = true;
      } else if (role === 'customer') {
        query.isAdmin = false;
      }
    }

    // Đếm tổng số bản ghi
    const total = await User.countDocuments(query);
    
    // Thực hiện truy vấn dữ liệu có phân trang và loại bỏ trường avatar
    const users = await User.find(query, { avatar: 0 })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 0
      }
    };
  } catch (error) {
    throw new Error(`Không thể lấy danh sách người dùng: ${error.message}`);
  }
};

export default {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllUser,
  getDetailUser,
  forgotPassword,
  verifyResetPasswordToken,
  resetPassword,
  findUserByEmail,
  findUserById,
  createUserOAuth,
  changePassword,
  getUsersPaginated
};

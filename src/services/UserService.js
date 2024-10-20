const User = require("../models/UserModel");
// @ts-ignore
const bCrypt = require("bcrypt");
const { generalAccessToken, generalRefreshToken } = require("./JwtService");

const createUser = async (newUser) => {
  const { name, email, password, phone, address, avatar } = newUser;
  const checkUser = await User.findOne({
    email: email,
  });
  if (checkUser !== null) {
    return {
      status: "ERR",
      message: "Email đã tồn tại!",
    };
  }
  const hash = bCrypt.hashSync(password, 10);
  const createdUser = await User.create({
    name,
    email,
    password: hash,
    confirmPassword: hash,
    phone,
    address,
    avatar,
  });
  if (createdUser) {
    return {
      status: "OK",
      message: "Tạo tài khoản thành công!",
      data: createdUser,
    };
  }
};

const loginUser = async (userLogin) => {
  const { email, password } = userLogin;
  const checkUser = await User.findOne({
    email: email,
  });
  if (checkUser === null) {
    return {
      status: "ERR",
      message: "Tài khoản không tồn tại!",
    };
  }
  const comparePassword = bCrypt.compareSync(password, checkUser.password);

  if (!comparePassword) {
    return {
      status: "ERR",
      message: "Mật khẩu hoặc email không đúng",
    };
  }

  const access_token = await generalAccessToken({
    id: checkUser.id,
    isAdmin: checkUser.isAdmin,
  });
  const refresh_token = await generalRefreshToken({
    id: checkUser.id,
    isAdmin: checkUser.isAdmin,
  });

  return {
    status: "OK",
    message: "Đăng nhập thành công!",
    access_token: access_token,
    refresh_token: refresh_token,
  };
};

const updateUser = async (id, data) => {
  const checkUser = await User.findById(id);

  if (checkUser === null) {
    return {
      status: "ERR",
      message: "Tài khoản không tồn tại!",
    };
  }

  const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });

  return {
    status: "OK",
    message: "Cập nhật thành công!",
    data: updatedUser,
  };
};

const deleteUser = async (id) => {
  const checkUser = await User.findById(id);

  if (checkUser === null) {
    return {
      status: "ERR",
      message: "Tài khoản không tồn tại!",
    };
  }

  await User.findByIdAndDelete(id);

  return {
    status: "OK",
    message: "Xóa tài khoản thành công!",
  };
};

const deleteMany = async (ids) => {
  await User.deleteMany({ _id: { $in: ids } });

  return {
    status: "OK",
    message: "Xóa các tài khoản thành công!",
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
    resolve({
      status: "ERR",
      message: "Tài khoản không tồn tại!",
    });
  }

  return {
    status: "OK",
    message: "Lấy thông tin tài khoản thành công!",
    data: user,
  };
};

module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllUser,
  getDetailUser,
  deleteMany,
};

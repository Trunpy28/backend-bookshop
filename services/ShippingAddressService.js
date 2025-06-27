import ShippingAddress from '../models/ShippingAddressModel.js';

const getUserAddresses = async (userId) => {
    try {
        const shippingAddress = await ShippingAddress.findOne({ user: userId });
        return shippingAddress ? shippingAddress : { user: userId, addresses: [] };
    } catch (error) {
        throw new Error('Không thể lấy danh sách địa chỉ.');
    }
};

const addAddress = async (userId, addressData) => {
    try {
        if (!addressData.fullName || !addressData.phone || !addressData.city || 
            !addressData.district || !addressData.ward || !addressData.detailedAddress) {
            throw new Error('Thiếu thông tin địa chỉ bắt buộc.');
        }

        if (!/^\d+$/.test(addressData.phone)) {
            throw new Error('Số điện thoại không hợp lệ.');
        }

        let shippingAddress = await ShippingAddress.findOne({ user: userId });

        // Đặt isDefault = true nếu là địa chỉ đầu tiên
        const isFirstAddress = !shippingAddress || shippingAddress?.addresses?.length === 0;
        if (isFirstAddress) {
            addressData.isDefault = true;
        }

        // Nếu chưa có sổ địa chỉ, tạo mới
        if (!shippingAddress) {
            shippingAddress = new ShippingAddress({
                user: userId,
                addresses: [addressData]
            });
        } else {
            shippingAddress.addresses.push(addressData);
        }

        await shippingAddress.save();
        return shippingAddress;
    } catch (error) {
        throw new Error(error.message || 'Không thể thêm địa chỉ mới.');
    }
};

const updateAddress = async (userId, addressId, addressData) => {
    try {
        if (!addressData.fullName || !addressData.phone || !addressData.city || 
            !addressData.district || !addressData.ward || !addressData.detailedAddress) {
            throw new Error('Thiếu thông tin địa chỉ bắt buộc.');
        }

        if (!/^\d+$/.test(addressData.phone)) {
            throw new Error('Số điện thoại không hợp lệ.');
        }

        const shippingAddress = await ShippingAddress.findOne({ user: userId });
        if (!shippingAddress) {
            throw new Error('Không tìm thấy sổ địa chỉ.');
        }

        const addressIndex = shippingAddress.addresses.findIndex(
            (address) => address._id.toString() === addressId
        );

        if (addressIndex === -1) {
            throw new Error('Không tìm thấy địa chỉ.');
        }

        // Cập nhật địa chỉ
        shippingAddress.addresses[addressIndex] = {
            ...shippingAddress.addresses[addressIndex],
            ...addressData
        };

        await shippingAddress.save();
        return shippingAddress;
    } catch (error) {
        throw new Error(error.message || 'Không thể cập nhật địa chỉ.');
    }
};

const deleteAddress = async (userId, addressId) => {
    try {
        const shippingAddress = await ShippingAddress.findOne({ user: userId });
        if (!shippingAddress) {
            throw new Error('Không tìm thấy sổ địa chỉ.');
        }

        const addressIndex = shippingAddress.addresses.findIndex(
            (address) => address._id.toString() === addressId
        );

        if (addressIndex === -1) {
            throw new Error('Không tìm thấy địa chỉ.');
        }

        // Kiểm tra nếu địa chỉ đang xóa là mặc định
        const isDefault = shippingAddress.addresses[addressIndex].isDefault;

        // Không cho phép xóa địa chỉ mặc định
        if (isDefault) {
            throw new Error('Không thể xóa địa chỉ mặc định. Vui lòng đặt địa chỉ khác làm mặc định trước khi xóa.');
        }

        shippingAddress.addresses.splice(addressIndex, 1);

        await shippingAddress.save();
        return { message: 'Xóa địa chỉ thành công' };
    } catch (error) {
        throw new Error(error.message || 'Không thể xóa địa chỉ.');
    }
};

const setDefaultAddress = async (userId, addressId) => {
    try {
        const shippingAddress = await ShippingAddress.findOne({ user: userId });
        if (!shippingAddress) {
            throw new Error('Không tìm thấy sổ địa chỉ.');
        }

        // Cập nhật tất cả địa chỉ thành không mặc định
        shippingAddress.addresses.forEach(address => {
            address.isDefault = false;
        });

        const addressToDefault = shippingAddress.addresses.find(
            (address) => address._id.toString() === addressId
        );

        if (!addressToDefault) {
            throw new Error('Không tìm thấy địa chỉ.');
        }

        addressToDefault.isDefault = true;

        await shippingAddress.save();
        return shippingAddress;
    } catch (error) {
        throw new Error(error.message || 'Không thể đặt địa chỉ mặc định.');
    }
};

export default {
    getUserAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
};
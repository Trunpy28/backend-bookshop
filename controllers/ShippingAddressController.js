import ShippingAddressService from '../services/ShippingAddressService.js';

const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const userAddresses = await ShippingAddressService.getUserAddresses(userId);
    res.status(200).json(userAddresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressData = req.body;
    const updatedAddresses = await ShippingAddressService.addAddress(userId, addressData);
    res.status(201).json(updatedAddresses);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const addressData = req.body;
    const updatedAddresses = await ShippingAddressService.updateAddress(userId, addressId, addressData);
    res.status(200).json(updatedAddresses);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const result = await ShippingAddressService.deleteAddress(userId, addressId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const updatedAddresses = await ShippingAddressService.setDefaultAddress(userId, addressId);
    res.status(200).json(updatedAddresses);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export default {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
}; 
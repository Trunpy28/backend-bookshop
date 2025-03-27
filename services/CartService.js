import Cart from '../models/CartModel.js';
import Product from '../models/ProductModel.js';
import mongoose from 'mongoose';

const getCartByUser = async (userId) => {
    try {
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('ID người dùng không hợp lệ');
        }

        let cart = await Cart.findOne({ user: userId })
                             .populate('cartItems.product');
        
        if (!cart) {
            cart = new Cart({
                user: userId,
                cartItems: []
            });
            
            await cart.save();
        }
        
        return cart;
    } catch (error) {
        throw new Error(error.message);
    }
};

const addToCart = async (userId, productData) => {
    try {
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('ID người dùng không hợp lệ');
        }

        const { productId, quantity } = productData;
        
        if (!productId || !quantity || quantity <= 0) {
            throw new Error('Dữ liệu sản phẩm không hợp lệ');
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            throw new Error('ID sản phẩm không hợp lệ');
        }
        
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Sản phẩm không tồn tại');
        }
        
        let cart = await Cart.findOne({ user: userId });
        
        if (!cart) {
            cart = new Cart({
                user: userId,
                cartItems: []
            });
        }
        
        // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        const existingItemIndex = cart.cartItems.findIndex(
            item => item.product.toString() === productId
        );
        
        let totalQuantityAfterAdd = quantity;
        
        if (existingItemIndex >= 0) {
            totalQuantityAfterAdd += cart.cartItems[existingItemIndex].quantity;
        }
        
        if (product.countInStock < totalQuantityAfterAdd) {
            throw new Error(`Số lượng sản phẩm trong kho không đủ. Hiện còn ${product.countInStock} sản phẩm`);
        }
        
        // Nếu sản phẩm đã có trong giỏ hàng, cập nhật số lượng
        if (existingItemIndex >= 0) {
            cart.cartItems[existingItemIndex].quantity = totalQuantityAfterAdd;
        } else {
            // Thêm sản phẩm mới vào giỏ hàng
            cart.cartItems.push({
                product: productId,
                quantity
            });
        }
        
        await cart.save();
        
        const updatedCart = await Cart.findById(cart._id)
                                     .populate('cartItems.product');
        
        return updatedCart;
    } catch (error) {
        throw new Error(error.message);
    }
};

const updateCartItem = async (userId, updateData) => {
    try {
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('ID người dùng không hợp lệ');
        }
        
        const { productId, quantity } = updateData;
        
        if (!productId || quantity < 0) {
            throw new Error('Dữ liệu cập nhật không hợp lệ');
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            throw new Error('ID sản phẩm không hợp lệ');
        }
        
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Sản phẩm không tồn tại');
        }
        
        const cart = await Cart.findOne({ user: userId });
        
        if (!cart) {
            throw new Error('Không tìm thấy giỏ hàng');
        }
        
        // Kiểm tra xem sản phẩm có trong giỏ hàng không
        const existingItemIndex = cart.cartItems.findIndex(
            item => item.product.toString() === productId
        );
        
        if (existingItemIndex === -1) {
            throw new Error('Sản phẩm không có trong giỏ hàng');
        }
        
        if (quantity === 0) {
            cart.cartItems.splice(existingItemIndex, 1);
        } else {
            if (product.countInStock < quantity) {
                throw new Error(`Số lượng sản phẩm trong kho không đủ. Hiện còn ${product.countInStock} sản phẩm`);
            }
            
            cart.cartItems[existingItemIndex].quantity = quantity;
        }
        
        await cart.save();
        
        const updatedCart = await Cart.findById(cart._id)
                                     .populate('cartItems.product');
        
        return updatedCart;
    } catch (error) {
        throw new Error(error.message);
    }
};

const removeFromCart = async (userId, productId) => {
    try {
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('ID người dùng không hợp lệ');
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            throw new Error('ID sản phẩm không hợp lệ');
        }
        
        const cart = await Cart.findOne({ user: userId });
        
        if (!cart) {
            throw new Error('Không tìm thấy giỏ hàng');
        }
        
        cart.cartItems = cart.cartItems.filter(
            item => item.product.toString() !== productId
        );
        
        await cart.save();
        
        const updatedCart = await Cart.findById(cart._id)
                                     .populate('cartItems.product');
        
        return updatedCart;
    } catch (error) {
        throw new Error(error.message);
    }
};

const clearCart = async (userId) => {
    try {
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('ID người dùng không hợp lệ');
        }
        
        const cart = await Cart.findOne({ user: userId });
        
        if (!cart) {
            throw new Error('Không tìm thấy giỏ hàng');
        }
        
        cart.cartItems = [];
        
        await cart.save();
        
        return cart;
    } catch (error) {
        throw new Error(error.message);
    }
};

export default {
    getCartByUser,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
}; 
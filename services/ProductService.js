import Product from '../models/ProductModel.js';
import mongoose from 'mongoose';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const createProduct = async (newProduct) => {
    const { name, images, genre, countInStock, description, author, publisher, originalPrice, publicationYear, weight, dimensions, pageCount, format } = newProduct;

    // Kiểm tra các trường bắt buộc
    if (!name || !images || !genre || !countInStock || !description || !author || !publisher || !originalPrice) {
        throw new Error('Thiếu thông tin cần thiết để tạo sản phẩm.');
    }

    // Kiểm tra mảng hình ảnh
    if (!Array.isArray(images) || images.length === 0) {
        throw new Error('Danh sách hình ảnh không hợp lệ.');
    }

    // Kiểm tra ID thể loại
    if (!isValidObjectId(genre)) {
        throw new Error('ID thể loại không hợp lệ.');
    }

    // Kiểm tra giá trị số
    if (typeof originalPrice !== 'number' || originalPrice < 0) {
        throw new Error('Giá bìa không hợp lệ.');
    }

    if (typeof countInStock !== 'number' || countInStock < 0) {
        throw new Error('Số lượng tồn kho không hợp lệ.');
    }

    try {
        const checkProduct = await Product.findOne({ name });
        if (checkProduct !== null) {
            return {
                status: 'ERR',
                message: 'Sản phẩm đã tồn tại!'
            };
        }

        const createdProduct = await Product.create({
            name,
            images,
            genre,
            countInStock,
            description,
            author,
            publisher,
            originalPrice,
            publicationYear,
            weight,
            dimensions,
            pageCount,
            format
        });

        if (createdProduct) {
            return {
                status: 'OK',
                message: 'Thêm sản phẩm thành công!',
                data: createdProduct
            };
        }
    } catch (e) {
        throw new Error('Không thể tạo sản phẩm mới.');
    }
};

const updateProduct = async (id, data) => {
    if (!isValidObjectId(id)) {
        throw new Error('ID sản phẩm không hợp lệ.');
    }

    try {
        const checkProduct = await Product.findById(id);
        if (checkProduct === null) {
            return {
                status: 'ERR',
                message: 'Sản phẩm không tồn tại!'
            };
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true }
        );

        return {
            status: 'OK',
            message: 'Cập nhật sản phẩm thành công!',
            data: updatedProduct
        };
    } catch (e) {
        throw new Error('Không thể cập nhật sản phẩm');
    }
};

const deleteProduct = async (id) => {
    if (!isValidObjectId(id)) {
        throw new Error('ID sản phẩm không hợp lệ.');
    }

    try {
        const checkProduct = await Product.findById(id);
        if (checkProduct === null) {
            return {
                status: 'ERR',
                message: 'Sản phẩm không tồn tại!'
            };
        }

        await Product.findByIdAndDelete(id);
        return {
            status: 'OK',
            message: 'Xóa sản phẩm thành công!'
        };
    } catch (e) {
        throw new Error('Không thể xóa sản phẩm.');
    }
};

const deleteManyProduct = async (ids) => {
    if (!Array.isArray(ids) || ids.some(id => !isValidObjectId(id))) {
        throw new Error('Danh sách ID không hợp lệ.');
    }

    try {
        await Product.deleteMany({ _id: { $in: ids } });
        return {
            status: 'OK',
            message: 'Xóa các sản phẩm thành công!'
        };
    } catch (e) {
        throw new Error('Không thể xóa các sản phẩm.');
    }
};

const getAllProduct = async (limit = Number.MAX_SAFE_INTEGER, page = 1, sort, filter) => {
    try {
        let totalProduct = await Product.countDocuments();
        let allProduct = [];

        if (sort) {
            const objectSort = { [sort[0]]: sort[1] };
            const allProductSort = await Product.find().limit(limit).skip(limit * (page - 1)).sort(objectSort);

            return {
                status: 'OK',
                message: 'Lấy thông tin các sản phẩm thành công!',
                data: allProductSort,
                total: totalProduct,
                pageCurrent: page,
                totalPage: Math.ceil(totalProduct / limit)
            };
        }

        if (filter) {
            totalProduct = await Product.countDocuments({ [filter[0]]: { $regex: filter[1], $options: 'i' } });
            const allProductFilter = await Product.find({ [filter[0]]: { $regex: filter[1], $options: 'i' } }).limit(limit).skip(limit * (page - 1));

            return {
                status: 'OK',
                message: 'Lấy thông tin các sản phẩm thành công!',
                data: allProductFilter,
                total: totalProduct,
                pageCurrent: page,
                totalPage: Math.ceil(totalProduct / limit)
            };
        }

        if (!limit) {
            allProduct = await Product.find();
        } else {
            allProduct = await Product.find().limit(limit).skip(limit * (page - 1));
        }

        return {
            status: 'OK',
            message: 'Lấy thông tin các sản phẩm thành công!',
            data: allProduct,
            total: totalProduct,
            pageCurrent: page,
            totalPage: Math.ceil(totalProduct / limit)
        };
    } catch (e) {
        throw new Error('Không thể lấy danh sách sản phẩm.');
    }
};

const getDetailProduct = async (id) => {
    if (!isValidObjectId(id)) {
        throw new Error('ID sản phẩm không hợp lệ.');
    }

    try {
        const product = await Product.findById(id);
        if (product === null) {
            return {
                status: 'ERR',
                message: 'Sản phẩm không tồn tại!'
            };
        }

        return {
            status: 'OK',
            message: 'Lấy thông tin sản phẩm thành công!',
            data: product
        };
    } catch (e) {
        throw new Error('Không thể lấy thông tin sản phẩm.');
    }
};

const getAllType = async () => {
    try {
        const allType = await Product.distinct('genre');
        return {
            status: 'OK',
            message: 'Lấy thông tin các thể loại sản phẩm thành công!',
            data: allType,
        };
    } catch (e) {
        throw new Error('Không thể lấy thông tin các thể loại sản phẩm.');
    }
};

const getProductsPaginated = async (page, limit) => {
    const skip = (page - 1) * limit;
    const products = await Product.find().skip(skip).limit(limit);
    const total = await Product.countDocuments();
    return { products, total };
};

const getAllProductsName = async () => {
    try {
        const products = await Product.find({}, 'name _id');
        return products;
    } catch (error) {
        throw new Error('Không thể lấy danh sách tên sản phẩm.');
    }
};

const getProductsForSelect = async () => {
    try {
      const products = await Product.find({}, {
        _id: 1,
        name: 1, 
        author: 1,
        publicationYear: 1,
        originalPrice: 1,
        'images.0': 1
      });
      
      return products;
    } catch (error) {
        throw new Error('Không thể lấy danh sách sản phẩm');
    }
};

export default {
    createProduct,
    updateProduct,
    deleteProduct,
    deleteManyProduct,
    getAllProduct,
    getDetailProduct,
    getAllType,
    getProductsPaginated,
    getAllProductsName,
    getProductsForSelect
};
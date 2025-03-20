import Product from '../models/ProductModel.js';
import mongoose from 'mongoose';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const createProduct = async (newProduct) => {
    const { name, images, genre, description, author, publisher, originalPrice, publicationYear, weight, dimensions, pageCount, format } = newProduct;

    
    if (!name || !images || !genre || !description || !author || !publisher || !originalPrice || !publicationYear || !pageCount) {
        throw new Error('Thiếu thông tin cần thiết để tạo sản phẩm.');
    }
    
    if (!Array.isArray(images) || images.length === 0) {
        throw new Error('Danh sách hình ảnh không hợp lệ.');
    }
    
    if (!isValidObjectId(genre)) {
        throw new Error('ID thể loại không hợp lệ.');
    }
    
    
    newProduct.originalPrice = Number(originalPrice);
    newProduct.publicationYear = Number(publicationYear);
    newProduct.pageCount = Number(pageCount);
    
    console.log(newProduct);
    if (isNaN(newProduct.originalPrice) || newProduct.originalPrice < 0) {
        throw new Error('Giá bìa không hợp lệ.');
    }
    
    if (newProduct.publicationYear === undefined || isNaN(newProduct.publicationYear)) {
        throw new Error('Năm xuất bản không hợp lệ.');
    }
    
    if (newProduct.pageCount === undefined || isNaN(newProduct.pageCount) || newProduct.pageCount < 0) {
        throw new Error('Số trang không hợp lệ.');
    }
    
    try {
        const checkProduct = await Product.findOne({ name, publicationYear });
        if (checkProduct !== null) {
            return {
                status: 'ERR',
                message: 'Sản phẩm đã tồn tại!'
            };
        }

        const createdProduct = await Product.create(newProduct);

        if (createdProduct) {
            return {
                status: 'OK',
                message: 'Thêm sản phẩm thành công!',
                data: createdProduct
            };
        }
    } catch (e) {
        throw new Error('Không thể tạo sản phẩm mới: ' + e.message);
    }
};

const updateProduct = async (id, data) => {
    if (!isValidObjectId(id)) {
        throw new Error('ID sản phẩm không hợp lệ.');
    }

    const { name, genre, description, author, publisher, originalPrice, publicationYear, pageCount } = data;

    if (!name || !genre || !description || !author || !publisher || !originalPrice || !publicationYear || !pageCount) {
        throw new Error('Thiếu thông tin cần thiết để cập nhật sản phẩm.');
    }

    if (!isValidObjectId(genre)) {
        throw new Error('ID thể loại không hợp lệ.');
    }


    data.originalPrice = Number(originalPrice);
    data.publicationYear = Number(publicationYear);
    data.pageCount = Number(pageCount);

    if (isNaN(data.originalPrice) || data.originalPrice < 0) {
        throw new Error('Giá bìa không hợp lệ.');
    }

    if (data.publicationYear === undefined || isNaN(data.publicationYear)) {
        throw new Error('Năm xuất bản không hợp lệ.');
    }

    if (data.pageCount === undefined || isNaN(data.pageCount) || data.pageCount < 0) {
        throw new Error('Số trang không hợp lệ.');
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
        throw new Error('Không thể cập nhật sản phẩm: ' + e.message);
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
        throw new Error('Không thể xóa sản phẩm: ' + e.message);
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
        throw new Error('Không thể xóa các sản phẩm: ' + e.message);
    }
};

const getAllProduct = async (limit = Number.MAX_SAFE_INTEGER, page = 1, sort, filter) => {
    try {
        const totalProduct = await Product.count();
        
        // Xây dựng query
        let query = {};
        
        // Xử lý filter
        if (filter) {
            const objFilter = JSON.parse(filter);
            if (objFilter.genre) {
                query.genre = objFilter.genre;
            }
            
            if (objFilter.price) {
                const minPrice = objFilter.price[0];
                const maxPrice = objFilter.price[1];
                query.originalPrice = { $gte: minPrice, $lte: maxPrice };
            }
        }
        
        // Lấy sản phẩm với phân trang và sắp xếp
        let queryCommand = Product.find(query)
            .populate('genre', 'name')
            .skip((page - 1) * limit)
            .limit(limit);
        
        // Xử lý sort
        if (sort) {
            const objSort = JSON.parse(sort);
            const sortBy = objSort.sortBy;
            const order = objSort.order === 'asc' ? 1 : -1;
            
            if (sortBy) {
                if (sortBy === 'price') {
                    queryCommand = queryCommand.sort({ originalPrice: order });
                } else if (sortBy === 'createdAt') {
                    queryCommand = queryCommand.sort({ createdAt: order });
                } else if (sortBy === 'rating') {
                    queryCommand = queryCommand.sort({ "rating.avgRating": order });
                }
            }
        }
        
        const allProduct = await queryCommand.exec();
        
        return {
            status: 'OK',
            message: 'Lấy danh sách sản phẩm thành công!',
            data: allProduct,
            totalProduct,
            pageCurrent: page,
            totalPage: Math.ceil(totalProduct / limit)
        };
    } catch (e) {
        throw new Error('Không thể lấy danh sách sản phẩm: ' + e.message);
    }
};

const getDetailProduct = async (id) => {
    if (!isValidObjectId(id)) {
        throw new Error('ID sản phẩm không hợp lệ.');
    }

    try {
        const product = await Product.findById(id).populate('genre', 'name');
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
        throw new Error('Không thể lấy thông tin sản phẩm: ' + e.message);
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
        throw new Error('Không thể lấy thông tin các thể loại sản phẩm: ' + e.message);
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
        throw new Error('Không thể lấy danh sách tên sản phẩm: ' + error.message);
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
        images: 1
      });
      
      return products;
    } catch (error) {
        throw new Error('Không thể lấy danh sách sản phẩm: ' + error.message);
    }
};

const getProductsByGenre = async (genreId, page = 1, limit = 10) => {
    if (!isValidObjectId(genreId)) {
        throw new Error('ID thể loại không hợp lệ.');
    }

    try {
        const totalProducts = await Product.countDocuments({ genre: genreId });
        
        const products = await Product.find({ genre: genreId })
            .populate('genre', 'name')
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        return {
            status: 'OK',
            message: 'Lấy danh sách sản phẩm theo thể loại thành công!',
            data: products,
            totalProducts,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit)
        };
    } catch (e) {
        throw new Error('Không thể lấy danh sách sản phẩm theo thể loại: ' + e.message);
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
    getProductsForSelect,
    getProductsByGenre
};
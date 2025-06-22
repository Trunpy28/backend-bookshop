import Product from '../models/ProductModel.js';
import mongoose from 'mongoose';
import * as elasticsearchService from './ElasticSearchService.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const createProduct = async (newProduct) => {
    const { productCode, name, images, genre, description, author, publisher, originalPrice, publicationYear, weight, dimensions, pageCount, format, countInStock = 0 } = newProduct;

    if (!productCode || !name || !images || !genre || !description || !author || !publisher || !originalPrice || !publicationYear || !pageCount) {
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
    newProduct.countInStock = Number(countInStock);

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
        // Kiểm tra mã hàng hoặc sản phẩm đã tồn tại chưa
        const existingProduct = await Product.findOne({
            $or: [
                { productCode },
                { name, publicationYear, author }
            ]
        });

        if (existingProduct) {
            if (existingProduct.productCode === productCode) {
                throw new Error('Mã hàng đã tồn tại!');
            }
            throw new Error('Đã tồn tại sản phẩm khác với cùng tên, năm xuất bản và tác giả!');
        }

        const createdProduct = await Product.create(newProduct);

        if (createdProduct) {
            // Đồng bộ với Elasticsearch
            try {
                const populatedProduct = await createdProduct.populate('genre', 'name');
                await elasticsearchService.indexProduct(populatedProduct);
                console.log('Đã đồng bộ sản phẩm mới với Elasticsearch');
            } catch (esError) {
                console.error('Lỗi khi đồng bộ sản phẩm mới với Elasticsearch:', esError);
                // Không throw lỗi để không ảnh hưởng đến luồng tạo sản phẩm
            }
            
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

    const { productCode, name, genre, description, author, publisher, originalPrice, publicationYear, pageCount, countInStock = 0 } = data;

    if (!productCode || !name || !genre || !description || !author || !publisher || !originalPrice || !publicationYear || !pageCount) {
        throw new Error('Thiếu thông tin cần thiết để cập nhật sản phẩm.');
    }

    if (!isValidObjectId(genre)) {
        throw new Error('ID thể loại không hợp lệ.');
    }

    data.originalPrice = Number(originalPrice);
    data.publicationYear = Number(publicationYear);
    data.pageCount = Number(pageCount);
    data.countInStock = Number(countInStock);

    if (isNaN(data.originalPrice) || data.originalPrice < 0) {
        throw new Error('Giá bìa không hợp lệ.');
    }

    if (data.publicationYear === undefined || isNaN(data.publicationYear)) {
        throw new Error('Năm xuất bản không hợp lệ.');
    }

    if (data.pageCount === undefined || isNaN(data.pageCount) || data.pageCount < 0) {
        throw new Error('Số trang không hợp lệ.');
    }

    if (data.countInStock === undefined || isNaN(data.countInStock) || data.countInStock < 0) {
        throw new Error('Số lượng không hợp lệ.');
    }

    try {
        const checkProduct = await Product.findById(id);
        if (checkProduct === null) {
            throw new Error('Sản phẩm không tồn tại!');
        }

        // Kiểm tra mã hàng hoặc sản phẩm đã tồn tại ở sản phẩm khác chưa
        const existingProduct = await Product.findOne({
            _id: { $ne: id },
            $or: [
                { productCode },
                { name, publicationYear, author }
            ]
        });

        if (existingProduct) {
            if (existingProduct.productCode === productCode) {
                throw new Error('Mã hàng đã tồn tại!');
            }
            throw new Error('Đã tồn tại sản phẩm khác với cùng tên, năm xuất bản và tác giả!');
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true }
        );
        
        // Đồng bộ với Elasticsearch
        try {
            const populatedProduct = await updatedProduct.populate('genre', 'name');
            await elasticsearchService.indexProduct(populatedProduct);
            console.log('Đã đồng bộ sản phẩm cập nhật với Elasticsearch');
        } catch (esError) {
            console.error('Lỗi khi đồng bộ sản phẩm cập nhật với Elasticsearch:', esError);
            // Không throw lỗi để không ảnh hưởng đến luồng cập nhật sản phẩm
        }

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

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const checkProduct = await Product.findById(id);
        if (checkProduct === null) {
            throw new Error('Sản phẩm không tồn tại!');
        }
        
        // Xóa khỏi Elasticsearch trước
        try {
            await elasticsearchService.deleteProduct(id);
            console.log('Đã xóa sản phẩm khỏi Elasticsearch');
        } catch (esError) {
            console.error('Lỗi khi xóa sản phẩm khỏi Elasticsearch:', esError);
        }

        await Product.findByIdAndDelete(id, { session });

        await session.commitTransaction();
        session.endSession();

        return {
            status: 'OK',
            message: 'Xóa sản phẩm thành công!'
        };
    } catch (e) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('Không thể xóa sản phẩm: ' + e.message);
    }
};

const getDetailProduct = async (id) => {
    if (!isValidObjectId(id)) {
        throw new Error('ID sản phẩm không hợp lệ.');
    }

    try {
        const product = await Product.findById(id).populate('genre', 'name');
        if (product === null) {
            throw new Error('Sản phẩm không tồn tại!');
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

const getProductsPaginated = async (options) => {
    try {
        let {
            page = 1,
            limit = 10,
            productCode,
            name,
            genres,
            author,
            publisher,
            sort,
            price
        } = options;

        page = Number(page);
        limit = Number(limit);

        const query = {};

        if (productCode) {
            query.productCode = { $regex: productCode, $options: 'i' };
        }

        if (name) {
            query.name = { $regex: name, $options: 'i' };
        }
        
        if (genres && genres.length > 0) {
            const genreIds = genres.map(id => new mongoose.Types.ObjectId(id));
            query.genre = { $in: genreIds };
        }

        if (author) {
            query.author = { $regex: author, $options: 'i' };
        }

        if (publisher) {
            query.publisher = { $regex: publisher, $options: 'i' };
        }
        
        // Xử lý lọc theo khoảng giá (đối tượng price có thuộc tính min và max)
        if (price) {
            const { min, max } = price;
            // Xây dựng điều kiện lọc giá
            if (min !== null && min !== undefined && max !== null && max !== undefined) {
                query.originalPrice = { $gte: Number(min), $lte: Number(max) };
            } else if (min !== null && min !== undefined) {
                query.originalPrice = { $gte: Number(min) };
            } else if (max !== null && max !== undefined) {
                query.originalPrice = { $lte: Number(max) };
            }
        }

        const pipeline = [
            // Lọc sản phẩm theo điều kiện đã xây dựng ở trên
            { $match: query },

            // Join với bảng genres để lấy thông tin chi tiết của thể loại
            {
                $lookup: {
                    from: 'genres',           // Tên collection cần join
                    localField: 'genre',      // Trường trong collection hiện tại (products)
                    foreignField: '_id',      // Trường trong collection cần join (genres)
                    as: 'genreData'           // Tên field chứa kết quả sau khi join
                }
            },

            // Lấy phần tử đầu tiên từ mảng genreData
            {
                $addFields: {
                    genre: { $arrayElemAt: ['$genreData', 0] }   // Thay thế trường genre bằng đối tượng đầy đủ
                }
            },

            // Loại bỏ trường genreData không cần thiết
            {
                $project: {
                    genreData: 0    // Loại bỏ trường genreData
                }
            }
        ];

        // Xử lý sắp xếp - chỉ sắp xếp khi có sortBy
        if (sort && sort.sortBy) {
            const order = sort.order === 'asc' ? 1 : -1;
            switch (sort.sortBy) {
                case 'price':
                    pipeline.push({ $sort: { originalPrice: order } });
                    break;
                case 'name':
                    pipeline.push({ $sort: { name: order } });
                    break;
                case 'publicationYear':
                    pipeline.push({ $sort: { publicationYear: order } });
                    break;
                case 'rating':
                    pipeline.push({ $sort: { "rating.avgRating": order } });
                    break;
                default:
                    // Không thực hiện sắp xếp nếu sortBy không hợp lệ
                    break;
            }
        }

        const countPipeline = [...pipeline];
        // Thêm bước đếm tổng số bản ghi thỏa mãn điều kiện
        const countResult = await Product.aggregate([...countPipeline, { $count: 'total' }]);     //{ "total": <số document> }
        // Lấy giá trị đếm từ kết quả, nếu không có thì mặc định là 0
        const total = countResult.length > 0 ? countResult[0].total : 0;

        pipeline.push(
            { $skip: (page - 1) * limit },
            { $limit: limit }
        );

        // Thực hiện truy vấn aggregation
        const products = await Product.aggregate(pipeline);

        return {
            data: products,
            pagination: {
                total,                        
                page,                        
                limit,                        
                totalPages: Math.ceil(total / limit) || 0  
            }
        };
    } catch (error) {
        throw new Error(`Không thể lấy danh sách sản phẩm: ${error.message}`);
    }
};

const getProductsForSelect = async () => {
    try {
      const products = await Product.find({}, {
        _id: 1,
        productCode: 1,
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
    getDetailProduct,
    getProductsPaginated,
    getProductsForSelect,
    getProductsByGenre,
};
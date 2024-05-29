const Product = require('../models/ProductModel');

const createProduct = (newProduct) => {
    return new Promise(async (resolve, reject) => {
        const {name,image,type,countInStock,price,rating,description,author,discount} = newProduct;
        try {
            const checkProduct = await Product.findOne({
                name: name
            })
            if(checkProduct !== null) {
                resolve({
                    status: 'ERR',
                    message: 'Sản phẩm đã tồn tại!'
                })
            }

            const createdProduct = await Product.create({
                name,
                image,
                type,
                countInStock,
                price,
                rating,
                description,
                author,
                discount,
            })
            if(createdProduct){
                resolve({
                    status: 'OK',
                    message: 'Thêm sản phẩm thành công!',
                    data: createdProduct
                })
            }
        }catch (e) {
            reject(e);
        }
    })
}

const updateProduct = (id,data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkProduct = await Product.findById(id);

            if(checkProduct === null) {
                resolve({
                    status: 'OK',
                    message: 'Sản phẩm không tồn tại!'
                })
            }
            
            const updatedProduct = await Product.findByIdAndUpdate(id,data,{new: true});
            
            resolve({
                status: 'OK',
                message: 'Cập nhật sản phẩm thành công!',
                data: updatedProduct
            })

        }catch (e) {
            reject(e);
        }
    })
}

const deleteProduct = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkProduct = await Product.findById(id);

            if(checkProduct === null) {
                resolve({
                    status: 'OK',
                    message: 'Sản phẩm không tồn tại!'
                })
            }
            
            await Product.findByIdAndDelete(id);
            
            resolve({
                status: 'OK',
                message: 'Xóa sản phẩm thành công!'
            })
        }catch (e) {
            reject(e);
        }
    })
}

const deleteManyProduct = (ids) => {
    return new Promise(async (resolve, reject) => {
        try {
            await Product.deleteMany({_id: ids});
            
            resolve({
                status: 'OK',
                message: 'Xóa các sản phẩm thành công!'
            })
        }catch (e) {
            reject(e);
        }
    })
}

const getAllProduct = (limit = 1000000,page = 1, sort,filter) => {
    return new Promise(async (resolve, reject) => {
        try {
            let totalProduct = await Product.countDocuments();
            let allProduct = [];
            if(sort){
                const objectSort = {[sort[0]]: sort[1]};
                const allProductSort = await Product.find().limit(limit).skip(limit*(page-1)).sort(objectSort);
            
                resolve({
                    status: 'OK',
                    message: 'Lấy thông tin các sản phẩm thành công!',
                    data: allProductSort,
                    total: totalProduct,
                    pageCurrent: page,
                    totalPage: Math.ceil(totalProduct / limit)
                })
            }
            if(filter){
                totalProduct = await Product.countDocuments({ [filter[0]]: { $regex: filter[1], $options: 'i'} });
                const allProductFilter = await Product.find({ [filter[0]]: { $regex: filter[1], $options: 'i'} }).limit(limit).skip(limit*(page-1));
            
                resolve({
                    status: 'OK',
                    message: 'Lấy thông tin các sản phẩm thành công!',
                    data: allProductFilter,
                    total: totalProduct,
                    pageCurrent: page,
                    totalPage: Math.ceil(totalProduct / limit)
                })
            }   
            if(!limit){
                allProduct = await Product.find();
            }
            else{
                allProduct = await Product.find().limit(limit).skip(limit*(page-1));
            }
            resolve({
                status: 'OK',
                message: 'Lấy thông tin các sản phẩm thành công!',
                data: allProduct,
                total: totalProduct,
                pageCurrent: page,
                totalPage: Math.ceil(totalProduct / limit)
            })
        }catch (e) {
            reject(e);
        }
    })
}

const getDetailProduct = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const product = await Product.findById(id);

            if(product === null) {
                resolve({
                    status: 'OK',
                    message: 'Sản phẩm không tồn tại!'
                })
            }
            
            resolve({
                status: 'OK',
                message: 'Lấy thông tin sản phẩm thành công!',
                data: product
            })
        }catch (e) {
            reject(e);
        }
    })
}

const getAllType = () => {
    return new Promise(async (resolve, reject) => {
        try {
            
                const allType = await Product.distinct('type');
                resolve({
                    status: 'OK',
                    message: 'Lấy thông tin các sản phẩm thành công!',
                    data: allType,
                })
            
        }catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    createProduct,
    updateProduct,
    deleteProduct,
    getAllProduct,
    getDetailProduct,
    deleteManyProduct,
    getAllType
}
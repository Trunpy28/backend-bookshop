import Product from '../models/ProductModel.js';

const createProduct = async (newProduct) => {
    const {name,image,type,countInStock,price,rating,description,author,discount} = newProduct;
    try {
        const checkProduct = await Product.findOne({
            name: name
        })
        if(checkProduct !== null) {
            return {
                status: 'ERR',
                message: 'Sản phẩm đã tồn tại!'
            }
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
            return {
                status: 'OK',
                message: 'Thêm sản phẩm thành công!',
                data: createdProduct
            }
        }
    }catch (e) {
        throw new Error(e);
    }
}

const updateProduct = async (id,data) => {
    try {
        const checkProduct = await Product.findById(id);

        if(checkProduct === null) {
            return {
                status: 'OK',
                message: 'Sản phẩm không tồn tại!'
            }
        }
        
        const updatedProduct = await Product.findByIdAndUpdate(id,data,{new: true});
        
        return {
            status: 'OK',
            message: 'Cập nhật sản phẩm thành công!',
            data: updatedProduct
        }

    }catch (e) {
        throw new Error(e);
    }
}

const deleteProduct = async (id) => {
    try {
        const checkProduct = await Product.findById(id);

        if(checkProduct === null) {
            return {
                status: 'OK',
                message: 'Sản phẩm không tồn tại!'
            }
        }
        
        await Product.findByIdAndDelete(id);
        
        return {
            status: 'OK',
            message: 'Xóa sản phẩm thành công!'
        }
    }catch (e) {
        throw new Error(e);
    }
}

const deleteManyProduct = async (ids) => {
    try {
        await Product.deleteMany({_id: ids});
        
        return {
            status: 'OK',
            message: 'Xóa các sản phẩm thành công!'
        }
    }catch (e) {
        throw new Error(e);
    }
}

const getAllProduct = async (limit = Number.MAX_SAFE_INTEGER,page = 1, sort,filter) => {
    try {
        let totalProduct = await Product.countDocuments();
        let allProduct = [];
        if(sort){
            const objectSort = {[sort[0]]: sort[1]};
            const allProductSort = await Product.find().limit(limit).skip(limit*(page-1)).sort(objectSort);
        
            return {
                status: 'OK',
                message: 'Lấy thông tin các sản phẩm thành công!',
                data: allProductSort,
                total: totalProduct,
                pageCurrent: page,
                totalPage: Math.ceil(totalProduct / limit)
            }
        }
        if(filter){
            totalProduct = await Product.countDocuments({ [filter[0]]: { $regex: filter[1], $options: 'i'} });
            const allProductFilter = await Product.find({ [filter[0]]: { $regex: filter[1], $options: 'i'} }).limit(limit).skip(limit*(page-1));
        
            return {
                status: 'OK',
                message: 'Lấy thông tin các sản phẩm thành công!',
                data: allProductFilter,
                total: totalProduct,
                pageCurrent: page,
                totalPage: Math.ceil(totalProduct / limit)
            }
        }   
        if(!limit){
            allProduct = await Product.find();
        }
        else{
            allProduct = await Product.find().limit(limit).skip(limit*(page-1));
        }
        return {
            status: 'OK',
            message: 'Lấy thông tin các sản phẩm thành công!',
            data: allProduct,
            total: totalProduct,
            pageCurrent: page,
            totalPage: Math.ceil(totalProduct / limit)
        }
    }catch (e) {
        throw new Error(e);
    }
}

const getDetailProduct = async (id) => {
    try {
        const product = await Product.findById(id);

        if(product === null) {
            return {
                status: 'OK',
                message: 'Sản phẩm không tồn tại!'
            }
        }
        
        return {
            status: 'OK',
            message: 'Lấy thông tin sản phẩm thành công!',
            data: product
        }
    }catch (e) {
        throw new Error(e);
    }
}

const getAllType = async () => {
    try {
        const allType = await Product.distinct('type');
        return {
            status: 'OK',
            message: 'Lấy thông tin các sản phẩm thành công!',
            data: allType,
        }
        
    }catch (e) {
        throw new Error(e);
    }
}

export default {
    createProduct,
    updateProduct,
    deleteProduct,
    getAllProduct,
    getDetailProduct,
    deleteManyProduct,
    getAllType
}
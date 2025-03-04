import ProductServices from '../services/ProductService.js';

const createProduct = async (req,res) => {
    try {
        const {name,image,type,countInStock,price,rating,description,author} = req.body;
        if(!name || !image || !type || !countInStock || !price || !rating || !author) {
            return res.status(200).json({
                status: 'ERR',
                message: 'Cần điền đầy đủ thông tin sản phẩm'
            })
        }

        const respond = await ProductServices.createProduct(req.body);
        return res.status(200).json(respond);
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const updateProduct = async (req,res) => {
    try {
        const productId = req.params.id;
        const data = req.body;
        if(!productId){
            return res.status(200).json({
                status: 'ERR',
                message: 'Thiếu productId'
            })
        }

        const respond = await ProductServices.updateProduct(productId,data);
        return res.status(200).json(respond);
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const getDetailProduct = async (req,res) => {
    try {
        const productId = req.params.id;

        if(!productId){
            return res.status(200).json({
                status: 'ERR',
                message: 'Thiếu productId'
            })
        }
        const respond = await ProductServices.getDetailProduct(productId);
        return res.status(200).json(respond);
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const getAllProduct = async (req,res) => {
    try {
        const {limit, page, sort, filter} = req.query
        const respond = await ProductServices.getAllProduct(Number(limit) || Number.MAX_SAFE_INTEGER,Number(page) || 1, sort,filter);
        return res.status(200).json(respond);
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const deleteProduct = async (req,res) => {
    try {
        const productId = req.params.id;

        if(!productId){
            return res.status(200).json({
                status: 'ERR',
                message: 'Thiếu productId'
            })
        }
        const respond = await ProductServices.deleteProduct(productId);
        return res.status(200).json(respond);
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const deleteManyProduct = async (req,res) => {
    try {
        const ids = req.body.ids;

        if(!ids){
            return res.status(200).json({
                status: 'ERR',
                message: 'Thiếu danh sách ids'
            })
        }
        const respond = await ProductServices.deleteManyProduct(ids);
        return res.status(200).json(respond);
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const getAllType = async (req,res) => {
    try {
        const respond = await ProductServices.getAllType();
        return res.status(200).json(respond);
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

export default {
    createProduct,
    updateProduct,
    getDetailProduct,
    getAllProduct,
    deleteProduct,
    deleteManyProduct,
    getAllType
}
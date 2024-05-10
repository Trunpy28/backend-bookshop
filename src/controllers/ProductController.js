const ProductServices = require('../services/ProductService');

const createProduct = async (req,res) => {
    try {
        const {name,image,type,countInStock,price,rating,description,author} = req.body;
        if(!name || !image || !type || !countInStock || !price || !rating || !author) {
            return res.status(200).json({
                status: 'ERR',
                message: 'Please fill all the fields'
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
                message: 'The productId is required'
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
                message: 'The productId is required'
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
        const respond = await ProductServices.getAllProduct(Number(limit) || 10,Number(page) || 1, sort,filter);
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
                message: 'The productId is required'
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

module.exports = {
    createProduct,
    updateProduct,
    getDetailProduct,
    getAllProduct,
    deleteProduct
}
const Product = require('../models/ProductModel');
// @ts-ignore
const bCrypt = require("bCrypt");
const jwt = require('jsonwebtoken');
const { generalAccessToken, generalRefreshToken } = require("./JwtService");

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
                    message: 'The product is already exist'
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
                    message: 'The product is created',
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
                    message: 'The product is not defined'
                })
            }
            
            const updatedProduct = await Product.findByIdAndUpdate(id,data,{new: true});
            
            resolve({
                status: 'OK',
                message: 'Product updated successfully',
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
                    message: 'The product is not defined'
                })
            }
            
            await Product.findByIdAndDelete(id);
            
            resolve({
                status: 'OK',
                message: 'Delete product successfully'
            })
        }catch (e) {
            reject(e);
        }
    })
}

const getAllProduct = (limit = 10,page = 1, sort,filter) => {
    return new Promise(async (resolve, reject) => {
        try {
            const totalProduct = await Product.countDocuments();
            if(sort){
                const objectSort = {[sort[0]]: sort[1]};
                const allProductSort = await Product.find().limit(limit).skip(limit*(page-1)).sort(objectSort);
            
                resolve({
                    status: 'OK',
                    message: 'Get all product successfully',
                    data: allProductSort,
                    total: totalProduct,
                    pageCurrent: page,
                    totalPage: Math.ceil(totalProduct / limit)
                })
            }
            if(filter){
                const allProductFilter = await Product.find({ [filter[0]]: { $regex: filter[1], $options: 'i'} }).limit(limit).skip(limit*(page-1));
            
                resolve({
                    status: 'OK',
                    message: 'Get all product successfully',
                    data: allProductFilter,
                    total: totalProduct,
                    pageCurrent: page,
                    totalPage: Math.ceil(totalProduct / limit)
                })
            }   
            else{
                const allProduct = await Product.find().limit(limit).skip(limit*(page-1));
            
                resolve({
                    status: 'OK',
                    message: 'Get all product successfully',
                    data: allProduct,
                    total: totalProduct,
                    pageCurrent: page,
                    totalPage: Math.ceil(totalProduct / limit)
                })
            }
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
                    message: 'The product is not defined'
                })
            }
            
            resolve({
                status: 'OK',
                message: 'Get product info successfully',
                data: product
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
    getDetailProduct
}
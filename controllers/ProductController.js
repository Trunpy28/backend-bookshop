import ProductService from '../services/ProductService.js';
import CloudinaryService from '../services/CloudinaryService.js';
import * as elasticsearchService from '../services/ElasticSearchService.js';

const createProduct = async (req, res) => {
    try {
        const { files } = req;
        const imageLinks = [];
        
        // Upload từng ảnh lên Cloudinary và lưu link
        const { listResult, errorList } = await CloudinaryService.uploadFiles(files);

        if (errorList.length > 0) {
            return res.status(400).json({ message: 'Một số ảnh không thể tải lên', errors: errorList });
        }

        listResult.forEach(result => imageLinks.push(result.secure_url));

        const productData = {
            ...req.body,
            images: imageLinks
        };

        const product = await ProductService.createProduct(productData);
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
      const { id } = req.params;
      const { files } = req;
      let updatedFields = { ...req.body };
      
      // Nếu có file mới được upload
      if (files && files.length > 0) {
        const { listResult } = await CloudinaryService.uploadFiles(files);
        const imageLinks = listResult.map(result => result.secure_url);
        
        // Cập nhật trường images
        updatedFields.images = imageLinks;
      } else {
        // Nếu không có file mới, loại bỏ trường images để không cập nhật
        delete updatedFields.images;
      }
      
      // Cập nhật sản phẩm
      const result = await ProductService.updateProduct(id, updatedFields);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};

const getDetailProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await ProductService.getDetailProduct(id);
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await ProductService.deleteProduct(id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProductsPaginated = async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10,
        productCode,
        name,
        genres,
        author,
        publisher,
        sort,
        price
      } = req.query;
      
      // Chuyển đổi tham số truy vấn
      const options = {
        page: Number(page),
        limit: Number(limit),
        productCode,
        name,
        genres: genres ? genres.split(',') : undefined,
        author,
        publisher,
        sort: sort,
        price: price
      };

      const result = await ProductService.getProductsPaginated(options);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};

const getProductsForSelect = async (req, res) => {
  try {
    const products = await ProductService.getProductsForSelect();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductsByGenre = async (req, res) => {
    try {
        const { genreId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        
        const result = await ProductService.getProductsByGenre(
            genreId, 
            Number(page), 
            Number(limit)
        );
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Tìm kiếm sản phẩm với Elasticsearch
export const searchProducts = async (req, res) => {
    try {
        const { q, page = 1, limit = 10, sort = 'relevance' } = req.query;
        
        if (!q) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng nhập từ khóa tìm kiếm' 
            });
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort
        };

        const result = await elasticsearchService.searchProducts(q, options);
        
        return res.json({
            success: true,
            ...result
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi tìm kiếm sản phẩm',
            error: error.message
        });
    }
};

// Lấy sản phẩm tương tự
export const getSimilarProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 5 } = req.query;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu ID sản phẩm'
      });
    }

    const result = await elasticsearchService.getSimilarProducts(id, {
      limit: parseInt(limit)
    });
    
    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error || 'Không thể tìm sản phẩm tương tự'
      });
    }

    return res.json({
      success: true,
      products: result.products
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi tìm sản phẩm tương tự',
      error: error.message
    });
  }
};

export default {
    createProduct,
    updateProduct,
    getDetailProduct,
    deleteProduct,
    getProductsPaginated,
    getProductsForSelect,
    getProductsByGenre,
    searchProducts,
    getSimilarProducts
};
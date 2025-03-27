import ProductService from '../services/ProductService.js';
import CloudinaryService from '../services/CloudinaryService.js';

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

const getAllProduct = async (req, res) => {
    try {
        const { limit, page, sort, filter } = req.query;
        const products = await ProductService.getAllProduct(limit, page, sort, filter);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteManyProduct = async (req, res) => {
    try {
        const ids = req.body.ids;
        const result = await ProductService.deleteManyProduct(ids);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProductsPaginated = async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const { products, total } = await ProductService.getProductsPaginated(Number(page), Number(limit));
      res.status(200).json({ products, total });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};

const getAllProductsName = async (req, res) => {
  try {
    const products = await ProductService.getAllProductsName();
    res.json(products);
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

export default {
    createProduct,
    updateProduct,
    getDetailProduct,
    deleteProduct,
    getAllProduct,
    deleteManyProduct,
    getProductsPaginated,
    getAllProductsName,
    getProductsForSelect,
    getProductsByGenre
};
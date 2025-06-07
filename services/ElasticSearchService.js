import { elasticClient } from '../config/elasticsearchConfig.js';

/**
 * Lưu/cập nhật thông tin sản phẩm vào Elasticsearch
 */
export const indexProduct = async (product) => {
  try {
    const genreName = product.genre?.name || '';
    
    // Chuẩn bị dữ liệu để lưu vào Elasticsearch
    const elasticProduct = {
      id: product._id.toString(),
      name: product.name,
      author: product.author,
      publisher: product.publisher,
      description: product.description,
      genre: genreName,
      publicationYear: product.publicationYear,
      price: product.originalPrice,
      rating: product.rating?.avgRating || 0,
      images: product.images || []
    };

    // Lưu hoặc cập nhật sản phẩm vào Elasticsearch
    await elasticClient.index({
      index: 'products',
      id: product._id.toString(),
      body: elasticProduct,
      refresh: true
    });

    return { success: true };
  } catch (error) {
    console.error('Lỗi khi lưu sản phẩm vào Elasticsearch:', error);
    return { success: false, error };
  }
};

/**
 * Xóa sản phẩm khỏi Elasticsearch
 */
export const deleteProduct = async (productId) => {
  try {
    await elasticClient.delete({
      index: 'products',
      id: productId.toString(),
      refresh: true
    });
    return { success: true };
  } catch (error) {
    console.error('Lỗi khi xóa sản phẩm khỏi Elasticsearch:', error);
    return { success: false, error };
  }
};

/**
 * Tìm kiếm sản phẩm theo từ khóa
 */
export const searchProducts = async (query, options = {}) => {
  try {
    const { page = 1, limit = 10, sort } = options;
    const from = (page - 1) * limit;

    // Cấu hình sắp xếp
    let sortConfig = [];
    
    // Mặc định sắp xếp theo độ liên quan (_score)
    if (!sort || sort === 'relevance') {
      sortConfig = [{ _score: { order: 'desc' } }];
    } 
    // Xử lý cấu trúc sort mới với định dạng 'sortBy-order'
    else if (sort.includes('-')) {
      const [sortBy, order] = sort.split('-');
      sortConfig = [{ [sortBy]: { order } }];
    }

    // Thực hiện tìm kiếm
    const response = await elasticClient.search({
      index: 'products',
      body: {
        from,
        size: limit,
        sort: sortConfig,
        query: {
          // Sử dụng multi_match query để tìm kiếm trên nhiều trường khác nhau
          multi_match: {
            query,  // Từ khóa tìm kiếm từ người dùng
            
            // Các trường để tìm kiếm, với trọng số (boost) cho mức độ ưu tiên
            fields: [
              'name^3',      // Tên sách - trọng số cao nhất (3)
              'author^2',    // Tác giả - trọng số trung bình (2)
              'genre',       // Thể loại - trọng số mặc định (1)
              'publisher',   // Nhà xuất bản - trọng số mặc định (1)
              'description'  // Mô tả sách - trọng số mặc định (1)
            ],
            fuzziness: 'AUTO'      // Giúp tìm kiếm vẫn hoạt động ngay cả khi người dùng gõ sai chính tả
          }
        }
      }
    });

    const hits = response.hits.hits;
    const total = response.hits.total.value;

    const products = hits.map(hit => ({
      id: hit._id,
      ...hit._source,
      score: hit._score
    }));

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Lỗi khi tìm kiếm sản phẩm:', error);
    return { products: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }, error };
  }
};

/**
 * Đồng bộ lại toàn bộ sản phẩm từ MongoDB vào Elasticsearch
 */
export const syncAllProducts = async (products) => {
  try {
    console.log(`Bắt đầu đồng bộ ${products.length} sản phẩm vào Elasticsearch`);
    
    // Bulk index các sản phẩm
    if (products.length > 0) {
      const body = products.flatMap(product => {
        const genreName = product.genre?.name || '';
        
        return [
          { index: { _index: 'products', _id: product._id.toString() } },
          {
            id: product._id.toString(),
            name: product.name,
            author: product.author,
            publisher: product.publisher,
            description: product.description,
            genre: genreName,
            publicationYear: product.publicationYear,
            price: product.originalPrice,
            rating: product.rating?.avgRating || 0,
            images: product.images || []
          }
        ];
      });

      const response = await elasticClient.bulk({ refresh: true, body });
      
      if (response.errors) {
        console.error('Lỗi khi bulk index:', response.items);
        return { success: false, error: 'Có lỗi khi đồng bộ dữ liệu' };
      }
      
      console.log(`Đã đồng bộ ${products.length} sản phẩm vào Elasticsearch`);
      return { success: true, count: products.length };
    }
    
    return { success: true, count: 0 };
  } catch (error) {
    console.error('Lỗi khi đồng bộ sản phẩm:', error);
    return { success: false, error };
  }
};

/**
 * Tìm các sản phẩm tương tự dựa trên tiêu đề, tác giả, thể loại
 * và sắp xếp theo rating nếu cùng độ tương tự
 */
export const getSimilarProducts = async (productId, options = {}) => {
  try {
    // Mặc định lấy 10 sản phẩm tương tự
    const { limit = 10 } = options;

    // Lấy thông tin sản phẩm hiện tại
    const product = await elasticClient.get({
      index: 'products',
      id: productId
    });

    if (!product || !product._source) {
      throw new Error('Không tìm thấy sản phẩm');
    }

    const sourceProduct = product._source;

    // Tạo truy vấn tìm kiếm sản phẩm tương tự
    const response = await elasticClient.search({
      index: 'products',
      body: {
        size: limit + 1, // Lấy nhiều hơn 1 để loại bỏ sản phẩm hiện tại
        query: {
          bool: {
            must_not: [
              // Loại bỏ sản phẩm hiện tại
              { term: { _id: productId } }
            ],
            should: [       //Match ít nhất 1 trường
              // Tên sản phẩm (ưu tiên cao nhất)
              { match: { name: { query: sourceProduct.name, boost: 3.0 } } },
              // Tác giả 
              { match: { author: { query: sourceProduct.author, boost: 2.0 } } },
              // Thể loại
              { match: { genre: { query: sourceProduct.genre, boost: 2.0 } } },
              // Nhà xuất bản
              { match: { publisher: { query: sourceProduct.publisher, boost: 1.0 } } }
            ],
            minimum_should_match: 1
          }
        },
        // Kết hợp điểm tương tự với rating để sắp xếp kết quả
        sort: [
          { _score: { order: 'desc' } },  // Ưu tiên sắp xếp theo độ tương tự
          { rating: { order: 'desc' } }   // Nếu cùng độ tương tự thì sắp xếp theo rating
        ]
      }
    });

    const hits = response.hits.hits;
    
    // Chuyển đổi kết quả
    const similarProducts = hits.map(hit => ({
      id: hit._id,
      ...hit._source,
      similarity_score: hit._score
    }));

    return {
      success: true,
      products: similarProducts
    };
  } catch (error) {
    console.error('Lỗi khi tìm sản phẩm tương tự:', error);
    return { 
      success: false, 
      products: [],
      error: error.message 
    };
  }
}; 
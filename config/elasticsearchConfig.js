import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

dotenv.config();

// Tạo client kết nối tới Elastic Cloud
const elasticClient = new Client({
  cloud: {
    id: process.env.ELASTIC_CLOUD_ID,
  },
  auth: {
    apiKey: process.env.ELASTIC_API_KEY,
  }
});

// Kiểm tra kết nối
const checkConnection = async () => {
  try {
    const info = await elasticClient.info();
    console.log('Elasticsearch kết nối thành công:', info.version.number);
    return true;
  } catch (err) {
    console.error('Lỗi kết nối Elasticsearch:', err);
    return false;
  }
};

// Tạo index cho sản phẩm với cấu hình tìm kiếm tiếng Việt
const createProductIndex = async () => {
  try {
    const indexExists = await elasticClient.indices.exists({
      index: 'products'
    });

    if (!indexExists) {
      await elasticClient.indices.create({
        index: 'products',
        body: {
          settings: {
            analysis: {
              analyzer: {
                vietnamese_analyzer: {
                  tokenizer: "standard",
                  filter: [
                    "lowercase",
                    "asciifolding"
                  ]
                }
              }
            }
          },
          mappings: {
            properties: {
              name: { 
                type: 'text',
                analyzer: 'vietnamese_analyzer',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              author: { 
                type: 'text', 
                analyzer: 'vietnamese_analyzer',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              publisher: { 
                type: 'text', 
                analyzer: 'vietnamese_analyzer',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              description: { type: 'text', analyzer: 'vietnamese_analyzer' },
              genre: { 
                type: 'text', 
                analyzer: 'vietnamese_analyzer',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              publicationYear: { type: 'integer' },
              price: { type: 'float' },
              rating: { type: 'float' },
              images: { 
                type: 'keyword',
                index: false
              }
            }
          }
        }
      });
      console.log('Index "products" đã được tạo thành công');
    }
  } catch (err) {
    console.error('Lỗi khi tạo index:', err);
  }
};

export { elasticClient, checkConnection, createProductIndex }; 
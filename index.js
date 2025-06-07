import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import routes from './routes/index.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from './config/passport.js';
import { checkConnection, createProductIndex } from './config/elasticsearchConfig.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001

const allowedOrigins = [process.env.CLIENT_URL];

app.use(
  cors({
    origin: function (origin, callback) {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());

app.use(passport.initialize());     //Cấu hình passport cho toàn server

app.use(express.json({limit: '50mb'}));

app.use(express.urlencoded({ extended: true, limit: '50mb' }));

routes(app);

// Kết nối đến MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(()=>{
        console.log('Connected to MongoDB Successfully');
    })
    .catch((err)=>{
        console.log('MongoDB connection error:', err);
    })

// Khởi tạo Elasticsearch
const initElasticsearch = async () => {
  try {
    // Kiểm tra kết nối Elasticsearch
    const connected = await checkConnection();
    
    if (connected) {
      // Tạo index nếu chưa tồn tại
      await createProductIndex();
      console.log('Elasticsearch đã sẵn sàng');
    } else {
      console.log('Không thể kết nối Elasticsearch - chức năng tìm kiếm có thể không hoạt động');
    }
  } catch (error) {
    console.error('Lỗi khởi tạo Elasticsearch:', error);
  }
};

// Khởi động server
app.listen(port, async () => {
  // Khởi tạo Elasticsearch
  await initElasticsearch();
  
  console.log('Server is running in port: ' + port);
});

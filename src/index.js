const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const routes = require('./routes');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001

app.use(cors({
    credentials: true,
    origin: ['http://localhost:3000']
}));

app.use(cookieParser());

app.use(passport.initialize());

app.use(express.json({limit: '50mb'}));

app.use(express.urlencoded({ extended: true, limit: '50mb' }));


routes(app);

mongoose.connect(process.env.MONGODB_URI)
    .then(()=>{
        console.log('Connected to Db Successfully');
    })
    .catch((err)=>{
        console.log(err);
    })

app.listen(port, ()=>{
    console.log('Server is running in port: ' + port);
})

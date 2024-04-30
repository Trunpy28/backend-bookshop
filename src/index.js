const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const routes = require('./routes');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser')

dotenv.config();

const app = express();
const port = process.env.PORT || 3001

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

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

const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const routes = require('./routes');
const bodyParser = require('body-parser');
dotenv.config();

const app = express();
const port = process.env.PORT || 3001

app.get('/',(req,res)=>{
    return res.send('Hello World');
})
app.use(bodyParser.json());

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

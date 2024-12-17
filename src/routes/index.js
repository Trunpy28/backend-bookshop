const UserRouter = require('./UserRouter')
const ProductRouter = require('./ProductRouter')
const OrderRouter = require('./OrderRouter')
const MomoRouter = require('./MomoRouter')
const PaypalRoutes = require('./PaypalRouter')
const AuthRoutes = require('./AuthRouter')

const routes = (app) => {
    app.use('/api/user',UserRouter);
    app.use('/api/product',ProductRouter);
    app.use('/api/order',OrderRouter);
    app.use('/api/momo', MomoRouter);
    app.use('/api/paypal', PaypalRoutes);
    app.use('/api/auth', AuthRoutes);
}

module.exports = routes;
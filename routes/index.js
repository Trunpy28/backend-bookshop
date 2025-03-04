import UserRouter from './UserRouter.js'
import ProductRouter from './ProductRouter.js'
import OrderRouter from './OrderRouter.js'
import MomoRouter from './MomoRouter.js'
import PaypalRoutes from './PaypalRouter.js'
import AuthRoutes from './AuthRouter.js'

const routes = (app) => {
    app.use('/api/user',UserRouter);
    app.use('/api/product',ProductRouter);
    app.use('/api/order',OrderRouter);
    app.use('/api/momo', MomoRouter);
    app.use('/api/paypal', PaypalRoutes);
    app.use('/api/auth', AuthRoutes);
}

export default routes;
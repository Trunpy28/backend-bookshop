import UserRouter from './UserRouter.js'
import ProductRouter from './ProductRouter.js'
import OrderRouter from './OrderRouter.js'
import MomoRouter from './MomoRouter.js'
import PaypalRoutes from './PaypalRouter.js'
import AuthRoutes from './AuthRouter.js'
import GenreRouter from './GenreRouter.js'
import ReviewRouter from './ReviewRouter.js'
import BatchRouter from './BatchRouter.js'
import InventoryRouter from './InventoryRouter.js'
import VoucherRouter from './VoucherRouter.js'

const routes = (app) => {
    app.use('/api/user',UserRouter);
    app.use('/api/product',ProductRouter);
    app.use('/api/order',OrderRouter);
    app.use('/api/momo', MomoRouter);
    app.use('/api/paypal', PaypalRoutes);
    app.use('/api/auth', AuthRoutes);
    app.use('/api/genre', GenreRouter);
    app.use('/api/review', ReviewRouter);
    app.use('/api/batch', BatchRouter);
    app.use('/api/inventory', InventoryRouter);
    app.use('/api/voucher', VoucherRouter);
}

export default routes;
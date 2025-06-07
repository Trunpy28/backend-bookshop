import UserRouter from './UserRouter.js'
import ProductRouter from './ProductRouter.js'
import OrderRouter from './OrderRouter.js'
import PaypalRoutes from './PaypalRouter.js'
import AuthRoutes from './AuthRouter.js'
import GenreRouter from './GenreRouter.js'
import ReviewRouter from './ReviewRouter.js'
import BatchRouter from './BatchRouter.js'
import VoucherRouter from './VoucherRouter.js'
import CartRouter from './CartRouter.js'
import ShippingAddressRouter from './ShippingAddressRouter.js'
import VNPayRouter from './VNPayRouter.js'

const routes = (app) => {
    app.use('/api/user',UserRouter);
    app.use('/api/product',ProductRouter);
    app.use('/api/order',OrderRouter);
    app.use('/api/paypal', PaypalRoutes);
    app.use('/api/auth', AuthRoutes);
    app.use('/api/genre', GenreRouter);
    app.use('/api/review', ReviewRouter);
    app.use('/api/batch', BatchRouter);
    app.use('/api/voucher', VoucherRouter);
    app.use('/api/cart', CartRouter);
    app.use('/api/shipping-address', ShippingAddressRouter);
    app.use('/api/vnpay', VNPayRouter);
}

export default routes;
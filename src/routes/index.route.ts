import userRoute from "./user.route";
import productRoute from "./products.route";
import orderRoute from "./orders.route";
import categoryRoute from "./categories.route";
import discountRoute from "./discounts.route";
import dashboardRoute from "./dashboard.route";

export default [
    ...userRoute,
    ...productRoute,
    ...orderRoute,
    ...categoryRoute,
    ...discountRoute,
    ...dashboardRoute
]
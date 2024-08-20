import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from 'react-router-dom';
import './assets/styles/bootstrap.custom.css';
import { Provider } from 'react-redux';
import store from './store';
import './assets/styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import HomeScreen from './screens/HomeScreen';
import ProductCatalogScreen from './screens/ProductCatalogScreen';
import ProductScreen from './screens/ProductScreen';
import CartScreen from './screens/CartScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DeliveryScreen from './screens/DeliveryScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import PaymentSuccess from './screens/PaymentSuccess';
import { StripeProvider } from './contexts/StripeContext';
import ProfileScreen from './screens/ProfileScreen';
import OrderListScreen from './screens/admin/OrderListScreen';
import ProductListScreen from './screens/admin/ProductListScreen';
import ProductEditScreen from './screens/admin/ProductEditScreen';
import UserListScreen from './screens/admin/UserListScreen';
import CouponEditScreen from './screens/admin/CouponEditScreen';
import CouponListScreen from './screens/admin/CouponListScreen';

const router = createBrowserRouter(
  createRoutesFromElements(
    
    <Route path='/' element={ <App  />}>
      <Route index={true} path='/' element={<HomeScreen />}/>
      <Route  path='/productcatalog' element={<ProductCatalogScreen />}/>
      <Route path='/product/:id' element={<ProductScreen />} />
      <Route path='/cart' element={<CartScreen />} />
      <Route path='/login' element={<LoginScreen />} />
      <Route path='/register' element={<RegisterScreen />} />

      <Route path='' element={<PrivateRoute />}>
        <Route path='/delivery' element={<DeliveryScreen />} />
        {/* <Route path='/payment' element={<PaymentScreen />} /> */}
        <Route path='/placeorder' element={<PlaceOrderScreen />} />
        <Route path='/order/:id' element={<OrderScreen />} />
        <Route path='/payment-success/:id' element={<PaymentSuccess />} />
        <Route path='/profile' element={<ProfileScreen />} />  
      </Route>
      
      
      <Route path='' element={<AdminRoute />}>
        <Route path='/admin/orderlist' element={<OrderListScreen />} />
        <Route path='/admin/productlist' element={<ProductListScreen />} />
        <Route path='/admin/product/:id/edit' element={<ProductEditScreen />} />
        <Route path='/admin/userlist' element={<UserListScreen />} />
        <Route path='/admin/coupon/:id/edit' element={<CouponEditScreen />} />
        <Route path='/admin/couponlist' element={<CouponListScreen />} />
      </Route>

  </Route>
    
  )
)


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <StripeProvider>
        <RouterProvider router={router} />
      </StripeProvider>
    </Provider>
  </React.StrictMode>
);


reportWebVitals();

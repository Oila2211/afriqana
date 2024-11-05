import { Row, Col} from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Paginate from '../components/Paginate.jsx';
import { useGetProductsQuery } from '../slices/productsApiSlice';
// import ProductCarousel from '../components/ProductCarousel.jsx';
// import Meta from '../components/Meta.jsx';



const ProductCatalogScreen = () => {

  const { keyword, pageNumber } = useParams

  const { data, isLoading, error } = useGetProductsQuery({ pageNumber });



  return (
    <>
      {isLoading ? (
        <Loader/>
      ): error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
          </Message>
      ) : (
        <>
        <h1>Order Online</h1>
        <Row>
            {data.products.map((product) => (
                <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                    <Product product={product}/>
                </Col>
            ))}
        </Row>
        <Paginate 
          pages={data.pages} 
          page={data.page}
          keyword={keyword ? keyword : ''}
         />
        </>
      )}

    </>
  )
}



        // <>
        // {!keyword ? (
        //   <ProductCarousel />
        // ) : (
        //   <Link to='/' className='btn btn-light mb-4'>
        //     Go Back
        //   </Link>
        // )}
        // {isLoading ? (
        //   <Loader />
        // ) : error ? (
        //   <Message variant='danger'>
        //     {error?.data?.message || error.error}
        //   </Message>
        // ) : (
        //   <>
        //     <Meta />
        //     <h1>Online Order</h1>
        //     <Row>
        //       {data.products.map((product) => (
        //         <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
        //           <Product product={product} />
        //         </Col>
        //       ))}
        //     </Row>
        //     <Paginate
        //       pages={data.pages}
        //       page={data.page}
        //       keyword={keyword ? keyword : ''}
        //     />
        //   </>
        // )}
        // </>
        // );
        // };

export default ProductCatalogScreen
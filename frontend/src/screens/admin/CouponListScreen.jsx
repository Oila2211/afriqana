import { useEffect } from "react";
import { LinkContainer } from "react-router-bootstrap";
import { Table, Button, Row, Col } from "react-bootstrap";
import { FaBan, FaCheck, FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import { 
    useGetAllCouponsQuery,
    useCreateCouponMutation,
    useDeleteCouponMutation
 } from "../../slices/couponApiSlice";
import { toast } from "react-toastify"; 

const CouponListScreen = () => {
    const { data: coupons, isLoading, error, refetch} = useGetAllCouponsQuery();
    const [ createCoupon, {isLoading: loadingCreate, isSuccess: successCreate}] = useCreateCouponMutation();
    const [deleteCoupon, {isLoading: loadingDelete, isSuccess: successDelete}] = useDeleteCouponMutation();
    
    useEffect(() => {
      if (successCreate || successDelete) {
          refetch();
      }
  }, [successCreate, successDelete, refetch]);

    console.log("Error object:", error);
    const deleteCouponHandler = async (id) => {
      if (window.confirm('Are you sure')) {
        try {
          await deleteCoupon(id)
          toast.success('Coupon deleted successfully')
          // refetch()
        } catch (err) {
          toast.error(err?.data?.message || err.error)
        }
      }
    }

    const createCouponHandler = async () => {
      if (window.confirm('Are you sure you want to create a new Coupon')) {
        try {
          await createCoupon();
          toast.success('New Coupon created')
          // refetch();
        } catch (err) {
          toast.error(err?.data?.message || err.error)
        }
      }
    }

  return (
    <>
      <Row>
        <Col>
          <h1>Coupons</h1>
        </Col>
        <Col className="text-end">
          <Button className="my-3" onClick={createCouponHandler}>
            <FaPlus /> Create Coupon
          </Button>
        </Col>
      </Row>

      {loadingCreate && <Loader />}
      {loadingDelete && <Loader />}
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error?.data?.message || 'An unknown error occured.'}</Message>
      ) : (
        <>
          <Table striped bordered hover responsive className="table-sm">
            <thead>
              <tr>
                <th>Coupon ID</th>
                <th>Coupon Code</th>
                <th> % Discount</th>
                <th>Expiry date</th>
                <th>Limit per User</th>
                <th>Is Active</th>
              </tr>
            </thead>

            <tbody>
              {coupons && coupons.length > 0 ? (coupons.map((coupon) => (
                <tr key={coupon._id}>
                  <td>{coupon._id}</td>
                  <td>{coupon.code}</td>
                  <td>{coupon.discountPercentage}</td>
                  <td>{coupon.expiryDate}</td>
                  <td>{coupon.limitPerUser}</td>
                  <td>
                    {coupon.isActive ? (
                    <FaCheck style={{ color: 'green'}}/>
                    ) : (
                    <FaBan style={{ color: 'red'}}/>
                    )}
                    </td>
                  <td>
                    <LinkContainer to={`/admin/coupon/${coupon._id}/edit`}>
                      <Button variant ='light' className="btn-sm mx-2">
                        <FaEdit />
                      </Button>
                    </LinkContainer>
                    <Button
                     variant="danger"
                     className="btn-sm"
                     onClick={() => deleteCouponHandler(coupon._id)}
                    >
                      <FaTrash style={{ color: 'white'}} />
                    </Button>
                  </td>
                </tr>
              ))
              ) : (
                <tr>
                  <td colSpan='6'>No Coupons found</td>
                </tr>
              
              )}
            </tbody>
          </Table>
        </>
      )}
    </>
  )
}

export default CouponListScreen
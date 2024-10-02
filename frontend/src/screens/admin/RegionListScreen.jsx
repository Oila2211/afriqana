import { LinkContainer } from 'react-router-bootstrap';
import { useEffect } from 'react';
import { Table, Button, Row, Col } from 'react-bootstrap';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { 
    useGetAllRegionsQuery,
    useCreateRegionMutation,
    useDeleteRegionMutation
 } from '../../slices/regionApiSlice';
import { toast } from 'react-toastify';

const RegionListScreen = () => {
    const { data: region, isLoading, error, refetch} = useGetAllRegionsQuery();
    const [ createRegion, {isLoading: loadingCreate, isSuccess: successCreate}] = useCreateRegionMutation();
    const [deleteRegion, {isLoading: loadingDelete, isSuccess: successDelete}] = useDeleteRegionMutation();
    
    useEffect(() => {
      if (successCreate || successDelete) {
          refetch();
      }
  }, [successCreate, successDelete, refetch]);

    console.log("Error object:", error);
    const deleteRegionHandler = async (id) => {
      if (window.confirm('Are you sure')) {
        try {
          await deleteRegion(id)
          toast.success('Region deleted successfully')
          // refetch()
        } catch (err) {
          toast.error(err?.data?.message || err.error)
        }
      }
    }

    const createRegionHandler = async () => {
      if (window.confirm('Are you sure you want to create a new Region')) {
        try {
          await createRegion();
          toast.success('New Region created')
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
          <h1>Regions</h1>
        </Col>
        <Col className="text-end">
          <Button className="my-3" onClick={createRegionHandler}>
            <FaPlus /> Create Region
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
                <th>Region ID</th>
                <th>Region name</th>
                <th> Base Price</th>
                <th>Max Distance</th>
                <th>Extra Charge</th>
              </tr>
            </thead>

            <tbody>
              {region && region.length > 0 ? (region.map((region) => (
                <tr key={region._id}>
                  <td>{region._id}</td>
                  <td>{region.name}</td>
                  <td>{region.baseDeliveryPrice}</td>
                  <td>{region.maxDistance}</td>
                  <td>{region.extraChargePerKm}</td>

                  <td>
                    <LinkContainer to={`/admin/region/${region._id}/edit`}>
                      <Button variant ='light' className="btn-sm mx-2">
                        <FaEdit />
                      </Button>
                    </LinkContainer>
                    <Button
                     variant="danger"
                     className="btn-sm"
                     onClick={() => deleteRegionHandler(region._id)}
                    >
                      <FaTrash style={{ color: 'white'}} />
                    </Button>
                  </td>
                </tr>
              ))
              ) : (
                <tr>
                  <td colSpan='6'>No Regions found</td>
                </tr>
              
              )}
            </tbody>
          </Table>
        </>
      )}
    </>
  )
}

export default RegionListScreen
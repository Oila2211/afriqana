import { useNavigate } from 'react-router-dom';
import React from 'react'
import {Navbar, Nav, Container, Badge, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap'
import { FaCartArrowDown,FaUser} from 'react-icons/fa6';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';
import logo from '../assets/Afriqana-logo.jpg';
import { useDispatch,  useSelector } from 'react-redux';

const Header = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();


  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async() => {
    try {
      await logoutApiCall().unwrap();

      dispatch(logout());
      navigate('/login')
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <header>
    <Navbar expand="md" bg='purple' variant='dark'  collapseOnSelect>
      <Container>
        <LinkContainer to='/'>
        <Navbar.Brand>
            <img src={logo} alt="Afriqana" className="logo"></img>
        </Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav " >
          <Nav className="ms-auto">
          <LinkContainer to='/productcatalog'>
            <Nav.Link>
                 Order
            </Nav.Link>
            </LinkContainer>
            <LinkContainer to='/member'>
            <Nav.Link>
                Member
            </Nav.Link>
            </LinkContainer>
            <LinkContainer to='/catering'>
            <Nav.Link>
                Catering
            </Nav.Link>
            </LinkContainer>
            <LinkContainer to='/cart'>
            <Nav.Link>
             <FaCartArrowDown /> Cart
              {
                cartItems.length > 0 && (
                  <Badge pill bg='success' style={{marginLeft: '5px'}}>
                    { cartItems.reduce((a, c) => a + c.qty, 0) }
                  </Badge>
                )
              }
            </Nav.Link>
            </LinkContainer>
            { userInfo ? (
              <NavDropdown title={userInfo.name} id='username'>
                  <LinkContainer to='/profile'>
                    <NavDropdown.Item>Profile</NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Item onClick={logoutHandler}>Logout</NavDropdown.Item>
              </NavDropdown>
            ) : ( <LinkContainer to='/login'>
            <Nav.Link href='/login'>
                <FaUser /> Sign In
            </Nav.Link>
            </LinkContainer>) }
            {userInfo && userInfo.isAdmin && (
              <NavDropdown title='Admin' id='adminmenu'>
                  <LinkContainer to='/admin/productlist'>
                    <NavDropdown.Item>Products</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to='/admin/orderlist'>
                    <NavDropdown.Item>Orders</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to='/admin/userlist'>
                    <NavDropdown.Item>Users</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to='/admin/couponlist'>
                    <NavDropdown.Item>Coupons</NavDropdown.Item>
                  </LinkContainer>
              </NavDropdown>
            )}


          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    </header>
  )
}

export default Header
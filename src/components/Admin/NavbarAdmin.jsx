import React from 'react'
import { Link } from 'react-router-dom'
import Cookies from 'js-cookie'
import './NavbarAdmin.css'

const NavbarAdmin = () => {
  return (
    <div className='navbar-admin'>
        <Link to='/admin' className='navbar-link-admin'>Admin</Link>
        <Link to='/mesero' className='navbar-link-admin'>Mesero</Link>
        <Link to='/cocinero' className='navbar-link-admin'>Cocinero</Link>
        <Link to='/' className='navbar-link-admin' onClick={() => {
            Cookies.remove('token')
            window.location.reload()
        }}>Logout</Link>        
    </div>
  )
}

export default NavbarAdmin
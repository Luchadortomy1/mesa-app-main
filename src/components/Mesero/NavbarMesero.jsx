import React from 'react'
import { Link } from 'react-router-dom'
import Cookies from 'js-cookie'
import './NavbarMesero.css'

const NavbarMesero = () => {
  return (
    <div className='navbar-mesero'>
        <Link to='/mesero' className='navbar-link-mesero'>Mesero</Link>
        <Link to='/' className='navbar-link-mesero' onClick={() => {
            Cookies.remove('token')
            window.location.reload()
        }}>Logout</Link>        
    </div>
  )
}

export default NavbarMesero
import React from 'react'
import { Link } from 'react-router-dom'
import Cookies from 'js-cookie'
import './NavbarCocina.css'

const NavbarCocina = () => {
  return (
    <div className='navbar-cocinero'>
        <Link to='/cocinero' className='navbar-link-cocinero'>Cocinero</Link>
        <Link to='/' className='navbar-link-cocinero' onClick={() => {
            Cookies.remove('token')
            window.location.reload()
        }}>Logout</Link>        
    </div>
  )
}

export default NavbarCocina
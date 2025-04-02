import React from 'react'
import { Link } from 'react-router-dom'
import Cookies from 'js-cookie'

const Navbar = () => {
  return (
    <div className='navbar'>
        <Link to='/mesero' className='navbar-link'>Mesero</Link>
        <Link to='/cocinero' className='navbar-link'>Cocinero</Link>
        <Link to='/' className='navbar-link' onClick={() => {
            Cookies.remove('token')
            window.location.reload()
        }}>Logout</Link>        
    </div>
  )
}

export default Navbar
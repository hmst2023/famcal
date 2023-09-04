import React from 'react'
import { Link } from "react-router-dom";

const Mailto = ({ email, children }) => {
    return <a href={`mailto:${email}`}>{children}</a>;
  };

const NotFound = () => {
  return (
    <div className='bg-aubergine p-8'>
            <h1 className='text-xl font-bold'>404</h1>
            <p> Oops! Sorry this happened to you. Here are some helpful links:</p>
                <Link to='/' className='text-blue-700'>Home</Link> | <Link to='/login' className='text-blue-700'>Login</Link>

    </div>
  )
}
export default NotFound

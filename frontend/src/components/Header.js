import React from 'react'
import {Link} from "react-router-dom";
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';


const Header = () => {
  const {auth, setAuth} =useAuth();
  let navigate = useNavigate();

  function handleLogout (){
    setAuth({})
    navigate("/login", {replace:true})
  }
  return (
    <div className='bg-stone-200'>
    <nav className='max-w-6xl  mx-auto grid grid-cols-2 justify-between bg-gradient-to-t from-fuchsia-400 to-fuchsia-200'>
      <div className='pl-8 py-5'>
        <h1 className='text-3xl font-bold text-fuchsia-900'><Link to="/">Familienplaner</Link></h1>
        {auth?.username && (
           <div className='pr-8 text-stone-300'><Link to="/new">new event</Link></div> 
        ) }

       
      </div>

      <div className='text-right text-fuchsia-900 pr-8'>
        {auth?.username ? `Logged in as ${auth.username}`: "Not Logged in"}
        {auth?.username && (
          <button onClick={handleLogout}>(logout)</button> 
        ) }
        
        
       
      </div>      
    </nav>
    </div>
  )
}

export default Header
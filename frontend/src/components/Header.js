import React, { useState } from 'react'
import {Link} from "react-router-dom";
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as Logo } from './logo.svg';

const Header = () => {
  const {auth, setAuth} = useAuth();
  const [menue, setMenue] = useState(false);
  let navigate = useNavigate();


  const toggleMenue = () => {
    if (!menue){
      window.addEventListener('mouseup', function(){
        setTimeout(setMenue,200, false)
        console.log('clicked')
      }, {once:true})
    } 
    
    setMenue(!menue)

  }

  const handleLogout = ()=>{
    setMenue(false)
    setAuth({})
    navigate("/login", {replace:true})
  }
  const Dropdown =() =>{
    return(
      <div className='flex relative my-1'>
        <div className='flex absolute right-0 bg-blue-700 p-2 mr-0 rounded text-white text-left'>
        <ul>
        <li className='hover:text-zinc-400'><Link to="/">Kalender</Link></li>
        <li className='hover:text-zinc-400'><Link to="/setup">Einstellungen</Link></li>
        <li className='hover:text-zinc-400'><button onClick={handleLogout}>Logout</button></li>
        </ul>
      </div>
      </div>
    )
  }
  
  return (
    <nav className='grid grid-cols-2 px-8 py-5 justify-between bg-gradient-to-t from-fuchsia-400 to-fuchsia-200'>
      <div className='box-content w-20 md:w-40'>
       <Link to="/"><Logo/></Link>
      </div>

      <div className='text-right'>
        {auth?.username && 
        <button onClick={toggleMenue} className='bg-transparent text-fuchsia-900 font-semibold py-1 px-2 border border-zinc-400 rounded'>
          {auth.username} {menue ? '\u25B2':'\u25BC'}
        </button>}
        {(menue && auth?.username) && <Dropdown/>}
      </div>
    </nav>

  )
}

export default Header
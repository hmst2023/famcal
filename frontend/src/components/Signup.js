import React from 'react'
import { useState } from 'react';
import { useNavigate } from "react-router-dom";

const Signup = () => {
  let navigate = useNavigate();
  const [apiError,setApiError] = useState();
  const [apiMessage,setApiMessage] = useState();
  
  const onFormReset = ()=> {
    navigate("/", {replace:true});
  }
  const onFormSubmit = async (e)=>{
    e.preventDefault();
    const timeout = 8000;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    let dict = {email: e.target.signupMail.value}    
    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/users/proposefam", {
        signal:controller.signal,
        method:"POST",
        headers:{
            "Content-Type":"application/json",
        },
        body:JSON.stringify(dict)});
        if (response.ok){
          setApiMessage('Check your email account and follow the instructions')

        } else{
          let errorResponse = await response.json();
          setApiError(errorResponse["detail"]);
        }
    } catch (error) {
      if (error.name==='AbortError'){
        setApiError('Possible Timeout')
      } else {
        setApiError(error.message)
      }
    };
    clearTimeout(id);

    }

  return (
    <div className="bg-stone-200 w-screen h-screen">
      <div className='App max-w-6xl  mx-auto bg-aubergine p-8'>
        <h1 className='font-bold text-lg leading-loose py-2'>Signup</h1>
        Enter your emailadress: 
        <div className='flex'>
      <form onSubmit={onFormSubmit}> 
        <input name='signupMail' type='email' required/><br/>
        <div className='text-right text-lg'>
        <p>&nbsp;<span className='text-sm text-red-700'>{apiMessage} {apiError}</span></p>
        
        <input type='submit' className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"/><br/>
        <span className='text-sm'>
                    <input className='py-2 px-4' type="reset" onClick={onFormReset}/>
                    </span>
        </div>

      </form>
      
    </div>
        </div>

    </div>
  )
}

export default Signup
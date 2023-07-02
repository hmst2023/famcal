import { data } from 'autoprefixer';
import React, { useState } from 'react'
import { useNavigate } from "react-router-dom";
import useAuth from '../hooks/useAuth';


const Login = () => {
  const { setAuth } = useAuth();
  let navigate = useNavigate();
  const [apiError,setApiError] = useState();
  const onFormReset = ()=> {
    navigate("/", {replace:true});
  }

  const onFormSubmit = async (e)=>{
    e.preventDefault();
    const timeout = 8000;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    let dict = {username: e.target.text.value, password: e.target.password.value}
    // fetch("http://rascal.serverpit.com:8000/login", {
    try {
      const response = await fetch("http://rascal.serverpit.com:8000/users/login", {
        signal:controller.signal,
        method:"POST",
        headers:{
            "Content-Type":"application/json",
        },
        body:JSON.stringify(dict)});
        if (response.ok){
          const token = await response.json()
          await getUserData(token["token"])
        } else{
          let errorResponse = await response.json();
          setApiError(errorResponse["detail"]);
          setAuth(null);
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

  const getUserData =  (token) => {
    // fetch("http://rascal.serverpit.com:8000/me", {
    fetch("http://rascal.serverpit.com:8000/users/me", {
        method:"GET",
        headers: {
            "Content-Type": "application/json",
            Authorization : `Bearer ${token}`,
        }
    })
    .then((response) => response.json())
    .then((data) => {
      let test = data;
      test["token"]=token;
      setAuth(test);
      navigate("/", {replace:true});
    })
  };

  return (
    <div className="bg-stone-200 w-screen h-screen">
      <div className='App max-w-6xl  mx-auto bg-aubergine p-8'>
        <div className='flex'>
        <form onSubmit={onFormSubmit} onReset={onFormReset}>
          Username: <input type="text" name="text" required/><br/>
          <p>&nbsp;</p>
          Passwort: &nbsp;&nbsp;<input type="password" name="password" required/><br/>
          <p className='text-right text-xs text-red-500'>&nbsp; {apiError}</p>
          <div className='text-right text-lg'>
          <input className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" type="submit"/> <br/>
          <span className='text-sm'>
          <input className='py-2 px-4' type="reset"/>
          </span>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
};

export default Login
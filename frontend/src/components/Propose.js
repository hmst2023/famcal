import React from 'react'
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const Propose = () => {
    const {link} = useParams();
    const [error, setError] = useState();
    const [proposal, setProposal] = useState({username:'', email:''});

    let navigate = useNavigate();

    const getProposal = async()=>{
        const timeout = 8000;
        const controller = new AbortController();
        const id2 = setTimeout(() => controller.abort(), timeout);
        try {
            const res = await fetch(process.env.REACT_APP_BACKEND_URL + "/users/proposal/"+link, {
              signal: controller.signal,
              method:"GET",
              headers: {
                  "Content-Type": "application/json",
              }
            })
            const data = await res.json()
            if (!res.ok){
              navigate('/', {replace:true});
            } else {
              setError([])
              setProposal(data)
            }
          } catch (error) {
            if (error.name==='AbortError'){
              setError(['Possible Timeout'])
          } else {
              setError([error.message])
          }
        };
        clearTimeout(id2);
      }
      const submitHandler = async(e)=>{
        var dict = {...proposal}
        e.preventDefault()
        if (!dict.username){
          dict['username']=e.target.username.value
        }
        dict['link'] = link
        dict['password'] = e.target.password.value
        console.log(dict)
        const timeout = 8000;
        const controller = new AbortController();
        const id2 = setTimeout(() => controller.abort(), timeout);
        try {
          if (e.target.password.value!=e.target.verifyPassword){
            throw new Error("Verify Password does not match") 
          }
        const res = await fetch(process.env.REACT_APP_BACKEND_URL + "/users/register", {
        method:"POST",
        signal:controller.signal,
        headers: {
            "Content-Type": "application/json",
            },
        body: JSON.stringify(dict)
        })
        if (res.ok){
            navigate('/',{replace:true})
        }
        } catch (error) {
        if (error.name==='AbortError'){
            setError(['Possible Timeout'])
        } else {
            setError([error.message])
        }
        }
        } 
      useEffect(()=>{
        getProposal()
      },[])
  return (

    <div className="bg-stone-200 w-screen h-screen">
    <div className='App max-w-6xl  mx-auto bg-aubergine p-8'>
        <h1 className='font-bold text-lg leading-loose py-2'>Register User:</h1>
        <div className='flex'>
        <form onSubmit={submitHandler}>
        {proposal.username ? <p className='py-1'>Username:&nbsp;&nbsp;{proposal.username}</p> : <p className='py-1'>Username:&nbsp;&nbsp;<input name='username' type='text' required/></p>}
            <p className='py-1'>Email:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {proposal.email}</p>
            <p className='py-1'>Password: &nbsp;&nbsp;<input name='password' type='password' required/></p>
            <p className='py-1'>Verify Password: <input name='verifyPassword' type='password' required/></p>
            <p className='text-right text-xs text-red-500'>&nbsp; {error}</p>
            <div className='text-right text-lg'>
            <input type='submit' className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"/><br/>
            <span className='text-sm'>
          <input className='py-2 px-4' type="reset"/>
          </span>
            </div>
        </form>
        </div>
       
    </div>
    </div>
  )
}

export default Propose
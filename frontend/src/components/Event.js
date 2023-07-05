import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import Layout from './Layout';
import { useNavigate } from 'react-router-dom';
import useAuth from "../hooks/useAuth";

const Event = () => {
    const emptyChange={
      "channel":null,
      "start":null,
      "text":null
      }
    const {auth, setAuth} = useAuth()
    const {id} = useParams()
    const [event, setEvent] = useState({})
    const [newEvent, setNewEvent] = useState({})
    const [error, setError] = useState("")
    
    let navigate = useNavigate();
    
    const onChange = (e) => {
      setNewEvent({...newEvent, [e.target.name]: e.target.value})
    }

    function handleDelete(e) {
        e.preventDefault()
        // fetch(`http://rascal.serverpit.com:8000/event/${id}`, {
        fetch(`https://famcaldeta-1-d3105664.deta.app/events/event/${id}`, {
        method:"DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization : `Bearer ${auth.token}`,
        }
    })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      navigate("/", {replace:true});
    })
    }
    const handleUpdate = async(e)=>{
      if (e.target.form.checkValidity()){
        e.preventDefault()
        const timeout = 8000;
        const controller = new AbortController();
        const id2 = setTimeout(() => controller.abort(), timeout);
        try {
        //const res = await fetch('http://rascal.serverpit.com:8000/event/'+id, {
        const res = await fetch('https://famcaldeta-1-d3105664.deta.app/events/event/'+id, {
          method:"PATCH",
          signal:controller.signal,
          headers: {
              "Content-Type": "application/json",
              Authorization : `Bearer ${auth.token}`,
            },
          body: JSON.stringify(newEvent)
          })
        const data = await res.json()
        navigate("/")
        } catch (error) {
          if (error.name==='AbortError'){
            setError(['Possible Timeout'])
        } else {
            setError([error.message])
        }
        }
      } 
      }

    const handleReset = (e) =>{
      setNewEvent(event)
      navigate('/')
      }
      

    const getEvent = async()=>{
      const timeout = 8000;
      const controller = new AbortController();
      const id2 = setTimeout(() => controller.abort(), timeout);
      try {
          const res = await fetch('https://famcaldeta-1-d3105664.deta.app/events/event/'+id, {
            signal: controller.signal,
            method:"GET",
            headers: {
                "Content-Type": "application/json",
                Authorization : `Bearer ${auth.token}`,
            }
          })
          const data = await res.json()
          if (!res.ok){
            let errArray = data.detail.map(e1=>{return `${e1.loc[1]}- ${e1.msg}`});
            setError(errArray);
          } else {
            setError([])
            setEvent(data)
            setNewEvent(JSON.parse(JSON.stringify(data)));
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

    useEffect(()=>{
      getEvent()
    },[])

  return (
    <div className="bg-stone-200 w-screen h-screen">
      <div className='App max-w-6xl  mx-auto bg-aubergine p-8'>
          <div>
          <span className='text-xl font-bold'>
            selected event
            </span>
            <p>Author: {event.author}</p>
            <form>
            <p>Channel:  <select value={newEvent.channel} id="channel" name="channel" label="channel" placeholder="channel" onChange={onChange} required>  
                          <option value="Nora">Nora</option>
                          <option value="Livia">Livia</option>
                          <option value="Martina">Martina</option>
                          <option value="Hannes">Hannes</option>
                      </select></p>
            <p>Startzeit:  <input value={newEvent.start} type="datetime-local" id="start" name="start" label="start" placeholder="start" onChange={onChange} size="40" required/></p>
            <p>Text:  <input value={newEvent.text} type='text' id="text" name="text" label="text" placeholder="text" onChange={onChange} size="40" required minlength="3"/></p>
            <div className='text-red-500'>&nbsp; {error && <ul>
                {error && error.map(
                    (el, index) => (<li key={index}>{el}</li>)
                )}
            </ul>} </div>
            <button type="submit" class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" onClick={handleUpdate}>update event</button>
            <button class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" onClick={handleDelete}>delete event</button>
            <span className='text-sm'>
                <button className='py-2 px-4' type='reset' onClick={handleReset}>Reset</button></span>
                </form>
          </div>
      </div>
    </div>
  )
}

export default Event
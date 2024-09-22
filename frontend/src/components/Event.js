import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import useAuth from "../hooks/useAuth";

const Event = () => {
    const eventTemplate = {
      author: '',
      channel:'',
      start: new Date(),
      text:''
    }
    const {auth} = useAuth()
    const {id} = useParams()
    const [event, setEvent] = useState(eventTemplate)
    const [newEvent, setNewEvent] = useState(eventTemplate)
    const [error, setError] = useState("")
    
    let navigate = useNavigate();
    
    const onChange = (e) => {
      setNewEvent({...newEvent, [e.target.name]: e.target.value})
    }

    function handleDelete(e) {
        e.preventDefault()
        fetch(`${process.env.REACT_APP_BACKEND_URL}/events/event/${id}`, {
        method:"DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization : `Bearer ${auth.token}`,
        }
    })
    .then((response) => response.json())
    .then(navigate("/", {replace:true}))
    }
    const handleUpdate = async(e)=>{
      if (e.target.form.checkValidity()){
        e.preventDefault()
        var event = {...newEvent}
        event['start'] = new Date(event.start).toISOString()
        const timeout = 8000;
        const controller = new AbortController();
        setTimeout(() => controller.abort(), timeout);
        try {
        await fetch(process.env.REACT_APP_BACKEND_URL + "/events/event/"+id, {
          method:"PATCH",
          signal:controller.signal,
          headers: {
              "Content-Type": "application/json",
              Authorization : `Bearer ${auth.token}`,
            },
          body: JSON.stringify(event)
          })
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
          const res = await fetch(process.env.REACT_APP_BACKEND_URL + "/events/event/"+id, {
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
            setError([]);
            setEvent(data);
            var date = new Date(data.start);
            date.setMinutes(date.getMinutes()-date.getTimezoneOffset()*2)
            data.start=(date.toISOString().slice(0,16));
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
      <div className='bg-aubergine p-8'>
          <div>
          <span className='text-xl font-bold'>
            selected event
            </span>
            <p>Author: {event.author}</p>
            <form>
            <p>Channel:<select value={newEvent.channel} id="channel" name="channel" label="channel" placeholder="channel" onChange={onChange} required>  
                {auth['members'].map(
                            (entry,i)=><option value={entry} key={`member${i}`}>{entry}</option>
                        )}    
                      </select></p>
            <p>Startzeit:  <input value={newEvent.start} type="datetime-local" id="start" name="start" label="start" placeholder="start" onChange={onChange} size="40" required/></p>
            <p>Text:  <input value={newEvent.text} type='text' id="text" name="text" label="text" placeholder="text" onChange={onChange} size="40" required minLength="3"/></p>
            <div className='text-red-500'>&nbsp; {error && <ul>
                {error && error.map(
                    (el, index) => (<li key={index}>{el}</li>)
                )}
            </ul>} </div>
            <button type="submit" className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" onClick={handleUpdate}>update event</button>
            <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" onClick={handleDelete}>delete event</button>
            <span className='text-sm'>
                <button className='py-2 px-4' type='reset' onClick={handleReset}>Reset</button></span>
                </form>
          </div>
      </div>
  )
}

export default Event
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth';

const NewEvent = () => {
    const {auth} = useAuth()
    const navigate = useNavigate();
    var date = new Date();
    date.setMinutes(date.getMinutes()-date.getTimezoneOffset())

    const emptyEvent={
        "channel":`${auth.username}`,
        "start":date.toISOString().slice(0,16),
        "text":""
    }
    console.log(emptyEvent.start)

    const [newEvent, setNewEvent] = useState(emptyEvent)
    const [error, setError] = useState([])

    const handleSubmit = (e)=>{
        var textField = document.getElementById('text')
        var datePicker = document.getElementById('start')
        if (textField.checkValidity() && datePicker.checkValidity()){
            e.preventDefault()
            addEvent(newEvent)
        }
    }
    const onChange = (e) =>{
        setNewEvent({...newEvent, [e.target.name]: e.target.value})
        console.log(newEvent)
    }
    const handleReset = (e) =>{
        setNewEvent(emptyEvent)
        navigate('/')
    }
    const addEvent = async (newEvent)=>{
        var event = {...newEvent}
        event['start'] = new Date(event.start).toISOString()
        const timeout = 8000;
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        console.log(event)
        try {
                const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/events/", {
                    signal: controller.signal,
                    method: "POST",
                    headers:{
                        'Content-Type':'application/json',
                        Authorization : `Bearer ${auth.token}`,

                    },
                    body:JSON.stringify(event)
                    })
                    const data = await response.json()

                    if (!response.ok){
                        let errArray = data.detail.map(el=>{
                            return `${el.loc[1]} - ${el.msg}`
                        })
                        setError(errArray)
                    } else {
                        setError([])
                        navigate('/')
                    }

            } catch (error) {
                if (error.name==='AbortError'){
                        setError(['Possible Timeout'])
                    } else {
                        setError([error.message])
                    }
                };
            clearTimeout(id);
             }
        
    
  return (

    <div className='bg-aubergine p-8'>
        <div>
            <h1 className='text-lg font-bold'>Neues Ereignis</h1>
        </div>
        <div className='text-red-500'>&nbsp; {error && <ul>
                {error && error.map(
                    (el, index) => (<li key={index}>{el}</li>)
                )}
            </ul>} </div>
        <div className='flex'>
            <form>
                <select value={newEvent.channel} id="channel" name="channel" label="channel" placeholder="channel" onChange={onChange} required>
                    {auth['members'].map(
                        (entry)=><option value={entry}>{entry}</option>
                    )}    
                </select>
                <p>&nbsp;</p>
                <div>Start: <input value={newEvent.start} className='w-full' type="datetime-local" id="start" name="start" label="start" placeholder="start" onChange={onChange} required/></div>
                <p>&nbsp;</p>
                <div>Text: &nbsp;<input className='w-full' type="text" id="text" name="text" label="text" placeholder="text" onChange={onChange} minLength="3" required/></div>
                <p>&nbsp;</p>
                <div className='text-right text-lg'><button className='bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded' type='submit' onClick={handleSubmit}>Einfügen</button><br/>
                <span className='text-sm'>
                <button className='py-2 px-4' type='reset' onClick={handleReset}>Reset</button></span>
                </div>
                
            </form>
        </div>
    </div>
  )
}

export default NewEvent
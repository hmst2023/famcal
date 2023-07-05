import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth';
var date = new Date();
var correctedDate = new Date(date)
correctedDate.setMinutes(date.getMinutes()-date.getTimezoneOffset()) 

const NewEvent = () => {
    const {auth, setAuth} = useAuth()
    const navigate=useNavigate();

    const emptyEvent={
        "timestamp:":"now",
        "channel":`${auth.username}`,
        "author":"n/a",
        "start":`${correctedDate.toISOString().slice(0,16)}`,
        "end": "",
        "text":""
    }
    const [newEvent, setNewEvent] = useState(emptyEvent)
    const [error, setError] = useState([])

    const handleSubmit = (e)=>{
        var textField = document.getElementById('text')
        var datePicker = document.getElementById('start')
        if (textField.checkValidity() && datePicker.checkValidity()){
            newEvent.end = newEvent.start
            newEvent.timestamp = newEvent.start
            e.preventDefault()
            addEvent(newEvent)
        }
    }
    const onChange = (e) =>{
        setNewEvent({...newEvent, [e.target.name]: e.target.value})
    }
    const handleReset = (e) =>{
        setNewEvent(emptyEvent)
        navigate('/')
    }
    const addEvent = async (newEvent)=>{
        const timeout = 8000;
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        try {
                const response = await fetch("https://famcaldeta-1-d3105664.deta.app/events/", {
                    signal: controller.signal,
                    method: "POST",
                    headers:{
                        'Content-Type':'application/json',
                        Authorization : `Bearer ${auth.token}`,

                    },
                    body:JSON.stringify(newEvent)
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
        // const response = await fetch("http://rascal.serverpit.com:8000/", {
        
    
  return (
    <div className="bg-stone-200 w-screen h-screen">
    <div className='App max-w-6xl  mx-auto bg-aubergine p-8'>
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
                    <option value="Nora">Nora</option>
                    <option value="Livia">Livia</option>
                    <option value="Martina">Martina</option>
                    <option value="Hannes">Hannes</option>
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
    </div>
  )
}

export default NewEvent
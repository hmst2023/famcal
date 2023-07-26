import * as React from "react";
import { useState, useEffect } from "react";
import DateCard from "./DateCard";
import Cards from "./Cards";
import useAuth from "../hooks/useAuth";

function DateList() {
  const {auth} = useAuth();
  const [msgs, setMsgs] = useState([]);

  let actual_year = 0;
  let actual_month = -1;
  const months =['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September','Oktober','November', 'Dezember'];

  // const arr = [<div className='grid grid-cols-1'/>,<div className='grid grid-cols-2'/>,<div className='grid grid-cols-3'/>,<div className='grid grid-cols-4'/>,<div className='grid grid-cols-5'/>,<div className='grid grid-cols-6'/>,<div className='grid grid-cols-7'/>,<div className='grid grid-cols-8'/>,<div className='grid grid-cols-9'/>]
  // const spanArr =[<div className="col-span-1">, <div className="col-span-2">,<div className="col-span-3">,<div className="col-span-4">,<div className="col-span-5"><div className="col-span-6">,<div className="col-span-7">,<div className="col-span-8">]
  // arr is necessary for tailwinds classnames precheck works even as comment
  const yearCheck = e => {
    if (actual_year < e) {
      actual_year=e;
      actual_month=-1;
      return <div className="text-right text-3xl text-fuchsia-900 px-8">{e}</div>;
    }
  }
  const monthCheck = (e) => {
    if (actual_month < e) {
      actual_month=e;
      return (
        <div>
          <div className="h-5"></div>
          <div className="h-20 bg-aubergine text-right text-lg px-8">{months[e]}</div>
          <div className={`px-5 text-center bg-aubergine grid grid-cols-${auth['members'].length+1}`}>
        
                            
                          <div>{null}</div>
                          {auth['members'].map((e1, i)=>{
                              return<div className={`text-base md:text-xl ${ i%2===0 ? 'text-stone-500' : 'text-fuchsia-900'}`}> {e1}</div>
                         })}
            
          </div>
          
      </div>
      );
    }
  }

  useEffect(() => {
    fetch(process.env.REACT_APP_BACKEND_URL + "/events/", {
      method:"GET",
      headers: {
          "Content-Type": "application/json",
          Authorization : `Bearer ${auth['token']}`,
      }
  })

      .then(response=>response.json())
      .then(json=>setMsgs(json))
  }, [auth])
  return (
    <div className="bg-stone-200">
    <div className="max-w-6xl mx-auto">
     {msgs.map((e1=>{
      return(
        <div>
          <div>
            {yearCheck(new Date(e1.date).getFullYear())}
            {monthCheck(new Date(e1.date).getMonth())}
          </div>
          <div className={`px-5 bg-aubergine grid grid-cols-${auth['members'].length+1}`}>
            <div><DateCard date={e1.date}/></div>
            <div className={`col-span-${auth['members'].length}`}><Cards cards={e1.cards}/></div>
          </div>
        </div>
      )
     }))}
   </div>
   </div>
  );
}

export default DateList;

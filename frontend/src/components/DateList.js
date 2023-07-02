import * as React from "react";
import Header from "./Header";
import { useState, useEffect } from "react";
import DateCard from "./DateCard";
import Cards from "./Cards";
import useAuth from "../hooks/useAuth";

function DateList() {
  const {auth, setAuth} = useAuth()
  let hello = 2
  let actual_year = null
  let actual_month = -1
  const months =['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September','Oktober','November', 'Dezember']

  const yearCheck = e => {
    if (actual_year < e) {
      actual_year=e;
      actual_month=-1;
      return (<div className="text-right text-3xl text-fuchsia-900 px-8">{e}</div>);
    }
  }
  const monthCheck = e => {
    if (actual_month < e) {
      actual_month=e;
      return (
        <div>
          <div className="h-5"></div>
          <div className="h-20 bg-aubergine text-right text-lg px-8">{months[e]}</div>
          <div className="grid grid-cols-5 px-5 text-center bg-aubergine">
                          <div>{null} </div>
                          <div className="text-base md:text-xl text-stone-500"> Nora</div>
                          <div className="text-base md:text-xl text-fuchsia-900">Livia</div>
                          <div className="text-base md:text-xl text-stone-500">Martina</div>
                          <div className="text-base md:text-xl text-fuchsia-900">Hannes</div>
          </div>
      </div>
      );
    }
  }
  let [msgs, setMsgs] = useState([])

  useEffect(() => {
    //fetch('http://192.168.1.4:8000/events/', {
    fetch('http://rascal.serverpit.com:8000/events/', {
      method:"GET",
      headers: {
          "Content-Type": "application/json",
          Authorization : `Bearer ${auth.token}`,
      }
  })

      .then(response=>response.json())
      .then(json=>setMsgs(json))
  }, [])
  return (
  /* test_date = {"date":jetzt.date(), "cards": [{"channel": 'nora',"items": ["text", jetzt.time()], "_id": "60cd778664dc9f75f4aadec8"}]}   */
    <div className="bg-stone-200">
    <div className="max-w-6xl mx-auto">
     {msgs.map((e1=>{
      return(
        <div>
          <div>
            {yearCheck(new Date(e1.date).getFullYear())}
            {monthCheck(new Date(e1.date).getMonth())}
          </div>
          <div className="grid grid-cols-5 px-5 bg-aubergine">
            <div><DateCard date={e1.date}/></div>
            <div className="col-span-4"><Cards cards={e1.cards}/></div>
          </div>
        </div>
      )
     }))}
   </div>
   </div>
  );
}

export default DateList;

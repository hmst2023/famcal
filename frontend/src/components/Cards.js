import React from 'react'
import ColCards from './ColCards'

const Cards = (props) => {
  //console.log(temp)

  return (
    <div className='grid grid-cols-4'>
       <ColCards cards={props.cards.filter(arr=> arr["channel"]==="Nora")} name="Nora" cname="box-content w-100 bg-stone-300 shadow p-1 m-1 rounded mb-1 md:p-3 md:m-2 rounded md:mb-2"/>
       <ColCards cards={props.cards.filter(arr=> arr["channel"]==="Livia")} name="Livia" cname="box-content w-100 bg-fuchsia-200 shadow p-1 m-1 rounded mb-1 md:p-3 md:m-2 rounded md:mb-2"/>
       <ColCards cards={props.cards.filter(arr=> arr["channel"]==="Martina")} name="Martina" cname="box-content w-100 bg-stone-300 shadow p-1 m-1 rounded mb-1 md:p-3 md:m-2 rounded md:mb-2"/>
       <ColCards cards={props.cards.filter(arr=> arr["channel"]==="Hannes")} name="Hannes" cname="box-content w-100 bg-fuchsia-200 shadow p-1 m-1 rounded mb-1 md:p-3 md:m-2 rounded md:mb-2"/>
    </div>
  )
}

export default Cards
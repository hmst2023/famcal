import React from 'react'
import { useContext } from "react";
import ColCards from './ColCards'
import FamContext from "../context/FamProvider";

const Cards = (props) => {
  // const arr = [<div className='grid grid-cols-1'/>,<div className='grid grid-cols-2'/>,<div className='grid grid-cols-3'/>,<div className='grid grid-cols-4'/>,<div className='grid grid-cols-5'/>,<div className='grid grid-cols-6'/>,<div className='grid grid-cols-7'/>,]
  const {fam} = useContext(FamContext);

  return (
      <div className={`grid grid-cols-${fam.length}`}>
      {fam.map((e1, i)=>{
                             return<ColCards cards={props.cards.filter(arr=> arr["channel"]===e1)} name={e1} cname={`${i%2===0 ? "bg-stone-300": "bg-fuchsia-200"} p-1 m-1 mb-1 rounded md:p-3 md:mb-2` }/>
                        })}
      </div>


  )
}

export default Cards
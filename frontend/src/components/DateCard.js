import React from 'react'

const DateCard = (props) => {
  function getDayOfWeek(date) {
    const dayOfWeek = new Date(date).getDay();    
    return isNaN(dayOfWeek) ? null : 
      ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'][dayOfWeek];
  }
  
  return (
    
    <div className="bg-zinc-400 shadow hyphens-auto p-2 md:p-3 rounded m-1 md:m-2">
        <div className='text-center text-xs md:text-base'>{getDayOfWeek(props.date)}, {props.date.slice(8,10)}.{props.date.slice(5,7)}</div>

    </div>
  )
}

export default DateCard
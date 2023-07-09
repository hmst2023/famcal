import React from 'react'
import { Link } from 'react-router-dom'

const EventCard = (props) => {
  return (
    <div className={props.cname}>
      <p className='text-xs hyphens-auto font-semibold md:text-base'><Link to={"/event/"+props.id}> {props.text}</Link></p>
      <p className='mt-1 text-right text-xs md:text-base'>{props.time.slice(0,5)}</p>
        
        
    </div>
  )
}

export default EventCard
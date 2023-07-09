import React from 'react'
import EventCard from './EventCard'

const ColCards = (props) => {
  return (
    <div>
      {props.cards.map((e1=>{
      return(
        <div key={e1.items[1]}>
                <EventCard text={e1.items[0]} time={e1.items[1]} id={e1._id} cname={props.cname}/>
       </div>
      )
     }))}

    </div>
  )
}

export default ColCards
import React from 'react'

const FormInput = (props) => {
    const {label, placeholder,type, onChange, name} = props
  return (
    <div>
        <label>{label}</label>
        <input placeholder={placeholder} type={type} name={name} onChange={onchange}/>
    </div>
  )
}

export default FormInput
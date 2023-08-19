import React from 'react'
import { Link } from 'react-router-dom'

const Mailto = ({ email, children }) => {
  return <a href={`mailto:${email}`}>{children}</a>;
};

const Footer = () => {
  return (
    <div className='bg-lilac px-8 py-3 text-right text-fuchsia-900 text-xs'><Link to="/impressum">Impressum</Link> | <Link to="/datenschutz">Datenschutz</Link> | <Link to="/termsofuse">Nutzungsbedingungen</Link> | <Mailto email="mailer@stucki.cc">Kontakt</Mailto></div>
  )
}

export default Footer
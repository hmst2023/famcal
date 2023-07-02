import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './components/Login'
import NewEvent from './components/NewEvent'
import DateList from './components/DateList'
import RequiredAuthentication from './components/RequiredAuthentication'
import Event from './components/Event'


function App() {
  return (
    <Routes>
        <Route path="/" element={<Layout/>}>
            <Route element={<RequiredAuthentication />}>
              <Route path="/" element={<DateList/>}/>
              <Route path="new" element={<NewEvent/>}/>
              <Route path="event/:id" element={<Event/>}/>
            </Route>
            <Route path="login" element={<Login/>}/>
        </Route>
    </Routes>
  );
}

export default App
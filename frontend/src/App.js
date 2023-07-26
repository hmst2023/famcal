import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './components/Login'
import NewEvent from './components/NewEvent'
import DateList from './components/DateList'
import RequiredAuthentication from './components/RequiredAuthentication'
import Event from './components/Event'
import Setup from './components/Setup'
import Propose from './components/Propose'
import Signup from './components/Signup'


function App() {
  return (
    <Routes>
        <Route path="/" element={<Layout/>}>
            <Route element={<RequiredAuthentication />}>
              <Route path="/" element={<DateList/>}/>
              <Route path="new" element={<NewEvent/>}/>
              <Route path="event/:id" element={<Event/>}/>
              <Route path="/setup" element={<Setup/>}/>
            </Route>
            <Route path="login" element={<Login/>}/>
            <Route path="signup" element={<Signup/>}/>
            <Route path="proposal/:link" element={<Propose/>}/>
        </Route>
    </Routes>
  );
}

export default App
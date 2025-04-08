import { useState } from 'react'

import LandingPage from './pages/LandingPage'
import { Routes, Route } from "react-router-dom";
import Navbar from './components/Navbar';
const App = () => {
  return (
    <div>
     
    <Navbar/>
    <Routes>
      <Route path="/" element={<LandingPage/>}/>
      
    </Routes>
    </div>
  );
};

export default App;

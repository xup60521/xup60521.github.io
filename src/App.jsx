import './App.css'
import { HashRouter, NavLink, Route, Routes } from "react-router-dom"
import {AiOutlineMenu, AiOutlineClose, AiOutlineSearch} from "react-icons/ai"
import { useEffect, useReducer, useRef, useState } from "react"
import Home from "./component/home"
import BlogRoot from './component/blog/blogroot'
import Contact from "./component/contact"
import SearchBox from "./component/searchbox"
import MyWork from "./component/myWork"

const App = () => {

  


  const [showMenu, setShowMenu] = useState(false);
  const toggleShowMenu = () => {
    setShowMenu((prev)=>{return (prev==true ? false : true)});
    if (showMenu&searchMode) {
      setTimeout(() => {
        setSearchMode(false);
      }, 250);
    } else {
      setSearchMode(false);
    }
  }
  const [searchMode, setSearchMode] = useState(false);
  const [searchContent, setSearchContent] = useState("");

  return (
    <HashRouter>
      <div className="App">
        <div className="top-bar">
          <button className={"search top-bar "+(showMenu==true ? "showMenu " : " ")} style={{display: (showMenu==true & searchMode==true ? "none" : "")}} onClick={()=>{(showMenu==false ? toggleShowMenu() : ""); setSearchMode(true)}} ><AiOutlineSearch /></button>
          <button className={"menu top-bar "+(showMenu==true ? "showMenu" : "")} onClick={toggleShowMenu}>{(showMenu ? <AiOutlineClose /> : <AiOutlineMenu />)}</button>
        </div>
        <aside className={(showMenu==true ? "showMenu" : "")}>
          {(searchMode==true ? <SearchBox  setShowMenu={setShowMenu} setSearchContent={setSearchContent} /> : <div className="nav">
            <NavLink to="/" onClick={toggleShowMenu} >HOME</NavLink>
            <NavLink to="/blogs/" onClick={toggleShowMenu} >BLOGS</NavLink>
            <NavLink to="/mywork" onClick={toggleShowMenu} >MY WORKS</NavLink>
            <NavLink to="/contact" onClick={toggleShowMenu} >CONTACT</NavLink>
          </div>)}
          
        </aside>
        <main className="main">
          
            <Routes>
              <Route exact path="/" element={<Home />} />
              <Route exact path="/blogs//*" element={<BlogRoot />} />
              <Route exact path="/contact/" element={<Contact />} />
              <Route exact path="/mywork/" element={<MyWork />} />
              
            </Routes>
          
        </main>
      </div>  
    </HashRouter>
      
    
    
    
  )
}

export default App

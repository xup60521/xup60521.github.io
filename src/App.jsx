import blogs from "./posts/db.json"
import './App.css'
import { HashRouter, NavLink, Route, Routes } from "react-router-dom"
import {AiOutlineMenu, AiOutlineClose, AiOutlineSearch} from "react-icons/ai"
import { useState } from "react"
import Home from "./component/home"
import Blog from "./component/blog"
import Contact from "./component/contact"
import SearchBox from "./component/searchbox"
import MyWork from "./component/myWork"
import HTMLReactParser from "html-react-parser";
import { Base64 } from "js-base64"

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

  return (
    <HashRouter>
      <div className="App">
        <div className="top-bar">
          <button className={"search top-bar "+(showMenu==true ? "showMenu " : " ")} style={{display: (showMenu==true & searchMode==true ? "none" : "")}} onClick={()=>{(showMenu==false ? toggleShowMenu() : ""); setSearchMode(true)}} ><AiOutlineSearch /></button>
          <button className={"menu top-bar "+(showMenu==true ? "showMenu" : "")} onClick={toggleShowMenu}>{(showMenu ? <AiOutlineClose /> : <AiOutlineMenu />)}</button>
        </div>
        <aside className={(showMenu==true ? "showMenu" : "")}>
          {(searchMode==true ? <SearchBox  setShowMenu={setShowMenu} /> : <div className="nav">
            <NavLink to="/" onClick={toggleShowMenu} >HOME</NavLink>
            <NavLink to="/blogs/" onClick={toggleShowMenu} >BLOGS</NavLink>
            <NavLink to="/mywork" onClick={toggleShowMenu} >MY WORKS</NavLink>
            <NavLink to="/contact" onClick={toggleShowMenu} >CONTACT</NavLink>
          </div>)}
          
        </aside>
        <main class="main">
          <div className="content">
            <Routes>
              <Route exact path="/" element={<Home />} />
              <Route exact path="/blogs/" element={<Blog />} />
              <Route exact path="/contact/" element={<Contact />} />
              <Route exact path="/mywork/" element={<MyWork />} />
              {blogs.posts.map((d)=>{
                return <Route exact path={`/blogs/${d.title}`} element={HTMLReactParser(Base64.decode(d.Base64Content))} />
              })}
            </Routes>
          </div>
        </main>
      </div>  
    </HashRouter>
      
    
    
    
  )
}

export default App

import Link from "next/link";
import { useRef, useState } from "react";
import SearchBox from "./searchbox";
import {AiOutlineMenu, AiOutlineClose, AiOutlineSearch} from "react-icons/ai"

const HomeLayout = ({ children }) => {

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
        <div className="App">
          <div className="top-bar">
            <button className={"search top-bar "+(showMenu==true ? "showMenu " : " ")} style={{display: (showMenu==true & searchMode==true ? "none" : "")}} onClick={()=>{(showMenu==false ? toggleShowMenu() : ""); setSearchMode(true)}} ><AiOutlineSearch /></button>
            <button className={"menu top-bar "+(showMenu==true ? "showMenu" : "")} onClick={toggleShowMenu}>{(showMenu ? <AiOutlineClose /> : <AiOutlineMenu />)}</button>
          </div>
          <aside className={(showMenu==true ? "showMenu" : "")}>
            {(searchMode==true ? <SearchBox  setShowMenu={setShowMenu} setSearchContent={setSearchContent} /> : <div className="nav">
              <Link href="/" onClick={toggleShowMenu} >HOME</Link>
              <Link href="/blogs/" onClick={toggleShowMenu} >BLOGS</Link>
              <Link href="/mywork" onClick={toggleShowMenu} >MY WORKS</Link>
              <Link href="/contact" onClick={toggleShowMenu} >CONTACT</Link>
            </div>)}
            
          </aside>
          <main className="main">
            
              {children}
            
          </main>
        </div>  
    )
}

export default HomeLayout
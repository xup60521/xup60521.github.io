import { useRef } from "react";
import { AiOutlineSearch } from "react-icons/ai";

const SearchBox = ({setShowMenu, setSearchContent}) => {

    const searchRef = useRef();

    const handleClickButton = () => {

        const value = searchRef.current.value;
        if (value === "") {
            return;
        }
        setShowMenu((prev)=>{return (prev ? false : true)});
        setSearchContent(value)
        searchRef.current.value = "";
    }

    return (
    <div className="searchbox">
        <input ref={searchRef} type="text" />
        <button id="" onClick={handleClickButton}><AiOutlineSearch /></button>
    </div>
    )
}

export default SearchBox;
const SearchBox = ({setShowMenu}) => {

const handleClickButton = () => {
    setShowMenu((prev)=>{return (prev ? false : true)});
}

    return (
    <div className="searchbox">
        <input type="text" />
        <button onClick={handleClickButton}>搜尋</button>
    </div>
    )
}

export default SearchBox;
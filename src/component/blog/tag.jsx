import { NavLink } from "react-router-dom"

const Tag = ({tag, blogs, tagstate}) => {

    return (
        <div className="blog">
            <h2>{`Tag: ${tag}`}</h2>
            <NavLink to="/blogs/"><button id="resettag">clear</button></NavLink>
            <span id="toptagtab">
                    {tagstate.map((d)=>{
                        return <NavLink id="tag" to={`/blogs/tag="${d}"`}>{d}</NavLink>
                    })}
                </span>
            {blogs.posts.filter((d)=>{return d.tag.includes(tag)}).map((d)=>{
                return (
                    <div className="item">
                        <span>
                            <a id="date">{d.date}</a>
                            {d["tag"].map((t)=> {return <NavLink id="tag" to={`/blogs/tag="${t}"`} >{t}</NavLink>})}
                        </span>
                        <p><NavLink to={`/blogs/${d.uuid}`}>{d.title}</NavLink></p>
                    </div>
                )
            })}
        </div>
    )
}

export default Tag;
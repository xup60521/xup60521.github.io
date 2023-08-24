import { NavLink } from "react-router-dom"

const Tag = ({tag, blogs}) => {

    return (
        <div className="blog">
            <h2>{`Tag: ${tag}`}</h2>
            {blogs.posts.filter((d)=>{return d.tag.includes(tag)}).map((d)=>{
                return (
                    <div className="item">
                        <span>
                            <a id="date">{d.date}</a>
                            {d["tag"].map((t)=> {return <NavLink id="tag" to={`/blogs/tag="${t}"`} >{t}</NavLink>})}
                        </span>
                        <p><NavLink to={`/blogs/${d.title}`}>{d.title}</NavLink></p>
                    </div>
                )
            })}
        </div>
    )
}

export default Tag;
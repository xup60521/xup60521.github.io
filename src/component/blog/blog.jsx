import { NavLink } from "react-router-dom"

const Blog = ({blogs}) => {


    return (
        <div className="blog">
            <h2>BLOGS</h2>
            {blogs.posts.map((d)=>{
                return (
                    <div className="item">
                        <span>
                            <a id="date">{d.date}</a>
                            {d["tag"].map((tag)=> {return <NavLink id="tag" to={`/blogs/tag="${tag}"`}>{tag}</NavLink>})}
                        </span>
                        <p><NavLink to={`/blogs/${d.uuid}`}>{d.title}</NavLink></p>
                    </div>
                )
            })}
        </div>
    )

}

export default Blog;
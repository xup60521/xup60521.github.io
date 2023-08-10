import blogs from "./../posts/db.json"
import { NavLink } from "react-router-dom"

const Blog = () => {


    return (
        <div className="blog">
            {blogs.posts.map((d)=>{
                return (
                    <div className="item">
                        <p><NavLink to={`/blogs/${d.title}`}>{d.title}</NavLink></p>
                    </div>
                )
            })}
        </div>
    )

}

export default Blog;
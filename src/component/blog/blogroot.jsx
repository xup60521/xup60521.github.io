import Blog from "./blog"
import { useState, useEffect } from "react";
import { Route, Routes } from "react-router";
import Tag from "./tag";
import BlogPage from "./blogpage";
import Draggable ,{ DraggableCore } from "react-draggable";
import { NavLink } from "react-router-dom";
import {IoIosMenu} from "react-icons/io"

const BlogRoot = () => {

    const [blogs, setblogs] = useState({"posts": []});
    const [tagstate, settagstate] = useState([]);
    let tags = new Set();

    const fetchdata = () => {
    // fetch("https://raw.githubusercontent.com/xup60521/xup60521.github.io/main/public/db.json").then((res)=>res.json()).then((res)=>{setblogs(res)});
    fetch("https://raw.githubusercontent.com/xup60521/xup60521.github.io/repo/db.json").then((res)=>res.json()).then((res)=>{
        setblogs(res);
        res.posts.map((d)=>{
        tags = new Set([...tags, ...(d.tag)])
        })
        settagstate(Array.from(tags))
    });
    }

    useEffect(()=>{
        fetchdata();
    },[])

    return (
        <>
            <Draggable
                positionOffset={{x: "10%", y: "500%"}}
                handle="strong"
            >
                <div className="dragtab">
                    <strong><p><IoIosMenu preserveAspectRatio="none" /></p></strong>
                    <span id="tagtab">
                        {tagstate.map((d)=>{
                            return <NavLink id="tag" to={`/blogs/tag="${d}"`}>{d}</NavLink>
                        })}
                    </span>
                </div>
                
            </Draggable>
        <div className="content">
            <Routes>
                <Route exact path="/" element={<Blog blogs={blogs} tagstate={tagstate} />} />
                {blogs.posts.map((d)=>{
                    return <Route exact path={`/${d.uuid}`} element={<BlogPage tag={d.tag} base64content={d.Base64Content} key={d.uuid} />} />
                })}
                {tagstate.map((d)=>{
                    return <Route exact path={`/tag="${d}"`} element={<Tag tag={d} blogs={blogs} tagstate={tagstate} />} />
                })}
            </Routes>
            
        </div>
    </>
    )
}

export default BlogRoot
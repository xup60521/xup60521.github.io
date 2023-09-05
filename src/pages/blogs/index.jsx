import HomeLayout from "../components/layout";
import { useState, useEffect } from "react";
import Draggable ,{ DraggableCore } from "react-draggable";
import {IoIosMenu} from "react-icons/io"
import Link from "next/link";

const Blogs = () => {

    const [blogs, setblogs] = useState({"posts": []});
    const [tagstate, settagstate] = useState([]);
    let tags = new Set();

    const fetchdata = () => {
    // fetch("https://raw.githubusercontent.com/xup60521/xup60521.github.io/main/public/db.json").then((res)=>res.json()).then((res)=>{setblogs(res)});
        fetch("https://raw.githubusercontent.com/xup60521/xup60521.github.io/repo/db.json").then((res)=>res.json()).then((res)=>{
            setblogs(res);
            localStorage.setItem("blogcache", JSON.stringify({
                "time": Date.now(),
                "posts": res.posts
            }))
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
        
        <HomeLayout>
            <Draggable
                positionOffset={{x: "10%", y: "500%"}}
                handle="strong"
            >
                <div className="dragtab">
                    <strong><p><IoIosMenu preserveAspectRatio="none" /></p></strong>
                    <span id="tagtab">
                        {tagstate.map((d)=>{
                            return <Link id="tag" href={`/blogs/tag/${d}`}>{d}</Link>
                        })}
                    </span>
                </div>
                
            </Draggable>
            <div className="content">
                <div className="blog">
                    <h2>BLOGS</h2>
                    <span id="toptagtab">
                        {tagstate.map((d)=>{
                            return <Link id="tag" href={`/blogs/tag/${d}`}>{d}</Link>
                        })}
                    </span>
                    {blogs.posts.map((d)=>{
                        return (
                            <div className="item">
                                <span>
                                    <a id="date">{d.date}</a>
                                    {d["tag"].map((tag)=> {return <Link id="tag" href={`/blogs/tag/${tag}`}>{tag}</Link>})}
                                </span>
                                <p><Link href={`/blogs/${d.title}`}>{d.title}</Link></p>
                            </div>
                        )
                    })}
                </div> 
            </div>
        </HomeLayout>
    
    )
}

export default Blogs
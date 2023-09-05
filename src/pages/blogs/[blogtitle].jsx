import HomeLayout from "../components/layout"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Link from "next/link"
import HTMLReactParser from "html-react-parser";
import { Base64 } from "js-base64";

const BlogPage = () => {

    const router = useRouter()
    const blogtitle = router.query.blogtitle
    const [blogs, setblogs] = useState([blogtitle, "",[] , "", ""]);

    const template = {
        "title": blogtitle,
        "date": "",
        "tag": [],
        "uuid": "",
        "Base64Content": ""
    }

    useEffect(()=> {
        if(!router.isReady) return;
        if (JSON.parse(localStorage.getItem("blogcache")) != undefined) {
            if ((JSON.parse(localStorage.getItem("blogcache")).time - Date.now()) > 50) {
                fetch("https://raw.githubusercontent.com/xup60521/xup60521.github.io/repo/db.json").then((res)=>res.json()).then((res)=>{
                    setblogs((prev)=>{
                        const {title, date, tag, uuid, Base64Content} = res.posts.filter((item)=>{return item["title"]==blogtitle})[0]
                        prev[0] = title;
                        prev[1] = date;
                        prev[2] = tag;
                        prev[3] = uuid;
                        prev[4] = Base64Content;
                        return [...prev]
                    });
                    localStorage.setItem("blogcache", JSON.stringify({
                        "time": Date.now(),
                        "posts": res.posts
                    })) 
                                   
                });
            } else {
                console.log(JSON.parse(localStorage.getItem("blogcache")).posts.filter((item)=>{return item.title == blogtitle})[0]);
                setblogs((prev)=>{
                    const {title, date, tag, uuid, Base64Content} = JSON.parse(localStorage.getItem("blogcache")).posts.filter((item)=>{return item.title == blogtitle})[0]
                    prev[0] = title;
                    prev[1] = date;
                    prev[2] = tag;
                    prev[3] = uuid;
                    prev[4] = Base64Content;
                    return [...prev]
                });
            }
        } else {
            fetch("https://raw.githubusercontent.com/xup60521/xup60521.github.io/repo/db.json").then((res)=>res.json()).then((res)=>{
                setblogs((prev)=>{
                    const {title, date, tag, uuid, Base64Content} = res.posts.filter((item)=>{return item["title"]==blogtitle})[0]
                    prev[0] = title;
                    prev[1] = date;
                    prev[2] = tag;
                    prev[3] = uuid;
                    prev[4] = Base64Content;
                    return [...prev]
                });
                localStorage.setItem("blogcache", JSON.stringify({
                    "time": Date.now(),
                    "posts": res.posts
                })) 
                                
            });
        }

    }, [router.isReady])

    

    return (
        <HomeLayout>
            <div className="content">
                <span id="blogpage">
                {blogs[2].map((d)=>{
                    return (
                        <Link id="tag" href={`/blogs/tag/${d}`} >{d}</Link>      
                    )
                })}
                </span>
                {HTMLReactParser(Base64.decode(blogs[4]))}
            </div>
        </HomeLayout>
    )
}

export default BlogPage
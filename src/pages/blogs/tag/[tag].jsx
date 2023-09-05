import HomeLayout from "@/pages/components/layout"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Link from "next/link"

const TagPage = () => {
    const router = useRouter()
    const tag = router.query.tag
    const [blogs, setblogs] = useState({"posts": []})
    const [tagstate, settagstate] = useState([]);
    let tags = new Set();
    
    useEffect(()=>{
        if(!router.isReady) return;
        if (JSON.parse(localStorage.getItem("blogcache")) != undefined) {
            if ((JSON.parse(localStorage.getItem("blogcache")).time - Date.now()) > 50) {
                fetch("https://raw.githubusercontent.com/xup60521/xup60521.github.io/repo/db.json").then((res)=>res.json()).then((res)=>{
                    setblogs((prev)=>{
                        res.posts.map((d)=>{
                            tags = new Set([...tags, ...(d.tag)])
                            })
                            settagstate(Array.from(tags))
                        return {...res}
                    });
                    localStorage.setItem("blogcache", JSON.stringify({
                        "time": Date.now(),
                        "posts": res.posts
                    })) 
                                   
                });
            } else {
                
                setblogs((prev)=>{
                    JSON.parse(localStorage.getItem("blogcache")).posts.map((d)=>{
                        tags = new Set([...tags, ...(d.tag)])
                        })
                        settagstate(Array.from(tags))
                    return {...JSON.parse(localStorage.getItem("blogcache"))}
                });
            }
        } else {
            fetch("https://raw.githubusercontent.com/xup60521/xup60521.github.io/repo/db.json").then((res)=>res.json()).then((res)=>{
                setblogs((prev)=>{
                    res.posts.map((d)=>{
                        tags = new Set([...tags, ...(d.tag)])
                        })
                        settagstate(Array.from(tags))
                    return {...res}
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
                <div className="blog">
                <h2>{`Tag: ${tag}`}</h2>
                <Link href="/blogs/"><button id="resettag">clear</button></Link>
                <span id="toptagtab">
                        {tagstate.map((d)=>{
                            return <Link id="tag" href={`/blogs/tag/${d}`}>{d}</Link>
                        })}
                    </span>
                {blogs.posts.filter((d)=>{return d.tag.includes(tag)}).map((d)=>{
                    return (
                        <div className="item">
                            <span>
                                <a id="date">{d.date}</a>
                                {d["tag"].map((t)=> {return <Link id="tag" href={`/blogs/tag/${t}`} >{t}</Link>})}
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

export default TagPage
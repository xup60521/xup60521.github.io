import { Base64 } from "js-base64";
import { useEffect, useState } from "react";

const MyWork = () => {

    const [works, setworks] = useState({"posts": []})
    
    const fetchdata = () => {
        // fetch("https://raw.githubusercontent.com/xup60521/xup60521.github.io/main/public/db.json").then((res)=>res.json()).then((res)=>{setblogs(res)});
        fetch("https://raw.githubusercontent.com/xup60521/xup60521.github.io/repo/myworks.json").then((res)=>res.json()).then((res)=>{
            setworks(res);
            
        });}

    useEffect(()=>{
        fetchdata()
       
    }, [])

    return (
    <div className="mywork content">
        <h2>My Works</h2>
        <div className="displayworks">
            {works.posts.map((d, i)=>{
                return (
                    <div className="item">
                        <p><a href={Base64.decode(d.base64url)} target="_blank">{d.title}</a></p>
                        <iframe src={Base64.decode(d.base64url)} frameborder="0">
                            <p>{d.title}</p>
                        </iframe>
                    </div>
                )
            })}
        </div>
    </div>
    )
}

export default MyWork;
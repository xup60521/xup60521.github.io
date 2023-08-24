import { Base64 } from "js-base64";
import HTMLReactParser from "html-react-parser";
import { NavLink } from "react-router-dom";

const BlogPage = ({tag, base64content}) => {

    return (
        <>
            <span id="blogpage">
                {tag.map((d)=>{
                    return (
                        <NavLink id="tag" to={`/blogs/tag="${d}"`} >{d}</NavLink>      
                    )
                })}
            </span>
            {HTMLReactParser(Base64.decode(base64content))}
        </>
    )

}

export default BlogPage;
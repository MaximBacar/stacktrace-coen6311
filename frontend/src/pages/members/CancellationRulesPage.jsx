
import {useEffect,useState} from "react";
import api from "@/lib/api";
export default function Page(){
 const [r,setR]=useState("");
 useEffect(()=>{api.get("/coaching/cancellation-rules/").then(res=>setR(res.data.rules));},[]);
 return <div><h1>Rules</h1><p>{r}</p></div>
}


import {useEffect,useState} from "react";
import api from "@/lib/api";

export default function AdminReportPage(){
 const [data,setData]=useState({});
 useEffect(()=>{
  api.get("/coaching/admin/report/").then(res=>setData(res.data));
 },[]);
 return (
  <div>
   <h1>Reports</h1>
   <p>Total:{data.total_sessions}</p>
   <p>Completed:{data.completed}</p>
   <p>Cancelled:{data.cancelled}</p>
   <p>Booked:{data.booked}</p>
   <p>Generated:{data.generated_at}</p>
   <a href="/coaching/admin/report/export/">Download CSV</a>
  </div>
 );
}

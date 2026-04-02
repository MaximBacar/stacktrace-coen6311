
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    const res = await api.get("/users/admin/users/");
    setUsers(res.data);
  };

  const createUser = async () => {
    await api.post("/users/admin/users/create/", form);
    fetchUsers();
  };

  return (
    <div className="p-6">
      <h1>Admin Users</h1>

      <input placeholder="Username" onChange={e=>setForm({...form, username:e.target.value})}/>
      <input placeholder="Email" onChange={e=>setForm({...form, email:e.target.value})}/>
      <input type="password" placeholder="Password" onChange={e=>setForm({...form, password:e.target.value})}/>
      <button onClick={createUser}>Create</button>

      <ul>
        {users.map(u => <li key={u.id}>{u.username} - {u.email}</li>)}
      </ul>
    </div>
  );
}


import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function CalendarPage() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await api.get("/coaching/sessions/upcoming/");
      setSessions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Upcoming Sessions</h1>

      {sessions.length === 0 && <p>No upcoming sessions</p>}

      <ul>
        {sessions.map((s) => (
          <li key={s.id} className="border p-3 mb-2">
            <p><strong>Member:</strong> {s.member}</p>
            <p><strong>Time:</strong> {new Date(s.time).toLocaleString()}</p>
            <p><strong>Status:</strong> {s.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

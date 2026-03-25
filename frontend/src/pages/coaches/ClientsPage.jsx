
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function ClientsPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedMembers();
  }, []);

  const fetchAssignedMembers = async () => {
    try {
      const res = await api.get("/coaching/assigned-members/profiles/");
      setMembers(res.data || []);
    } catch (err) {
      console.error("Failed to load member profiles", err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading member profiles...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Assigned Member Profiles</h1>

      {members.length === 0 ? (
        <p>No assigned members found.</p>
      ) : (
        <div className="grid gap-4">
          {members.map((member) => (
            <div key={member.id} className="border rounded-lg p-4 shadow-sm bg-white">
              <h2 className="text-lg font-semibold mb-2">
                {member.full_name || member.username}
              </h2>
              <p><strong>Username:</strong> {member.username || "N/A"}</p>
              <p><strong>Email:</strong> {member.email || "N/A"}</p>
              <p className="mt-2"><strong>Goals:</strong> {member.goals || "No goals provided."}</p>
              <p className="mt-2"><strong>Restrictions:</strong> {member.restrictions || "No restrictions provided."}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

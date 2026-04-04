
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function GymRulesPage() {
  const [rules, setRules] = useState([]);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await api.get("/coaching/gym-rules/");
      setRules(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gym Rules & Policies</h1>

      {rules.length === 0 ? (
        <p>No rules available.</p>
      ) : (
        <div className="space-y-4">
          {rules.map(rule => (
            <div key={rule.id} className="border p-4 rounded shadow-sm">
              <h2 className="font-semibold">{rule.title}</h2>
              <p>{rule.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

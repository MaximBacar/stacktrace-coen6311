
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function GymCapacityPage() {
  const [capacity, setCapacity] = useState({
    current_count: 0,
    max_capacity: 50,
    is_full: false,
  });
  const [form, setForm] = useState({
    current_count: 0,
    max_capacity: 50,
  });

  useEffect(() => {
    fetchCapacity();
  }, []);

  const fetchCapacity = async () => {
    try {
      const res = await api.get("/coaching/gym-capacity/");
      setCapacity(res.data);
      setForm({
        current_count: res.data.current_count,
        max_capacity: res.data.max_capacity,
      });
    } catch (err) {
      console.error("Failed to load gym capacity", err);
    }
  };

  const updateCapacity = async () => {
    try {
      const res = await api.put("/coaching/gym-capacity/update/", form);
      setCapacity(res.data);
      alert("Gym capacity updated successfully");
    } catch (err) {
      console.error("Failed to update gym capacity", err);
      alert(err?.response?.data?.detail || "Update failed");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gym Real-Time Capacity</h1>

      <div className="border rounded-lg p-4 mb-6 bg-white shadow-sm">
        <p><strong>Current Count:</strong> {capacity.current_count}</p>
        <p><strong>Maximum Capacity:</strong> {capacity.max_capacity}</p>
        <p><strong>Status:</strong> {capacity.is_full ? "Full" : "Safe to enter"}</p>
      </div>

      <div className="border rounded-lg p-4 bg-white shadow-sm max-w-md">
        <h2 className="text-lg font-semibold mb-3">Admin Update Capacity</h2>

        <label className="block mb-2">Current Count</label>
        <input
          type="number"
          value={form.current_count}
          onChange={(e) => setForm({ ...form, current_count: e.target.value })}
          className="border p-2 w-full mb-4"
        />

        <label className="block mb-2">Maximum Capacity</label>
        <input
          type="number"
          value={form.max_capacity}
          onChange={(e) => setForm({ ...form, max_capacity: e.target.value })}
          className="border p-2 w-full mb-4"
        />

        <button
          onClick={updateCapacity}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Capacity
        </button>
      </div>
    </div>
  );
}

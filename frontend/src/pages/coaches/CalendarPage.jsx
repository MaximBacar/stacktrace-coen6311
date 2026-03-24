
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function CalendarPage() {
  const [availability, setAvailability] = useState([]);
  const [newSlot, setNewSlot] = useState("");

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const res = await api.get("/coaching/availability/");
      setAvailability(res.data.availability || []);
    } catch (err) {
      console.error(err);
    }
  };

  const addSlot = () => {
    if (!newSlot) return;
    setAvailability([...availability, newSlot]);
    setNewSlot("");
  };

  const removeSlot = (slot) => {
    setAvailability(availability.filter((s) => s !== slot));
  };

  const saveAvailability = async () => {
    try {
      await api.put("/coaching/availability/update/", {
        availability,
      });
      alert("Availability updated!");
    } catch (err) {
      console.error(err);
      alert("Error saving availability");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Availability</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="datetime-local"
          value={newSlot}
          onChange={(e) => setNewSlot(e.target.value)}
          className="border p-2"
        />
        <button onClick={addSlot} className="bg-blue-500 text-white px-4 py-2">
          Add
        </button>
      </div>

      <ul className="mb-4">
        {availability.map((slot, index) => (
          <li key={index} className="flex justify-between border p-2 mb-2">
            {slot}
            <button onClick={() => removeSlot(slot)} className="text-red-500">
              Remove
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={saveAvailability}
        className="bg-green-500 text-white px-6 py-2"
      >
        Save Availability
      </button>
    </div>
  );
}

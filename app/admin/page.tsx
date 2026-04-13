"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminPage() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/admin/applications")
      .then(res => setData(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="min-h-screen p-10 bg-gradient-to-br from-black via-[#020617] to-[#0f172a] text-white">

      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid gap-4">

        {data.map((item, index) => (
          <div key={index} className="p-6 bg-white/5 border border-white/10 rounded-xl">

            <p><b>Name:</b> {item.fullName}</p>
            <p><b>Father:</b> {item.fatherName}</p>
            <p><b>Email:</b> {item.email}</p>
            <p><b>Nationality:</b> {item.nationality}</p>

          </div>
        ))}

      </div>

    </div>
  );
}
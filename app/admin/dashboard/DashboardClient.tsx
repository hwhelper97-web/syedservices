"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardClient({ messages = [] }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAdmin = localStorage.getItem("admin");

    if (!isAdmin) {
      router.push("/admin/login");
    } else {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    router.push("/admin/login");
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm("Delete this message?");
    if (!confirmDelete) return;

    await fetch("/api/contact/delete", {
      method: "POST",
      body: JSON.stringify({ id }),
    });

    location.reload();
  };

  const handleReply = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  if (loading) return null;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-black via-[#020617] to-[#0f172a] text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-yellow-400">
          Admin Dashboard
        </h1>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 rounded-lg hover:scale-105"
        >
          Logout
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white/5 rounded-xl text-center">
          <p className="text-yellow-400 text-xl font-bold">{messages.length}</p>
          <p className="text-gray-400 text-sm">Messages</p>
        </div>
        <div className="p-4 bg-white/5 rounded-xl text-center">
          <p className="text-yellow-400 text-xl font-bold">Active</p>
          <p className="text-gray-400 text-sm">Status</p>
        </div>
        <div className="p-4 bg-white/5 rounded-xl text-center">
          <p className="text-yellow-400 text-xl font-bold">Admin</p>
          <p className="text-gray-400 text-sm">User</p>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">

          <thead className="bg-white/10 text-yellow-400">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Message</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {messages.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-400">
                  No messages yet
                </td>
              </tr>
            ) : (
              messages.map((m: any) => (
                <tr key={m.id} className="border-t border-white/10">
                  <td className="p-4">{m.name}</td>
                  <td className="p-4">{m.email}</td>
                  <td className="p-4">{m.message}</td>

                  <td className="p-4 flex gap-2">
                    <button
                      onClick={() => handleReply(m.email)}
                      className="px-3 py-1 bg-blue-500 rounded-lg text-xs"
                    >
                      Reply
                    </button>

                    <button
                      onClick={() => handleDelete(m.id)}
                      className="px-3 py-1 bg-red-500 rounded-lg text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
}
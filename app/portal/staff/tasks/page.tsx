"use client";

import { useState, useEffect } from "react";
import {
  FiCheckSquare, FiLoader, FiClock, FiAlertCircle,
  FiCircle, FiCheckCircle, FiFlag, FiCalendar
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const PRIORITY_STYLES: Record<string, string> = {
  HIGH:   "bg-red-500/10 text-red-400 border-red-500/20",
  MEDIUM: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  LOW:    "bg-green-500/10 text-green-400 border-green-500/20",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING:     "bg-slate-500/10 text-slate-400 border-slate-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  DONE:        "bg-green-500/10 text-green-400 border-green-500/20",
};

export default function StaffTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/staff/tasks");
      const data = await res.json();
      if (res.ok) setTasks(data.tasks || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStatus = async (taskId: number, status: string) => {
    setUpdating(taskId);
    try {
      const res = await fetch("/api/staff/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status }),
      });
      if (res.ok) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
      }
    } catch (e) { console.error(e); }
    finally { setUpdating(null); }
  };

  const filtered = filter === "ALL" ? tasks : tasks.filter(t => t.status === filter);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-yellow-400">
        <FiLoader className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <FiCheckSquare className="text-yellow-400" /> Assigned Tasks
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Tasks assigned to you by the admin team — mark them as in-progress or done.
          </p>
        </div>
        <div className="flex gap-2">
          {["ALL", "PENDING", "IN_PROGRESS", "DONE"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                filter === s
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
              }`}>
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks */}
      {filtered.length === 0 ? (
        <div className="bg-[#0f172a]/50 border border-slate-800 border-dashed p-16 rounded-[2.5rem] text-center space-y-3">
          <FiCheckCircle className="text-slate-600 text-4xl mx-auto" />
          <h4 className="text-white font-bold">No Tasks Found</h4>
          <p className="text-xs text-slate-500">
            {filter === "ALL" ? "No tasks have been assigned to you yet." : `No tasks with status: ${filter}.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0f172a] border border-slate-800 rounded-[2rem] p-6 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-white text-base">{task.title}</h4>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.MEDIUM}`}>
                        <FiFlag className="inline mr-1" size={9} />{task.priority}
                      </span>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${STATUS_STYLES[task.status] || STATUS_STYLES.PENDING}`}>
                        {task.status.replace("_", " ")}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-slate-400 leading-relaxed">{task.description}</p>
                    )}
                    {task.dueDate && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <FiCalendar size={12} />
                        Due: {new Date(task.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 shrink-0">
                    {task.status !== "IN_PROGRESS" && task.status !== "DONE" && (
                      <button
                        onClick={() => updateStatus(task.id, "IN_PROGRESS")}
                        disabled={updating === task.id}
                        className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {updating === task.id ? <FiLoader className="animate-spin" size={12} /> : <FiClock size={12} />}
                        Start
                      </button>
                    )}
                    {task.status !== "DONE" && (
                      <button
                        onClick={() => updateStatus(task.id, "DONE")}
                        disabled={updating === task.id}
                        className="px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {updating === task.id ? <FiLoader className="animate-spin" size={12} /> : <FiCheckCircle size={12} />}
                        Done
                      </button>
                    )}
                    {task.status === "DONE" && (
                      <button
                        onClick={() => updateStatus(task.id, "PENDING")}
                        disabled={updating === task.id}
                        className="px-4 py-2 bg-slate-900 border border-slate-700 text-slate-400 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <FiCircle size={12} /> Reopen
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

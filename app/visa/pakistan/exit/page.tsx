"use client";

import { useState } from "react";
import Link from "next/link";

export default function ExitPermitPage() {
  const [step, setStep] = useState(1);
  const [type, setType] = useState("");
  const [applyType, setApplyType] = useState("");
  const [familyCount, setFamilyCount] = useState("");
  const [nationality, setNationality] = useState("");

  return (
    <div className="bg-black text-white min-h-screen py-20 px-6">
      <div className="max-w-3xl mx-auto">

        {/* 🔙 BACK HOME */}
        <Link
          href="/"
          className="inline-block mb-6 text-sm text-yellow-400 hover:underline"
        >
          ← Back to Home
        </Link>

        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-semibold text-white/90">
            Exit Permit Application
          </h1>

          <p className="text-gray-400 mt-3 text-sm">
            Complete the steps below to submit your application
          </p>

          <div className="mt-4 text-xs text-gray-500 uppercase">
            Step {step} of 3
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <p className="label mb-4">Select Permit Type</p>

              <div className="flex gap-4 mb-6">
                <button onClick={() => setType("normal")} className={type === "normal" ? "btn-active" : "btn"}>Normal</button>
                <button onClick={() => setType("humanitarian")} className={type === "humanitarian" ? "btn-active" : "btn"}>Humanitarian</button>
              </div>

              <button disabled={!type} onClick={() => setStep(2)} className="submit-btn">
                Continue
              </button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <p className="label mb-4">Apply For</p>

              <div className="flex gap-4 mb-6">
                <button onClick={() => setApplyType("individual")} className={applyType === "individual" ? "btn-active" : "btn"}>Individual</button>
                <button onClick={() => setApplyType("family")} className={applyType === "family" ? "btn-active" : "btn"}>Family</button>
              </div>

              {applyType === "family" && (
                <div className="mb-6">
                  <label className="label mb-2 block">Family Members</label>

                  <select
                    className="premium-select"
                    value={familyCount}
                    onChange={(e) => setFamilyCount(e.target.value)}
                  >
                    <option value="">Select members</option>
                    {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num} Member{num > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="btn">Back</button>

                <button
                  disabled={!applyType || (applyType === "family" && !familyCount)}
                  onClick={() => setStep(3)}
                  className="submit-btn"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <form className="space-y-5">

              <input placeholder="Full Name" className="input" />
              <input placeholder="WhatsApp Number" className="input" />
              <input placeholder="Email Address" className="input" />

              {type === "normal" && (
                <>
                  <input placeholder="Father Name" className="input" />
                  <input placeholder="Mother Name" className="input" />

                  {/* NATIONALITY */}
                  <select
                    className="premium-select"
                    onChange={(e) => setNationality(e.target.value)}
                  >
                    <option value="">Select Nationality</option>
                    <option value="afghanistan">Afghanistan</option>
                    <option value="pakistan">Pakistan</option>
                    <option value="india">India</option>
                    <option value="bangladesh">Bangladesh</option>
                    <option value="other">Other</option>
                  </select>

                  <UploadField
                    label={
                      nationality === "afghanistan"
                        ? "Upload Tazkira"
                        : nationality
                        ? "Upload Local ID / Driving License"
                        : "Select nationality first"
                    }
                  />

                  <UploadField label="Passport Scan" sample="/passport-sample.jpg" />
                  <UploadField label="White Background Photo" sample="/photo-sample.jpg" />
                  <UploadField label="Last Pakistan Visa" />
                  <UploadField label="Last Entry Passport Scan" />
                </>
              )}

              {type === "humanitarian" && (
                <UploadField label="Upload NADRA Tracking Document" />
              )}

              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(2)} className="btn">Back</button>
                <button type="submit" className="submit-btn">Submit Application</button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* STYLES */}
      <style jsx>{`
        .input {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          background: rgba(2, 6, 23, 0.8);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
        }

        .premium-select {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          background: rgba(2, 6, 23, 0.95);
          border: 1px solid rgba(255,255,255,0.15);
          color: white;
          outline: none;
        }

        .premium-select:focus {
          border-color: #eab308;
          box-shadow: 0 0 0 1px rgba(234,179,8,0.4);
        }

        .btn {
          flex: 1;
          padding: 10px;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
        }

        .btn-active {
          flex: 1;
          padding: 10px;
          background: #eab308;
          color: black;
          border-radius: 8px;
        }

        .submit-btn {
          flex: 1;
          background: #eab308;
          padding: 12px;
          border-radius: 10px;
          font-weight: bold;
          color: black;
        }
      `}</style>
    </div>
  );
}

function UploadField({ label, sample }: any) {
  return (
    <div>
      <div className="flex justify-between text-sm text-gray-400 mb-2">
        {label}

        {sample && (
          <div className="relative group text-yellow-400 text-xs cursor-pointer">
            View Sample
            <div className="hidden group-hover:block absolute bottom-6 right-0 w-40 bg-black p-2 rounded">
              <img src={sample} className="rounded" />
            </div>
          </div>
        )}
      </div>

      <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-lg p-6 cursor-pointer hover:border-yellow-400">
        <span className="text-gray-400 text-sm">
          Click to upload
        </span>
        <input type="file" className="hidden" />
      </label>
    </div>
  );
}
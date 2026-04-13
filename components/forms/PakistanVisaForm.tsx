"use client";
import { useState } from "react";
import axios from "axios";
import InputField from "./InputField";
import FileUpload from "./FileUpload";
import { useRouter } from "next/navigation";

const countries = [
  "Afghanistan",
  "India",
  "United Arab Emirates",
  "Saudi Arabia",
  "Qatar",
  "Oman",
  "Turkey",
  "Germany",
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "China",
  "Russia",
];
export default function PakistanVisaForm() {
    const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<any>({});
  const [files, setFiles] = useState<any>({});
  const [isAfghan, setIsAfghan] = useState(false);

  const handleSubmit = async () => {
    const data = new FormData();

    Object.keys(form).forEach(key => data.append(key, form[key]));
    Object.keys(files).forEach(key => data.append(key, files[key]));
    console.log("Submitting:", form); 
    await axios.post("http://localhost:5000/api/visa/pakistan", data);

    router.push("/success");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-[#020617] via-[#0f172a] to-black">

      <div className="w-full max-w-xl p-8 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] space-y-6">

       <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
          Pakistan Visa Application
        </h2>

        {/* STEP INDICATOR */}
       <div className="flex gap-2">
  {[1,2,3].map((s)=>(
    <div key={s} className={`flex-1 text-center py-2 rounded-full text-sm font-medium ${
      step === s
        ? "bg-yellow-500 text-black shadow-md"
        : "bg-white/10 text-gray-400"
    }`}>
      Step {s}
    </div>
  ))}
</div>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <InputField placeholder="Full Name"
              onChange={e => setForm({...form, fullName: e.target.value})} />

            <InputField placeholder="Father Name"
              onChange={e => setForm({...form, fatherName: e.target.value})} />

            <InputField placeholder="Mother Name"
              onChange={e => setForm({...form, motherName: e.target.value})} />

           <select
  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
  onChange={(e:any)=>{
    const value = e.target.value;

    setForm({
      ...form,
      nationality: value,
    });

    setIsAfghan(value === "Afghanistan");
  }}
>
  <option value="">Select Nationality</option>

  {countries.map((country) => (
    <option key={country} value={country} className="text-black">
      {country}
    </option>
  ))}
</select>

            {isAfghan ? (
              <FileUpload label="Upload Tazkira"
                onChange={(file:any)=>setFiles({...files, idDocument:file})} />
            ) : (
              <FileUpload label="Upload ID / Driving License"
                onChange={(file:any)=>setFiles({...files, idDocument:file})} />
            )}

            <button onClick={() => setStep(2)}
              className="w-full bg-yellow-500 text-black py-3 rounded-xl font-semibold hover:scale-105 transition">
              Next
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <InputField placeholder="Email"
              onChange={e => setForm({...form, email: e.target.value})} />

            <InputField placeholder="Mobile Number"
              onChange={e => setForm({...form, mobile: e.target.value})} />

            <InputField placeholder="WhatsApp Number"
              onChange={e => setForm({...form, whatsapp: e.target.value})} />

            <div className="flex gap-4">
              <button onClick={() => setStep(1)}
                className="w-full border border-white/20 py-3 rounded-xl">
                Back
              </button>

              <button onClick={() => setStep(3)}
                className="w-full bg-yellow-500 text-black py-3 rounded-xl">
                Next
              </button>
            </div>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <FileUpload label="Passport Scan"
              onChange={(file:any)=>setFiles({...files, passportScan:file})} />

            <FileUpload label="White Background Photo"
              onChange={(file:any)=>setFiles({...files, photo:file})} />

            <div className="flex gap-4">
              <button onClick={() => setStep(2)}
                className="w-full border border-white/20 py-3 rounded-xl">
                Back
              </button>

              <button onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 text-black py-3 rounded-xl font-bold hover:scale-105 transition">
                Submit
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
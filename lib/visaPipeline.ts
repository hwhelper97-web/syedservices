// Shared visa pipeline definition — single source of truth for all portal pages
// Used by: staff/[id], agent/[id], admin/[id]

export const VISA_PIPELINE = [
  {
    key: "DRAFT",
    label: "Draft",
    desc: "Application created and saved.",
  },
  {
    key: "WAITING_CONFIRMATION",
    label: "Wait for Confirmation",
    desc: "Your application is waiting for confirmation.",
  },
  {
    key: "DEAL_CONFIRMED",
    label: "Confirm Deal",
    desc: "Once confirmed, we will proceed further.",
  },
  {
    key: "SENT_FOR_INVITATION",
    label: "Sent for China Invitation Letter",
    desc: "Your documents will be sent to our China office.",
  },
  {
    key: "INVITATION_ARRIVED",
    label: "China Invitation Letter Arrived",
    desc: "Invitation letter received from China.",
  },
  {
    key: "FILE_READY_EMBASSY",
    label: "File Ready for Embassy Submission",
    desc: "Your file is ready to submit to the embassy.",
  },
  {
    key: "APPLICATION_SUBMITTED",
    label: "Application Submitted",
    desc: "Your application has been submitted.",
  },
  {
    key: "PASSPORT_TO_SUBMIT",
    label: "Passport to be Submitted",
    desc: "Please submit your passport for stamping.",
  },
  {
    key: "FINISHED",
    label: "Finished",
    desc: "Your visa process is completed.",
  },
];

export const VISA_STATUS_COLORS: Record<string, string> = {
  DRAFT:                  "text-slate-400 bg-slate-500/10 border-slate-500/20",
  WAITING_CONFIRMATION:   "text-blue-400 bg-blue-500/10 border-blue-500/20",
  DEAL_CONFIRMED:         "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  SENT_FOR_INVITATION:    "text-orange-400 bg-orange-500/10 border-orange-500/20",
  INVITATION_ARRIVED:     "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  FILE_READY_EMBASSY:     "text-purple-400 bg-purple-500/10 border-purple-500/20",
  APPLICATION_SUBMITTED:  "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  PASSPORT_TO_SUBMIT:     "text-amber-400 bg-amber-500/10 border-amber-500/20",
  FINISHED:               "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  APPROVED:               "text-green-400 bg-green-500/10 border-green-500/20",
  REJECTED:               "text-red-400 bg-red-500/10 border-red-500/20",
  ARCHIVED:               "text-slate-500 bg-slate-800/40 border-slate-700/20",
};

export const VISA_STATUS_OPTIONS = [
  { value: "WAITING_CONFIRMATION",  label: "Wait for Confirmation" },
  { value: "DEAL_CONFIRMED",        label: "Confirm Deal" },
  { value: "SENT_FOR_INVITATION",   label: "Sent for China Invitation Letter" },
  { value: "INVITATION_ARRIVED",    label: "China Invitation Letter Arrived" },
  { value: "FILE_READY_EMBASSY",    label: "File Ready for Embassy Submission" },
  { value: "APPLICATION_SUBMITTED", label: "Application Submitted" },
  { value: "PASSPORT_TO_SUBMIT",    label: "Passport to be Submitted" },
  { value: "FINISHED",              label: "Finished" },
  { value: "APPROVED",              label: "Approved" },
  { value: "REJECTED",              label: "Rejected" },
  { value: "ARCHIVED",              label: "Archived" },
];

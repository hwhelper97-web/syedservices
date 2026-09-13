export interface VisaCategoryOption {
  value: string;
  label: string;
  badge: string;
  description: string;
}

export const ALL_VISA_CATEGORIES: VisaCategoryOption[] = [
  {
    value: "L Tourism",
    label: "L - Tourism & Visit Visa",
    badge: "Most Popular",
    description: "Standard tourist visa for individual or family sightseeing and leisure travel.",
  },
  {
    value: "M Business",
    label: "M - Commercial & Trade Business Visa",
    badge: "Fast Track",
    description: "For business consultations, commercial delegations, trade fairs, and partner meetings.",
  },
  {
    value: "F Academic",
    label: "F - Academic Exchange & Research Visit",
    badge: "Exchange",
    description: "Academic exchanges, cultural visits, short study seminars, and non-commercial visits.",
  },
  {
    value: "Z Work Permit",
    label: "Z - Work Permit & Employment Visa",
    badge: "High Demand",
    description: "Official work authorization, employment permits, and corporate expatriate assignment.",
  },
  {
    value: "X1 Study Long-Term",
    label: "X1 - Higher Education & Long-Term Study",
    badge: "University",
    description: "For students pursuing degree programs (Bachelor, Master, PhD) over 180 days.",
  },
  {
    value: "X2 Study Short-Term",
    label: "X2 - Short-Term Study & Language Course",
    badge: "Language",
    description: "For short courses, university summer programs, and certifications under 180 days.",
  },
  {
    value: "Exit Permit",
    label: "Exit Permit (Standard Clearance)",
    badge: "Special Approval",
    description: "Official government border clearance and departure authorization.",
  },
  {
    value: "Humanitarian Exit Permit",
    label: "Humanitarian Exit Permit (Urgent / Relief)",
    badge: "Priority Humanitarian",
    description: "Emergency humanitarian departure authorization and special embassy exit protocol.",
  },
  {
    value: "Q1 Family Reunion",
    label: "Q1 - Long-Term Family Reunion / Settlement",
    badge: "Family",
    description: "Long-term family reunion with permanent residents or citizens.",
  },
  {
    value: "Q2 Family Visit",
    label: "Q2 - Short-Term Family Visit",
    badge: "Family Visit",
    description: "Short family visit for relatives of citizens or permanent residents.",
  },
  {
    value: "S1 Private Long-Term",
    label: "S1 - Private Family Reunion (Foreign Worker)",
    badge: "Dependents",
    description: "Dependents and spouses accompanying foreign workers residing on work visas.",
  },
  {
    value: "S2 Private Short-Term",
    label: "S2 - Private Family Visit & Urgent Matters",
    badge: "Private",
    description: "Visiting foreign family members residing abroad for private or medical affairs.",
  },
  {
    value: "Medical Treatment",
    label: "Medical Treatment & Hospital Care Visa",
    badge: "Medical",
    description: "Special visa for medical treatment, surgery, hospital appointments, and care.",
  },
  {
    value: "G Transit",
    label: "G - Transit & Airport Border Crossing",
    badge: "Transit",
    description: "Airport transit and temporary layover entry authorization.",
  },
  {
    value: "Overstay Regularization",
    label: "Overstay Regularization & Settlement",
    badge: "Legal Settlement",
    description: "Regularization of expired status, waiver processing, and legal documentation.",
  },
  {
    value: "Custom Special File",
    label: "Custom Visa Application / Special Consultation",
    badge: "Custom Dossier",
    description: "Custom negotiated visa category or specialized bilateral diplomatic arrangement.",
  },
];

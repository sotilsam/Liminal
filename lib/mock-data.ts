// All mock/placeholder data for Liminal — replace with real API calls

export type PatientStatus = "active" | "inactive";

export interface MockPatient {
  id: string;
  name: string;
  status: PatientStatus;
  lastSession: string;
  progress: number;
  amputationType: string;
  joinDate: string;
  sessions: MockSession[];
  goals: MockGoal[];
  notes: string;
}

export interface MockSession {
  date: string;
  duration: string;
  type: string;
  score: number;
}

export interface MockGoal {
  id: string;
  text: string;
  progress: number;
}

export interface ProgressPoint {
  week: string;
  score: number;
}

export interface SessionBarPoint {
  week: string;
  sessions: number;
}

export const mockPatients: MockPatient[] = [
  {
    id: "p1",
    name: "Yael Cohen",
    status: "active",
    lastSession: "2026-05-28",
    progress: 74,
    amputationType: "Below Knee — Right",
    joinDate: "2026-03-10",
    notes: "Patient shows excellent compliance. Focus on balance exercises.",
    sessions: [
      { date: "2026-05-28", duration: "45 min", type: "Balance", score: 88 },
      { date: "2026-05-21", duration: "40 min", type: "Strength", score: 82 },
      { date: "2026-05-14", duration: "50 min", type: "Gait", score: 79 },
      { date: "2026-05-07", duration: "35 min", type: "Balance", score: 75 },
    ],
    goals: [
      { id: "g1", text: "Walk 500m unassisted", progress: 80 },
      { id: "g2", text: "Climb 10 stairs", progress: 60 },
      { id: "g3", text: "10-min standing balance", progress: 45 },
    ],
  },
  {
    id: "p2",
    name: "Avi Levi",
    status: "active",
    lastSession: "2026-05-27",
    progress: 52,
    amputationType: "Above Elbow — Left",
    joinDate: "2026-04-01",
    notes: "Working on grip strength calibration. Progressing steadily.",
    sessions: [
      { date: "2026-05-27", duration: "30 min", type: "Grip", score: 65 },
      { date: "2026-05-20", duration: "35 min", type: "Reach", score: 58 },
      { date: "2026-05-13", duration: "30 min", type: "Grip", score: 52 },
    ],
    goals: [
      { id: "g1", text: "Hold cup independently", progress: 55 },
      { id: "g2", text: "Type on keyboard", progress: 30 },
    ],
  },
  {
    id: "p3",
    name: "Michal Shapiro",
    status: "active",
    lastSession: "2026-05-26",
    progress: 89,
    amputationType: "Below Knee — Left",
    joinDate: "2026-01-15",
    notes: "Nearly at discharge readiness. Excellent progress.",
    sessions: [
      { date: "2026-05-26", duration: "60 min", type: "Gait", score: 94 },
      { date: "2026-05-19", duration: "55 min", type: "Sports", score: 91 },
      { date: "2026-05-12", duration: "60 min", type: "Gait", score: 88 },
    ],
    goals: [
      { id: "g1", text: "Run 1km", progress: 90 },
      { id: "g2", text: "Swim 200m", progress: 75 },
    ],
  },
  {
    id: "p4",
    name: "David Mizrahi",
    status: "inactive",
    lastSession: "2026-04-30",
    progress: 31,
    amputationType: "Above Knee — Right",
    joinDate: "2026-02-20",
    notes: "Missed last 3 sessions. Need to follow up.",
    sessions: [
      { date: "2026-04-30", duration: "25 min", type: "Balance", score: 48 },
      { date: "2026-04-23", duration: "30 min", type: "Strength", score: 44 },
    ],
    goals: [
      { id: "g1", text: "Stand unassisted 2min", progress: 35 },
      { id: "g2", text: "Walk with cane", progress: 25 },
    ],
  },
  {
    id: "p5",
    name: "Noa Ben-David",
    status: "active",
    lastSession: "2026-05-29",
    progress: 63,
    amputationType: "Below Elbow — Right",
    joinDate: "2026-03-25",
    notes: "Excellent motivation. Adapting well to myoelectric control.",
    sessions: [
      { date: "2026-05-29", duration: "40 min", type: "Control", score: 78 },
      { date: "2026-05-22", duration: "45 min", type: "ADL", score: 72 },
      { date: "2026-05-15", duration: "40 min", type: "Control", score: 66 },
    ],
    goals: [
      { id: "g1", text: "Button shirt independently", progress: 70 },
      { id: "g2", text: "Prepare simple meal", progress: 55 },
      { id: "g3", text: "Write with prosthetic", progress: 40 },
    ],
  },
];

export const progressData: ProgressPoint[] = [
  { week: "W1", score: 22 },
  { week: "W2", score: 31 },
  { week: "W3", score: 38 },
  { week: "W4", score: 45 },
  { week: "W5", score: 51 },
  { week: "W6", score: 58 },
  { week: "W7", score: 63 },
  { week: "W8", score: 69 },
  { week: "W9", score: 74 },
];

export const sessionsPerWeek: SessionBarPoint[] = [
  { week: "W1", sessions: 8 },
  { week: "W2", sessions: 11 },
  { week: "W3", sessions: 14 },
  { week: "W4", sessions: 10 },
  { week: "W5", sessions: 16 },
  { week: "W6", sessions: 13 },
  { week: "W7", sessions: 18 },
  { week: "W8", sessions: 15 },
];

export const limbModels = [
  { id: "l1", label: "Below Knee — Right", labelHe: "מתחת לברך — ימין" },
  { id: "l2", label: "Below Knee — Left", labelHe: "מתחת לברך — שמאל" },
  { id: "l3", label: "Above Knee — Right", labelHe: "מעל הברך — ימין" },
  { id: "l4", label: "Above Knee — Left", labelHe: "מעל הברך — שמאל" },
  { id: "l5", label: "Below Elbow — Right", labelHe: "מתחת למרפק — ימין" },
  { id: "l6", label: "Below Elbow — Left", labelHe: "מתחת למרפק — שמאל" },
  { id: "l7", label: "Above Elbow — Right", labelHe: "מעל המרפק — ימין" },
  { id: "l8", label: "Above Elbow — Left", labelHe: "מעל המרפק — שמאל" },
];

export const mockCurrentPatient = mockPatients[0];

export const therapistReportMetrics = {
  totalPatients: mockPatients.length,
  activeThisWeek: mockPatients.filter((p) => p.status === "active").length,
  avgProgress: Math.round(
    mockPatients.reduce((acc, p) => acc + p.progress, 0) / mockPatients.length
  ),
  sessionsThisMonth: 47,
};

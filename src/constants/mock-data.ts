export type PropertyStatus =
  | "Offer Sent"
  | "Contract Signed"
  | "Site Handover"
  | "Under Construction"
  | "Completed"
  | "On Hold";

export type Property = {
  id: string;
  name: string;
  unitId: string;
  location: string;
  status: PropertyStatus;
  progress: number;
  stage: string;
  estimatedCompletion: string;
  beds?: number;
  baths?: number;
  area?: string;
  developer?: string;
};

export type Milestone = {
  id: string;
  propertyName: string;
  title: string;
  dueDate: string;
};

export type MessageThread = {
  id: string;
  propertyId: string;
  title: string;
  preview: string;
  time: string;
  unread: number;
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
};

export const MOCK_PROPERTIES: Property[] = [
  {
    id: "1",
    name: "Palm Jumeirah - Unit 4B",
    unitId: "4B",
    location: "Palm Jumeirah",
    status: "Under Construction",
    progress: 65,
    stage: "Interior Finishing",
    estimatedCompletion: "17 Mar 2026",
    beds: 3,
    baths: 4,
    area: "2,450 sq ft",
    developer: "Nakheel",
  },
  {
    id: "2",
    name: "Palm Jumeirah - Villa 48",
    unitId: "48",
    location: "Palm Jumeirah",
    status: "Under Construction",
    progress: 74,
    stage: "MEP Works",
    estimatedCompletion: "02 Jun 2026",
    beds: 5,
    baths: 6,
    area: "5,200 sq ft",
    developer: "Nakheel",
  },
  {
    id: "3",
    name: "Downtown Views - 1202",
    unitId: "1202",
    location: "Downtown Dubai",
    status: "Site Handover",
    progress: 98,
    stage: "Handover",
    estimatedCompletion: "10 Jan 2026",
    beds: 2,
    baths: 2,
    area: "1,180 sq ft",
    developer: "Emaar",
  },
];

export const MOCK_MILESTONES: Milestone[] = [
  {
    id: "m1",
    propertyName: "Palm Jumeirah - Unit 4B",
    title: "Handover",
    dueDate: "17 Mar 2026",
  },
  {
    id: "m2",
    propertyName: "Palm Jumeirah - Villa 48",
    title: "Demolition Begins",
    dueDate: "28 Apr 2026",
  },
];

export const MOCK_THREADS: MessageThread[] = [
  {
    id: "t1",
    propertyId: "1",
    title: "Palm Jumeirah - Unit 4B",
    preview: "Site visit report for March is ready.",
    time: "2h",
    unread: 2,
  },
  {
    id: "t2",
    propertyId: "2",
    title: "Palm Jumeirah - Villa 48",
    preview: "Can we schedule a walkthrough this week?",
    time: "1d",
    unread: 0,
  },
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    title: "Milestone completed",
    body: "Foundation Work marked complete for Unit 4B.",
    time: "3h ago",
    read: false,
  },
  {
    id: "n2",
    title: "New document uploaded",
    body: "Monthly progress report added for Villa 48.",
    time: "Yesterday",
    read: false,
  },
  {
    id: "n3",
    title: "SOG approved",
    body: "Statement of Guarantee approved for Unit 4B.",
    time: "2d ago",
    read: true,
  },
];

export const DASHBOARD_KPIS = [
  { id: "active", label: "Active Properties", value: "2" },
  { id: "progress", label: "Overall Progress", value: "74%", progress: 74 },
  { id: "milestones", label: "Upcoming Milestones", value: "2" },
  { id: "docs", label: "New Documents", value: "3" },
];

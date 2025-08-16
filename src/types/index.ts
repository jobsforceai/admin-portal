export interface Counceller {
  _id: string;
  name: string;
  email: string;
  applicationStatus: "applied" | "interviewing" | "hired" | "rejected";
  isVerified: boolean;
  createdAt: string;
}

export interface Agent {
  _id: string;
  name: string;
  email: string;
  applicationStatus: "applied" | "interviewing" | "hired" | "rejected";
  isVerified: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}

export interface Job {
  _id: string;
  title: string;
  domain: string;
  description: string;
  detailedDescription: string;
  skills: string[];
  location: "Remote" | "Hybrid" | "On-site";
  minPay?: number;
  maxPay?: number;
  jobType: "Full-time" | "Part-time" | "Internship";
  whoCanApply: string;
}
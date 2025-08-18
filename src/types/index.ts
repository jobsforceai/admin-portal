export interface Counsellor {
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
  assignmentId?: string;
}

export interface JobApplication {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  resume: string;
  jobId: string;
  isTestAssigned?: boolean;
  applicationStatus?: "applied" | "shortlisted" | "rejected" | "graded";
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Assignment {
  title: string;
  passingScore: number;
  sections: {
    title: string;
    type: "multiple-choice" | "short-answer" | "practical" | "roleplay";
    pointsPerQuestion: number;
    questions: {
      id: string;
      prompt: string;
      options?: {
        key: string;
        text: string;
      }[];
      correctAnswer?: string;
      modelAnswer?: string;
    }[];
  }[];
}

export interface GradedAnswer {
  questionId: string;
  manualScore: number;
  notes?: string;
}

export interface Answer {
  _id: string;
  questionId: string;
  answer: string;
  manualScore?: number;
  notes?: string;
  aiJustification?: string;
  aiSuggestedScore?: number;
}

export interface Submission {
  _id: string;
  applicationId: string;
  assignmentId: Assignment & { _id: string };
  answers: Answer[];
  manualScore?: number;
  graderNotes?: string;
  status: "started" | "completed" | "graded" | "submitted";
}

export interface GradingData {
  gradedAnswers: {
    questionId: string;
    manualScore: number;
    notes: string;
  }[];
  graderNotes: string;
}
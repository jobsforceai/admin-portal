
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

export const loggedInUserData = {
  id: 5,
  avatar: "/LoggedInUser.jpg",
  name: "Jakob Hoeg",
};

export type LoggedInUserData = typeof loggedInUserData;

interface Source {
  id: string;
  description: string;
  title: string;
  strength: string;
}

export interface Img {
  id: string;
  link: string;
  file: string;
  created_at: string;
  category: string;
  caption: string;
  message: string;
}

// "id": "863e1b17-04cb-4878-b6db-ffeb8217e213",
// "model_code": "gpt-3.5-turbo",
// "name": "GPT3.5-T",
// "description": ""
export interface Model {
  id: string;
  model_code: string;
  name: string;
  description: string;
}

export interface MessageModel {
  name: string;
  init: string;
}

export interface FeedbackShort {
  id: string;
  feedback: boolean;
  positive: boolean;
}

export interface Message {
  id: string;
  content: string;
  created_at: string;
  purpose: string | null;
  tokens: number | null;
  by: string;
  images?: File[] | null | undefined;
  imageUrls?: string[] | null;
  sources: Source[];
  files: Img[] | null;
  thread: string | null;
  classification: string;
  feedback: FeedbackShort | null;
  error: boolean | null;
}

export interface Update {
  // {
  //   "id": "123e4567-e89b-12d3-a456-426614174000",
  //   "title": "Updated Update Title",
  //   "description": "An updated description of the update.",
  //   "version": "1.0.2",
  //   "primaryLink": "https://example.com/update/1.0.2",
  //   "secondaryLink": "https://example.com/update/1.0.2/docs"
  //  }
  id: string;
  title: string;
  description: string;
  is_read: boolean;
  version: string;
  primaryLink: string;
  secondaryLink: string;
  read: boolean | null;
}

export interface Support {
  // {
  //   "id": "123e4567-e89b-12d3-a456-426614174000",
  //   "title": "Updated Support Request",
  //   "description": "An updated description of the support request.",
  //   "status": "Closed",
  //   "priority": "High",
  //   "notes": "Updated notes for the support request."
  //  }

  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  notes: string;
}

export interface Profie {
  avatar: string | null;
}
export interface User {
  id: number;
  avatar: string | null;
  userName: string;
  email: string;
  profile: Profie;
  last_login: string | null;
  is_superuser: boolean;
  username: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
  groups: any[];
  user_permissions: any[];
}

export interface AgentIntro {
  name: string;
  init: string;
  avatar?: string;
}
export interface Thread {
  id: string;
  thread_id: string;
  created_at: string;
  updated_at: string;
  title: string;
  agent: AgentIntro;
  category: string;
  assistant: string;
  user: number;
}

// Why do we need two of the same type? One document is supposed to have only one file.
export interface Document {
  id: string;
  title: string;
  description?: string;
  source?: string;
  summary: string;
  url?: string;
  author?: string;
  category: string;
  created_at: string;
  published_at: string;
  type: string;
  strength: string;
  project?: string;
  location?: string;
  associated_with?: string[];
  file?: File | string | null | undefined;
}
//{BOTMODELINTE}

export interface Question {
  // "id": "ffe433e5-2ef3-4e5b-b9b2-ac5f35139c3e",
  // "question": "How does the RGM collaborate with the sales team to align pricing strategies?",
  // "created_at": "2024-03-25T13:14:23.517379Z",
  // "updated_at": "2024-03-25T13:14:23.517379Z",
  // "assistant": "e70a7670-fb07-4b6b-997a-4b3d623b30e2"
  id: string;
  question: string;
  created_at: string;
  updated_at: string;
  assistant: string;
}
export interface Bot {
  init?: string;
  //USE this instead of ModelItem
  avatar?: string;
  id: string; // UUID
  assistant_id: string | null; // CharField, nullable
  name: string; // CharField
  category: string | null; // CharField
  project: string | null; // ForeignKey, nullable
  description: string | null; // TextField, nullable
  model: string; // ForeignKey, default=1
  instructions: string | null; // TextField, nullable
  rules: string | null; // TextField, nullable
  created_at: string; // DateTimeField
  updated_at: string; // DateTimeField
  documents: string[]; // ManyToManyField, related_name="bots", blank=True
  rag: boolean; // BooleanField, default=True
  type: string; // CharField, default="bot"
  author?: string;
  disabled: boolean; // BooleanField, default=False
  questions: Question[]; // ManyToManyField, related_name="questions", blank=True
  thread_count: number; // IntegerField, default=0
}

export interface QueryCategoryStat {
  classification_name: string | null;
  total: number;
  monthly_increase: string;
  general_count: number;
  role_count: number;
  role_ratio: string;
}

export interface BotStats {
  name: string;
  thread__assistant__name: string;
  positive_feedback_count: number;
  negative_feedback_count: number;
  error_rate: number;
  evolution: number;
  thread_count: number;
  total_feedback_count: number;
  negative_positive_ratio: number | null;
  avatar: string | null; // Assuming avatar is a URL or an identifier
  average_response_time: string;
}

export interface StatsData {
  DAU: number;
  MAU: number;
  newThreadsLastMonth: number;
  messagesLastMonth: number;
  averageMessagesLastMonth: number;
  totalThreads: number;
  totalDocuments: number;
  documentsByCategory: {
    category: string;
    total: number;
  }[];
  totalMessages: number;
  messagesByPurpose: {
    purpose: string;
    total: number;
  }[];
  queryCategoryStats: QueryCategoryStat[];
  averageResponseTime: string; // Consider using a more specific type for time
  botSuccessRate: number;
  mostUsedBots: {
    thread__assistant__name: string | null;
    usage_count: number;
  }[];
  commonErrors: any[]; // Define a specific type if possible
  // botStats: BotStats[];
  feedbackTrends: {
    positive_feedback_count: number;
    negative_feedback_count: number;
  };
  contentCreationTrends: any; // Define a specific type if possible
}

export interface PricingStats {
  admin?: PricingAdminStats;
  bot_list?: PricingBotListStats[];
}

interface PricingAdminStats {
  total_cost: number;
  average_per_user: number;
  average_per_bot: number;
  average_per_prompt: number;
  average_per_thread: number;
}

interface PricingBotListStats {
  name: string;
  avatar: string;
  tokens: number;
  pricing: number;
  num_threads: number;
  num_users: number;
  token_increase_percentage: number;
}

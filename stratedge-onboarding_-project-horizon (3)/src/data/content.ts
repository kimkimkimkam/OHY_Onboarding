import { Character, QuizQuestion } from "../types";

export const COMPANY_NAME = "StratEdge Consulting";
export const PROJECT_NAME = "Project Horizon";

export const CHAPTER_1_IMAGE = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"; // Corporate office
export const VIDEO_THUMBNAIL = "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80"; // Professional meeting

export const TEAM: Character[] = [
  {
    name: "Marcus",
    role: "Senior Manager",
    description: "Strict and results-oriented. He's usually in back-to-back meetings and expects you to handle roadblocks independently.",
    imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&h=400&q=80" // Corporate man
  },
  {
    name: "Elena",
    role: "Consultant (Teammate)",
    description: "Helpful and knowledgeable, but often overwhelmed with her own workstreams. She values proactive collaboration.",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=80" // Corporate woman
  },
  {
    name: "Mr. Sterling",
    role: "Client Lead",
    description: "Demanding and sometimes vague. He expects high-quality deliverables and immediate responses to his concerns.",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400&q=80" // Executive man
  }
];

export const CHAPTER_1_QUIZ: QuizQuestion[] = [
  {
    id: 1,
    scenario: "Marcus is in a high-stakes meeting. You find a critical error in the report for Mr. Sterling, due in 30 minutes.",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&h=200&q=80", // Financial report/data
    choices: [
      { id: "A", text: "Wait for Marcus to finish to avoid overstepping" },
      { id: "B", text: "Correct the data and notify Marcus via email" },
      { id: "C", text: "Postpone the meeting with Mr. Sterling until Marcus is free" }
    ]
  },
  {
    id: 2,
    scenario: "Elena is struggling with a technical bottleneck. You have finished your deliverables early and notice her stress.",
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&h=200&q=80", // Team collaboration
    choices: [
      { id: "A", text: "Offer to take over the technical bottleneck immediately" },
      { id: "B", text: "Ask Marcus for more work for yourself" },
      { id: "C", text: "Use the extra time for personal professional development" }
    ]
  },
  {
    id: 3,
    scenario: "Mr. Sterling asks for a new set of KPIs during a demo. Marcus is not present to manage the scope.",
    imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&h=200&q=80", // Business presentation
    choices: [
      { id: "A", text: "Agree to the request to maintain client satisfaction" },
      { id: "B", text: "Document the request and propose a follow-up with Marcus" },
      { id: "C", text: "Refuse the request as it is out of scope" }
    ]
  },
  {
    id: 4,
    scenario: "You notice the team's data entry process is redundant. Marcus has used this process for years without issue.",
    imageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&h=200&q=80", // Strategy/Process improvement
    choices: [
      { id: "A", text: "Follow the existing process to respect Marcus's hierarchy" },
      { id: "B", text: "Develop a prototype of a better process and present it" },
      { id: "C", text: "Complain to Elena about the inefficiency of the task" }
    ]
  },
  {
    id: 5,
    scenario: "A key stakeholder is ignoring your data requests for a Friday deadline. It is now Thursday afternoon.",
    imageUrl: "https://images.unsplash.com/photo-1521791136064-7986c2923216?auto=format&fit=crop&w=800&h=200&q=80", // Professional communication/Deadline
    choices: [
      { id: "A", text: "Escalate the issue to Marcus immediately" },
      { id: "B", text: "Find an alternative data source or contact their manager" },
      { id: "C", text: "Wait until Friday morning to see if they respond" }
    ]
  }
];

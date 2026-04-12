// Mock user data
export const mockUser = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex@company.com',
  avatar: null,
  role: 'Product Manager',
  company: 'TechCorp',
  createdAt: '2024-01-15',
}

// Mock meetings data
export const mockMeetings = [
  {
    id: '1',
    title: 'Q1 Product Planning',
    date: '2025-04-07',
    time: '10:00 AM',
    duration: '1h 23m',
    participants: ['Alex Johnson', 'Sarah Chen', 'Mike Williams'],
    status: 'completed',
    summary: 'Discussed roadmap priorities for Q1, including new AI features and performance improvements.',
    actionItems: [
      { id: '1', text: 'Draft PRD for voice commands feature', assignee: 'Alex Johnson', done: false },
      { id: '2', text: 'Review competitor analysis', assignee: 'Sarah Chen', done: true },
      { id: '3', text: 'Schedule design review', assignee: 'Mike Williams', done: false },
    ],
  },
  {
    id: '2',
    title: 'Engineering Standup',
    date: '2025-04-06',
    time: '9:00 AM',
    duration: '32m',
    participants: ['Alex Johnson', 'David Park', 'Emma Wilson'],
    status: 'completed',
    summary: 'Daily sync on sprint progress. API integration on track, UI polish needed.',
    actionItems: [
      { id: '4', text: 'Fix pagination bug', assignee: 'David Park', done: true },
      { id: '5', text: 'Update component library', assignee: 'Emma Wilson', done: false },
    ],
  },
  {
    id: '3',
    title: 'Client Demo - Acme Inc',
    date: '2025-04-05',
    time: '2:00 PM',
    duration: '45m',
    participants: ['Alex Johnson', 'Sarah Chen', 'John Smith (Acme)'],
    status: 'completed',
    summary: 'Product demo for Acme Inc. Positive feedback on AI transcription accuracy.',
    actionItems: [
      { id: '6', text: 'Send follow-up proposal', assignee: 'Alex Johnson', done: false },
      { id: '7', text: 'Prepare custom pricing', assignee: 'Sarah Chen', done: false },
    ],
  },
  {
    id: '4',
    title: 'Design Review',
    date: '2025-04-04',
    time: '3:30 PM',
    duration: '1h 05m',
    participants: ['Alex Johnson', 'Lisa Wang', 'Tom Brown'],
    status: 'completed',
    summary: 'Reviewed new dashboard designs. Approved mobile-first approach.',
    actionItems: [
      { id: '8', text: 'Finalize color palette', assignee: 'Lisa Wang', done: true },
    ],
  },
  {
    id: '5',
    title: 'Team Retrospective',
    date: '2025-04-03',
    time: '4:00 PM',
    duration: '55m',
    participants: ['Alex Johnson', 'Sarah Chen', 'Mike Williams', 'David Park'],
    status: 'completed',
    summary: 'Sprint retrospective. Team velocity improved 15%. Communication highlighted as area to improve.',
    actionItems: [
      { id: '9', text: 'Set up daily async updates', assignee: 'Alex Johnson', done: true },
    ],
  },
]

// Mock transcript data
export const mockTranscript = [
  { id: '1', speaker: 'Alex Johnson', text: 'Good morning everyone. Let\'s kick off our Q1 planning session.', timestamp: '00:00:05', color: '#6366f1' },
  { id: '2', speaker: 'Sarah Chen', text: 'Thanks Alex. I\'ve prepared the market analysis we discussed last week.', timestamp: '00:00:18', color: '#8b5cf6' },
  { id: '3', speaker: 'Mike Williams', text: 'Great, I\'m curious to see how our competitors are approaching the AI features.', timestamp: '00:00:32', color: '#ec4899' },
  { id: '4', speaker: 'Alex Johnson', text: 'Let\'s start with the roadmap overview. We have three main initiatives this quarter.', timestamp: '00:00:45', color: '#6366f1' },
  { id: '5', speaker: 'Alex Johnson', text: 'First, improving transcription accuracy by 20%. Second, launching the mobile app. Third, enterprise integrations.', timestamp: '00:01:02', color: '#6366f1' },
  { id: '6', speaker: 'Sarah Chen', text: 'For transcription accuracy, I think we should focus on speaker diarization first. That\'s where we\'re getting the most complaints.', timestamp: '00:01:25', color: '#8b5cf6' },
  { id: '7', speaker: 'Mike Williams', text: 'Agreed. I\'ve been working with the ML team on a new model. Early results look promising.', timestamp: '00:01:42', color: '#ec4899' },
  { id: '8', speaker: 'Alex Johnson', text: 'That\'s excellent news. Can you share the benchmark results by end of week?', timestamp: '00:01:58', color: '#6366f1' },
  { id: '9', speaker: 'Mike Williams', text: 'Absolutely. I\'ll put together a comprehensive comparison.', timestamp: '00:02:10', color: '#ec4899' },
  { id: '10', speaker: 'Sarah Chen', text: 'Moving on to the mobile app, our beta testers have been very positive about the UX.', timestamp: '00:02:28', color: '#8b5cf6' },
]

// Mock live transcript updates
export const mockLiveTranscriptUpdates = [
  { speaker: 'Alex Johnson', text: 'Let\'s begin the standup. How\'s everyone doing today?', color: '#6366f1' },
  { speaker: 'Sarah Chen', text: 'Good morning! I finished the API integration yesterday.', color: '#8b5cf6' },
  { speaker: 'Mike Williams', text: 'Nice! I\'m wrapping up the unit tests for the new module.', color: '#ec4899' },
  { speaker: 'Alex Johnson', text: 'Excellent progress. Any blockers we need to address?', color: '#6366f1' },
  { speaker: 'Sarah Chen', text: 'I\'m waiting on the design specs for the notification system.', color: '#8b5cf6' },
  { speaker: 'Mike Williams', text: 'I can help with that. Let me sync with the design team after this.', color: '#ec4899' },
]

// Mock notifications
export const mockNotifications = [
  { id: '1', type: 'meeting_complete', title: 'Meeting Transcribed', message: 'Q1 Product Planning has been processed.', time: '5 minutes ago', read: false },
  { id: '2', type: 'action_item', title: 'Action Item Due', message: 'Draft PRD for voice commands feature is due tomorrow.', time: '1 hour ago', read: false },
  { id: '3', type: 'share', title: 'Meeting Shared', message: 'Sarah Chen shared "Engineering Standup" with you.', time: '2 hours ago', read: true },
  { id: '4', type: 'meeting_complete', title: 'Meeting Transcribed', message: 'Client Demo - Acme Inc has been processed.', time: '1 day ago', read: true },
  { id: '5', type: 'system', title: 'New Feature Available', message: 'Try our new AI-powered action item extraction.', time: '2 days ago', read: true },
]

// Mock stats
export const mockStats = {
  totalMeetings: 47,
  hoursProcessed: 62.5,
  tasksPending: 8,
  avgDuration: '42m',
  accuracyRate: '98.5%',
  meetingsThisWeek: 12,
}

// Mock activity feed
export const mockActivityFeed = [
  { id: '1', action: 'Meeting completed', subject: 'Q1 Product Planning', time: '5 min ago' },
  { id: '2', action: 'Action item completed', subject: 'Review competitor analysis', time: '1 hour ago' },
  { id: '3', action: 'Meeting shared', subject: 'Engineering Standup', time: '2 hours ago' },
  { id: '4', action: 'New participant', subject: 'John Smith joined Acme Demo', time: '1 day ago' },
  { id: '5', action: 'Summary generated', subject: 'Design Review', time: '1 day ago' },
]

// Speaker colors for live meeting
export const speakerColors = {
  'Alex Johnson': '#6366f1',
  'Sarah Chen': '#8b5cf6',
  'Mike Williams': '#ec4899',
  'David Park': '#14b8a6',
  'Emma Wilson': '#f59e0b',
  'Lisa Wang': '#10b981',
  'Tom Brown': '#ef4444',
}

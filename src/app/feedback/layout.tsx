import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Feedback - Klara AI Assistant',
  description: 'Share your feedback to help us improve Klara AI Assistant',
}

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Klara Usage Guide - AI-Powered Governance Assistant',
  description: 'Complete guide to using Klara AI Assistant for Polkadot and Kusama governance queries, voting analysis, and treasury insights.',
  keywords: 'Klara, AI, Polkadot, Kusama, governance, voting, treasury, proposals, referenda',
}

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

'use client'

export default function KlaraGuide() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-4">🧠 Klara Usage Guide</h1>
          <p className="text-xl opacity-90">Your AI-Powered Governance Assistant for Polkassembly & Polkadot Network</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-12">
          
          {/* Introduction */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-4xl mr-3">🌍</span>
              Introduction
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Klara is an AI chatbot built for the Polkadot and Kusama governance ecosystem, integrated with Polkassembly. 
                It helps users query on-chain data, explore governance insights, and understand the entire proposal and voting process—all in natural language.
              </p>
              <p className="text-gray-700 font-semibold mb-3">Klara is designed for:</p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Community members exploring proposals or referenda
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Delegates analyzing voting behavior
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Builders tracking treasury and bounty activities
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Researchers studying governance trends
                </li>
              </ul>
            </div>
          </section>

          {/* Core Capabilities */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-4xl mr-3">⚙️</span>
              Core Capabilities
            </h2>

            {/* Governance Data Querying */}
            <div className="mb-10">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">🗳</span>
                1. Governance Data Querying
              </h3>
              <p className="text-gray-700 mb-6">Klara can retrieve, filter, and summarize on-chain proposals across Polkadot and Kusama.</p>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 rounded-lg">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Feature</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Description</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Example Query</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr>
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Proposal Lookup</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-900">Fetch proposals or referenda by ID or title</td>
                      <td className="border border-gray-300 px-4 py-3 font-mono text-blue-600">"Show referendum 472 on Polkadot."</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Filter by Type</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-900">Supports ReferendumV2, Treasury, Fellowship, Bounty, ChildBounty</td>
                      <td className="border border-gray-300 px-4 py-3 font-mono text-blue-600">"List all Treasury proposals this month."</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Filter by Network</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-900">Switch between Polkadot and Kusama networks</td>
                      <td className="border border-gray-300 px-4 py-3 font-mono text-blue-600">"Show Kusama bounties created in 2024."</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Status Filtering</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-900">Retrieve proposals by status: Deciding, DecisionDepositPlaced, Submitted, etc.</td>
                      <td className="border border-gray-300 px-4 py-3 font-mono text-blue-600">"What proposals are currently in the deciding phase?"</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Date-Based Search</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-900">Query by specific dates, months, or years</td>
                      <td className="border border-gray-300 px-4 py-3 font-mono text-blue-600">"Show all referenda in July 2025."</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Text Search</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-900">Search in titles or content</td>
                      <td className="border border-gray-300 px-4 py-3 font-mono text-blue-600">"Find proposals mentioning 'parachain auctions'."</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Details Retrieval</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-900">Get structured proposal data</td>
                      <td className="border border-gray-300 px-4 py-3 font-mono text-blue-600">"Show details for proposal 85."</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Voting Data Analysis */}
            <div className="mb-10">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">📊</span>
                2. Voting Data Analysis
              </h3>
              <p className="text-gray-700 mb-6">Klara enables deep analysis of voter behavior and governance participation.</p>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 rounded-lg">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Feature</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Description</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Example Query</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr>
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Voter Information</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-900">Retrieve details of individual voters and their activity</td>
                      <td className="border border-gray-300 px-4 py-3 font-mono text-blue-600">"Show the voting history of address 15Hu...xyz."</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Voting Power</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-900">Analyze balance and conviction using conviction_vote data</td>
                      <td className="border border-gray-300 px-4 py-3 font-mono text-blue-600">"Who had the highest voting power in Referendum 300?"</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Delegation Tracking</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-900">Identify delegated votes and delegation relationships</td>
                      <td className="border border-gray-300 px-4 py-3 font-mono text-blue-600">"Who delegated their votes to Alice on Polkadot?"</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Vote Decisions</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-900">Filter by aye, nay, or abstain</td>
                      <td className="border border-gray-300 px-4 py-3 font-mono text-blue-600">"List all voters who voted 'nay' on Referendum 51."</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Conviction Analysis</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-900">Analyze lock periods and conviction multipliers</td>
                      <td className="border border-gray-300 px-4 py-3 font-mono text-blue-600">"What was the most common conviction used in recent votes?"</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Top Voters</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-900">Rank voters by voting power</td>
                      <td className="border border-gray-300 px-4 py-3 font-mono text-blue-600">"Top 10 voters in the last 5 referenda."</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Unique Voter Count</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-900">Aggregate unique voters by time</td>
                      <td className="border border-gray-300 px-4 py-3 font-mono text-blue-600">"How many unique voters participated in August 2025?"</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Active vs. Removed Votes</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-900">Filter based on active or removed vote states</td>
                      <td className="border border-gray-300 px-4 py-3 font-mono text-blue-600">"Show all active votes on Kusama."</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Query Examples */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-4xl mr-3">🧭</span>
              Query Examples by Use Case
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Governance Queries */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
                  <span className="text-xl mr-2">🧩</span>
                  Governance Queries
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="font-mono text-blue-700">"List all active proposals on Polkadot."</li>
                  <li className="font-mono text-blue-700">"Which referenda are under the 'Treasurer' track?"</li>
                  <li className="font-mono text-blue-700">"Find all bounties created in 2025 with status 'Submitted'."</li>
                </ul>
              </div>

              {/* Proposal Exploration */}
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
                  <span className="text-xl mr-2">💬</span>
                  Proposal Exploration
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="font-mono text-green-700">"Summarize the proposal about 'USDT treasury transfer'."</li>
                  <li className="font-mono text-green-700">"Who created proposal 244 and what's its current stage?"</li>
                  <li className="font-mono text-green-700">"Show me child bounties linked to bounty 30."</li>
                </ul>
              </div>

              {/* Voting Behavior */}
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-purple-800 mb-4 flex items-center">
                  <span className="text-xl mr-2">🧑‍🤝‍🧑</span>
                  Voting Behavior
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="font-mono text-purple-700">"How many users voted 'aye' on Referendum 800?"</li>
                  <li className="font-mono text-purple-700">"Which delegates voted with the highest conviction last month?"</li>
                  <li className="font-mono text-purple-700">"Show all voters who abstained on any referendum in 2024."</li>
                </ul>
              </div>

              {/* Treasury Insights */}
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-yellow-800 mb-4 flex items-center">
                  <span className="text-xl mr-2">💰</span>
                  Treasury Insights
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="font-mono text-yellow-700">"Show all treasury proposals above 100,000 DOT."</li>
                  <li className="font-mono text-yellow-700">"List beneficiaries from treasury payouts in September 2025."</li>
                  <li className="font-mono text-yellow-700">"What are the latest tips created under the Treasury track?"</li>
                </ul>
              </div>
            </div>

            {/* Delegation Tracking */}
            <div className="bg-indigo-50 p-6 rounded-lg mt-6">
              <h3 className="text-xl font-semibold text-indigo-800 mb-4 flex items-center">
                <span className="text-xl mr-2">🧭</span>
                Delegation Tracking
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="font-mono text-indigo-700">"Who are the top delegates by number of delegators?"</li>
                <li className="font-mono text-indigo-700">"Which tracks did Alice receive delegation for?"</li>
                <li className="font-mono text-indigo-700">"List all addresses that delegated to Bob."</li>
              </ul>
            </div>
          </section>

          {/* Integration */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-4xl mr-3">🧩</span>
              Integration with Polkassembly Platform Docs
            </h2>
            <p className="text-gray-700 mb-6">
              Klara also answers conceptual and platform-level queries from the Polkassembly Platform Documentation. 
              Here are examples by section:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 rounded-lg">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Documentation Area</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Example Questions Klara Can Answer</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Platform Overview</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-900">"What is Polkassembly and how does it connect to Polkadot?"</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">User Authentication</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-900">"How do I sign up with a Web3 wallet?"</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Proposal Management</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-900">"How can I create a bounty proposal?"</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Voting System</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-900">"What does conviction voting mean in OpenGov?"</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Treasury Operations</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-900">"How can I create a proposal with multiple beneficiaries?"</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Delegation System</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-900">"Can I delegate voting power to multiple delegates?"</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Community Features</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-900">"Where can I discuss ongoing referenda?"</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Advanced Features</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-900">"Does Polkassembly support USDT or USDC proposals?"</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">User Journeys</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-900">"What are the steps for a Treasury Beneficiary Journey?"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* How to Interact */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-4xl mr-3">🧠</span>
              How to Interact with Klara
            </h2>

            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-800 mb-3 flex items-center">
                  <span className="text-xl mr-2">🔍</span>
                  General Query
                </h3>
                <p className="text-gray-700 mb-2">Type any natural language question about Polkadot governance, e.g.:</p>
                <p className="font-mono text-blue-700 bg-white p-3 rounded border">"Show me all referenda under Treasury in September 2025."</p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-green-800 mb-3 flex items-center">
                  <span className="text-xl mr-2">🧭</span>
                  Follow-up Contextual Queries
                </h3>
                <p className="text-gray-700 mb-2">Klara remembers context within a session:</p>
                <div className="space-y-2">
                  <p className="font-mono text-green-700 bg-white p-2 rounded border">"Show me the proposals from August."</p>
                  <p className="font-mono text-green-700 bg-white p-2 rounded border">"Now, show only Treasury ones." <span className="text-gray-500">(Klara understands the continuation.)</span></p>
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-purple-800 mb-3 flex items-center">
                  <span className="text-xl mr-2">💡</span>
                  Smart Interpretation
                </h3>
                <p className="text-gray-700 mb-2">Klara understands semantic variations:</p>
                <p className="font-mono text-purple-700 bg-white p-3 rounded border">
                  "Who voted against the staking proposal?"<br/>
                  <span className="text-gray-500 text-sm">(Interpreted as nay votes on proposals containing "staking.")</span>
                </p>
              </div>
            </div>
          </section>

          {/* Data Sources */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-4xl mr-3">🧩</span>
              Data Sources
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">On-chain Data</h3>
                <p className="text-sm text-gray-700">Real-time governance and voting data from Polkadot and Kusama nodes</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <h3 className="text-lg font-semibold text-green-800 mb-3">Off-chain Docs</h3>
                <p className="text-sm text-gray-700">Polkassembly Documentation (Proposal Creation, Voting, Treasury, Delegation, etc.)</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg text-center">
                <h3 className="text-lg font-semibold text-purple-800 mb-3">RAG-based Retrieval</h3>
                <p className="text-sm text-gray-700">Klara uses a Retrieval-Augmented Generation layer for factual accuracy</p>
              </div>
            </div>
          </section>

          {/* Example Workflows */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-4xl mr-3">🛠</span>
              Example Workflows
            </h2>

            <div className="space-y-8">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
                  <span className="text-xl mr-2">🧭</span>
                  Explore Referenda
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="font-mono text-blue-700">"Show me all referenda on Polkadot this month."</p>
                  <p className="font-mono text-blue-700">"Which are in deciding status?"</p>
                  <p className="font-mono text-blue-700">"Get details of referendum 212."</p>
                  <p className="text-gray-600 mt-3">→ Klara fetches metadata, proposer info, current status, and discussion link.</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
                  <span className="text-xl mr-2">📈</span>
                  Analyze Voting Patterns
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="font-mono text-green-700">"List voters of referendum 310."</p>
                  <p className="font-mono text-green-700">"Sort by voting power."</p>
                  <p className="font-mono text-green-700">"Show only those who voted 'aye'."</p>
                  <p className="text-gray-600 mt-3">→ Klara joins flattened_conviction_votes with conviction_vote tables.</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-yellow-800 mb-4 flex items-center">
                  <span className="text-xl mr-2">💰</span>
                  Treasury Research
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="font-mono text-yellow-700">"Show all treasury proposals above 10k DOT."</p>
                  <p className="font-mono text-yellow-700">"Get their beneficiaries and proposal tracks."</p>
                  <p className="font-mono text-yellow-700">"Which were accepted?"</p>
                  <p className="text-gray-600 mt-3">→ Klara cross-checks treasury referenda and proposal lifecycle.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Tips */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-4xl mr-3">🧩</span>
              Tips for Best Results
            </h2>

            <div className="bg-green-50 p-6 rounded-lg">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 text-xl mr-3">✅</span>
                  <span className="text-gray-700">Use specific keywords like "referenda," "bounty," or "treasury."</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 text-xl mr-3">✅</span>
                  <span className="text-gray-700">Mention network (Polkadot or Kusama) for clarity.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 text-xl mr-3">✅</span>
                  <div className="text-gray-700">
                    <span>Combine filters:</span>
                    <p className="font-mono text-green-700 bg-white p-2 rounded border mt-1">"Show active Treasury proposals on Polkadot in August 2025."</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 text-xl mr-3">✅</span>
                  <span className="text-gray-700">Ask follow-ups naturally—Klara maintains session context.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 text-xl mr-3">✅</span>
                  <span className="text-gray-700">For deep voting analytics, specify conviction or decision type.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Support */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-4xl mr-3">📞</span>
              Support
            </h2>

            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-4">If Klara doesn't return expected data:</p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Ensure your query matches a supported track or proposal type
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Try rephrasing your question in natural terms (e.g., "show all passed referenda")
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Contact Polkassembly AI Team via <a href="https://t.me/+QMh-FsTUcWJjNmI1" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">Telegram</a></span>
                </li>
              </ul>
            </div>
          </section>

        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-white py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-gray-300">
            © 2025 Polkassembly. Klara AI Assistant - Empowering Polkadot Governance.
          </p>
        </div>
      </div>
    </div>
  )
}

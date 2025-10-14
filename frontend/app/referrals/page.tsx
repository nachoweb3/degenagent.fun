'use client';

import ReferralDashboard from '../../components/ReferralDashboard';

export default function ReferralsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <ReferralDashboard />
      </div>
    </div>
  );
}

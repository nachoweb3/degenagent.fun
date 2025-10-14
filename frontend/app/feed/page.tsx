'use client';

import SocialFeed from '../../components/SocialFeed';

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <SocialFeed />
      </div>
    </div>
  );
}

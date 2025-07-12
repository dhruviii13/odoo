import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            SkillMate - Skill Swap Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect with others to exchange skills and knowledge
          </p>
          
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-md mx-auto">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Admin Access</h2>
              <p className="text-sm text-gray-500 mb-4">
                Access the admin panel to manage users, skills, and platform activity
              </p>
              <Link
                href="/admin"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go to Admin Panel
              </Link>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>This is a demo of the SkillMate admin system.</p>
              <p>Features include: User management, skill moderation, swap monitoring, and platform messaging.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

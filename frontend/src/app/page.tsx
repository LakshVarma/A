import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Agentic Workflow System
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          A modern, efficient agentic workflow system that integrates AI capabilities with powerful workflow orchestration.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/sign-in" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
          <Link 
            href="/sign-up" 
            className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-blue-200"
          >
            Sign Up
          </Link>
        </div>
      </div>
      
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-3 text-gray-900">Multi-Agent Orchestration</h2>
          <p className="text-gray-600">
            Coordinate multiple AI agents to work together on complex tasks with sophisticated workflow management.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-3 text-gray-900">AI Integration</h2>
          <p className="text-gray-600">
            Seamlessly integrate with Google AI Studio, NVIDIA AI, and other leading AI providers.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-3 text-gray-900">Zapier Integration</h2>
          <p className="text-gray-600">
            Connect with thousands of apps and services through Zapier integration for unlimited automation possibilities.
          </p>
        </div>
      </div>
    </main>
  );
}

import { useState, useEffect } from 'react';
import { MindMap } from './components/MindMap';
import { MindMapData } from './components/MindMap/types';
import { ApiService } from './services/api';
import { Login } from './components/auth/Login';
import { supabase } from './services/supabase';

function App() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('Checking authentication status...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session check error:', error);
        setIsAuthenticated(false);
        return;
      }

      console.log('Current session:', session);
      if (session?.access_token) {
        console.log('User is authenticated with token');
        setIsAuthenticated(true);
      } else {
        console.log('No active session found');
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setIsAuthenticated(false);
    } finally {
      setAuthChecking(false);
    }
  };

  const handleGenerateMindMap = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Generating mind map for topic:', topic);
      const data = await ApiService.generateMindMap(topic);
      console.log('Mind map generated:', data);
      setMindMapData(data);
    } catch (err) {
      console.error('Mind map generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate mind map');
    } finally {
      setLoading(false);
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Interactive Study Mind Map
          </h1>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-gray-600 hover:text-gray-900"
          >
            Sign Out
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
                Topic
              </label>
              <input
                type="text"
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter a topic..."
              />
            </div>
            <button
              onClick={handleGenerateMindMap}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Mind Map'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-8">
            {error}
          </div>
        )}

        {mindMapData && (
          <div className="bg-white rounded-lg shadow-lg p-6 h-[600px]">
            <MindMap data={mindMapData} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useLocation } from 'wouter';

// A simple API client to handle authenticated requests
const createApiClient = (token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  return {
    get: async (path: string) => {
      const response = await fetch(path, { headers });
      if (!response.ok) throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
      return response.json();
    },
    put: async (path: string, body: any) => {
      const response = await fetch(path, { method: 'PUT', headers, body: JSON.stringify(body) });
      if (!response.ok) throw new Error(`Failed to update ${path}: ${response.statusText}`);
      return response.json();
    },
    del: async (path: string) => {
      const response = await fetch(path, { method: 'DELETE', headers });
      if (!response.ok) throw new Error(`Failed to delete ${path}: ${response.statusText}`);
      return response.json();
    },
  };
};

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [apiClient, setApiClient] = useState<ReturnType<typeof createApiClient> | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('comments');

  const [, setLocation] = useLocation();

  const fetchData = useCallback(async (client: ReturnType<typeof createApiClient>) => {
    try {
      setLoading(true);
      const [commentsRes, suggestionsRes] = await Promise.all([
        client.get('/api/admin/comments'),
        client.get('/api/admin/suggestions'),
      ]);
      setComments(commentsRes.data);
      setSuggestions(suggestionsRes.data);
    } catch (err: any) {
      setError(err.message);
      if (err.message.includes('403')) {
        setError("Access denied. You might not have admin privileges.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const token = await currentUser.getIdToken();
        const client = createApiClient(token);
        setApiClient(client);
        fetchData(client);
      } else {
        setLocation('/login');
      }
    });
    return () => unsubscribe();
  }, [auth, setLocation, fetchData]);

  const handleLogout = async () => {
    await signOut(auth);
    setLocation('/login');
  };

  const handleApproveComment = async (id: string) => {
    if (!apiClient) return;
    try {
      await apiClient.put(`/api/admin/comments/${id}`, { approved: true });
      fetchData(apiClient); // Refresh data
    } catch (error) {
      console.error("Failed to approve comment:", error);
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!apiClient || !window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await apiClient.del(`/api/admin/comments/${id}`);
      fetchData(apiClient); // Refresh data
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const handleUpdateSuggestionStatus = async (id: string, status: string) => {
    if (!apiClient) return;
    try {
      await apiClient.put(`/api/admin/suggestions/${id}`, { status });
      fetchData(apiClient); // Refresh data
    } catch (error) {
      console.error("Failed to update suggestion:", error);
    }
  };

  const handleApproveSuggestion = async (id: string) => {
    if (!apiClient) return;
    try {
      await apiClient.put(`/api/admin/suggestions/${id}`, { isApproved: true });
      fetchData(apiClient); // Refresh data
    } catch (error) {
      console.error("Failed to approve suggestion:", error);
    }
  };

  const handleDeleteSuggestion = async (id: string) => {
    if (!apiClient || !window.confirm("Are you sure you want to delete this suggestion?")) return;
    try {
      await apiClient.del(`/api/admin/suggestions/${id}`);
      fetchData(apiClient); // Refresh data
    } catch (error) {
      console.error("Failed to delete suggestion:", error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading Admin Dashboard...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm hidden sm:inline">Welcome, {user?.email}</span>
            <button onClick={handleLogout} className="text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md">
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex flex-wrap space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('comments')}
              className={`${
                activeTab === 'comments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Comments ({comments.length})
            </button>
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`${
                activeTab === 'suggestions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Suggestions ({suggestions.length})
            </button>
          </nav>
        </div>

        <div className="mt-8">
          {activeTab === 'comments' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <ul className="divide-y divide-gray-200">
                {comments.map(comment => (
                  <li key={comment.id} className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-600 truncate">{comment.author} ({comment.email})</p>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${comment.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {comment.approved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{comment.content}</p>
                    <div className="mt-4 flex space-x-2">
                      {!comment.approved && (
                        <button onClick={() => handleApproveComment(comment.id)} className="text-xs font-medium text-white bg-green-600 hover:bg-green-700 px-2 py-1 rounded-md">
                          Approve
                        </button>
                      )}
                      <button onClick={() => handleDeleteComment(comment.id)} className="text-xs font-medium text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded-md">
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'suggestions' && (
             <div className="bg-white shadow overflow-hidden sm:rounded-lg">
               <ul className="divide-y divide-gray-200">
                {suggestions.map(suggestion => (
                  <li key={suggestion.id} className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-600">{suggestion.title}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${suggestion.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {suggestion.isApproved ? 'Approved' : 'Pending'}
                        </span>
                        <span className="text-xs text-gray-500">{suggestion.status}</span>
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-800">by {suggestion.author}</p>
                    <p className="mt-2 text-sm text-gray-600">{suggestion.description}</p>
                     <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                       <div className="flex-1">
                        <label className="text-xs font-medium mr-2">Status:</label>
                        <select onChange={(e) => handleUpdateSuggestionStatus(suggestion.id, e.target.value)} value={suggestion.status} className="ml-2 text-xs border-gray-300 rounded-md">
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="rejected">Rejected</option>
                        </select>
                       </div>
                       <div className="flex space-x-2">
                        {!suggestion.isApproved && (
                          <button onClick={() => handleApproveSuggestion(suggestion.id)} className="text-xs font-medium text-white bg-green-600 hover:bg-green-700 px-2 py-1 rounded-md">
                            Approve
                          </button>
                        )}
                        <button onClick={() => handleDeleteSuggestion(suggestion.id)} className="text-xs font-medium text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded-md">
                          Delete
                        </button>
                       </div>
                     </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

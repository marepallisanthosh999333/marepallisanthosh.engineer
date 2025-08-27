import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { FilterSettings } from '../components/ColorFilter';
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
    post: async (path: string, body: any) => {
      const response = await fetch(path, { method: 'POST', headers, body: JSON.stringify(body) });
      if (!response.ok) throw new Error(`Failed to post to ${path}: ${response.statusText}`);
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
  const [commentReplies, setCommentReplies] = useState<Record<string, any[]>>({});
  const [suggestionReplies, setSuggestionReplies] = useState<Record<string, any[]>>({});
  const [openRepliesFor, setOpenRepliesFor] = useState<{ type: 'comment' | 'suggestion'; id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('comments');
  const defaultFilters: FilterSettings = { hue: 0, saturate: 100, brightness: 100, contrast: 100, sepia: 0 };
  const [siteFilters, setSiteFilters] = useState<FilterSettings | null>(null);
  const [savingSiteFilters, setSavingSiteFilters] = useState(false);
  const [saveResult, setSaveResult] = useState<string | null>(null);

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

  const fetchCommentReplies = async (client: ReturnType<typeof createApiClient>, commentId: string) => {
    try {
      const res = await client.get(`/api/admin/comments/${commentId}/replies`);
      setCommentReplies(prev => ({ ...prev, [commentId]: res.data }));
    } catch (err) {
      console.error('Failed to fetch comment replies:', err);
    }
  };

  const fetchSuggestionReplies = async (client: ReturnType<typeof createApiClient>, suggestionId: string) => {
    try {
      const res = await client.get(`/api/admin/suggestions/${suggestionId}/replies`);
      setSuggestionReplies(prev => ({ ...prev, [suggestionId]: res.data }));
    } catch (err) {
      console.error('Failed to fetch suggestion replies:', err);
    }
  };

  const handleApproveReply = async (path: string) => {
    if (!apiClient) return;
    try {
      await apiClient.put(path, { approved: true });
      // Refresh lists
      if (openRepliesFor) {
        if (openRepliesFor.type === 'comment') await fetchCommentReplies(apiClient, openRepliesFor.id);
        else await fetchSuggestionReplies(apiClient, openRepliesFor.id);
      }
      fetchData(apiClient);
    } catch (err) {
      console.error('Failed to approve reply:', err);
    }
  };

  const handleDeleteReply = async (path: string) => {
    if (!apiClient || !window.confirm('Delete this reply?')) return;
    try {
      await apiClient.del(path);
      if (openRepliesFor) {
        if (openRepliesFor.type === 'comment') await fetchCommentReplies(apiClient, openRepliesFor.id);
        else await fetchSuggestionReplies(apiClient, openRepliesFor.id);
      }
      fetchData(apiClient);
    } catch (err) {
      console.error('Failed to delete reply:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const token = await currentUser.getIdToken();
        const client = createApiClient(token);
        setApiClient(client);
        fetchData(client);
        // fetch existing site settings for admin editor
        try {
          const res = await client.get('/api/site-settings');
          const payload = res?.data ?? res?.settings ?? res;
          const filters = payload?.filters ?? payload ?? defaultFilters;
          setSiteFilters(filters);
        } catch (e) {
          // ignore — admin can still edit
          setSiteFilters(defaultFilters);
        }
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

  const handlePinComment = async (id: string) => {
    if (!apiClient) return;
    try {
      // We use post for a toggle action, body can be empty
      await apiClient.post(`/api/admin/comments/${id}/pin`, {});
      fetchData(apiClient); // Refresh data to get new order
    } catch (error) {
      console.error("Failed to pin comment:", error);
    }
  };

  const handleSaveSiteFilters = async () => {
    if (!apiClient || !siteFilters) return;
    setSavingSiteFilters(true);
    setSaveResult('Saving...');
    // Optimistic: broadcast new settings to other open tabs so they can apply immediately
    try {
      const optimisticPayload = { filters: siteFilters, ts: Date.now(), optimistic: true };
      try { localStorage.setItem('site-settings-updated', JSON.stringify(optimisticPayload)); } catch {}

      // Send to server
      await apiClient.put('/api/admin/site-settings', { filters: siteFilters });

  // Confirmed: broadcast confirmed update and persist a confirmed cache so visitors don't flash
  const confirmedPayload = { filters: siteFilters, ts: Date.now(), optimistic: false };
  try { localStorage.setItem('site-settings-updated', JSON.stringify(confirmedPayload)); } catch {}
  try { localStorage.setItem('site-settings-confirmed', JSON.stringify(siteFilters)); } catch {}

  setSaveResult('Saved');
    } catch (err: any) {
      console.error('Failed to save site settings', err);
      setSaveResult(err?.message ?? 'Failed to save');
      // Notify other tabs of failure so they can refetch
      try { localStorage.setItem('site-settings-update-failed', JSON.stringify({ ts: Date.now() })); } catch {}
    } finally {
      setSavingSiteFilters(false);
      setTimeout(() => setSaveResult(null), 3000);
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
        {/* Admin site settings editor */}
        <section className="mb-6">
          <div className="bg-white shadow sm:rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Site Settings</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setSiteFilters(defaultFilters)} className="text-sm px-3 py-1 bg-gray-100 rounded">Reset</button>
                <button onClick={handleSaveSiteFilters} disabled={savingSiteFilters} className="text-sm px-3 py-1 bg-blue-600 text-white rounded">{savingSiteFilters ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-600">Configure site-wide color filters that apply to all visitors.</p>
              <div className="mt-3">
                {siteFilters ? (
                  <div className="space-y-3">
                    {/* Inline slider controls similar to ColorFilter */}
                    <div className="text-xs">
                      <label className="block mb-1">Hue: <span className="font-mono">{siteFilters.hue}°</span></label>
                      <input type="range" min={0} max={360} value={siteFilters.hue} onChange={e => setSiteFilters({ ...siteFilters, hue: Number(e.target.value) })} className="w-full" />
                    </div>

                    <div className="text-xs">
                      <label className="block mb-1">Saturate: <span className="font-mono">{siteFilters.saturate}%</span></label>
                      <input type="range" min={0} max={300} value={siteFilters.saturate} onChange={e => setSiteFilters({ ...siteFilters, saturate: Number(e.target.value) })} className="w-full" />
                    </div>

                    <div className="text-xs">
                      <label className="block mb-1">Brightness: <span className="font-mono">{siteFilters.brightness}%</span></label>
                      <input type="range" min={0} max={200} value={siteFilters.brightness} onChange={e => setSiteFilters({ ...siteFilters, brightness: Number(e.target.value) })} className="w-full" />
                    </div>

                    <div className="text-xs">
                      <label className="block mb-1">Contrast: <span className="font-mono">{siteFilters.contrast}%</span></label>
                      <input type="range" min={0} max={200} value={siteFilters.contrast} onChange={e => setSiteFilters({ ...siteFilters, contrast: Number(e.target.value) })} className="w-full" />
                    </div>

                    <div className="text-xs">
                      <label className="block mb-1">Sepia: <span className="font-mono">{siteFilters.sepia}%</span></label>
                      <input type="range" min={0} max={100} value={siteFilters.sepia} onChange={e => setSiteFilters({ ...siteFilters, sepia: Number(e.target.value) })} className="w-full" />
                    </div>

                    <div className="mt-2">
                      <div className="text-xs font-semibold mb-2">Presets</div>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => setSiteFilters({ hue: 0, saturate: 100, brightness: 100, contrast: 100, sepia: 0 })} className="px-2 py-1 text-xs bg-gray-100 rounded border">Default</button>
                        <button onClick={() => setSiteFilters({ hue: 15, saturate: 120, brightness: 105, contrast: 105, sepia: 6 })} className="px-2 py-1 text-xs bg-gray-100 rounded border">Warm</button>
                        <button onClick={() => setSiteFilters({ hue: 200, saturate: 120, brightness: 95, contrast: 100, sepia: 0 })} className="px-2 py-1 text-xs bg-gray-100 rounded border">Cool</button>
                        <button onClick={() => setSiteFilters({ hue: 0, saturate: 140, brightness: 100, contrast: 130, sepia: 0 })} className="px-2 py-1 text-xs bg-gray-100 rounded border">High Contrast</button>
                        <button onClick={() => setSiteFilters({ hue: 0, saturate: 0, brightness: 100, contrast: 110, sepia: 0 })} className="px-2 py-1 text-xs bg-gray-100 rounded border">Monochrome</button>
                      </div>
                    </div>

                    {saveResult && <div className="mt-2 text-sm text-green-600">{saveResult}</div>}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Loading settings...</div>
                )}
              </div>
            </div>
          </div>
        </section>
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
                  <li key={comment.id} className="p-4 sm:p-6 relative">
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
                      <button onClick={() => handlePinComment(comment.id)} className="text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded-md flex items-center">
                        {comment.isPinned ? 'Unpin' : 'Pin'}
                      </button>
                      <button onClick={async () => {
                        const target = { type: 'comment', id: comment.id } as const;
                        setOpenRepliesFor(target);
                        if (apiClient) await fetchCommentReplies(apiClient, comment.id);
                      }} className="text-xs font-medium text-white bg-gray-500 hover:bg-gray-600 px-2 py-1 rounded-md">
                        Manage Replies
                      </button>
                    </div>
                    {comment.isPinned && <div className="absolute top-2 right-2 text-blue-500" title="Pinned"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17v5"/><path d="M12 9v8"/><path d="M16 9h-2a2 2 0 0 0-4 0H8"/><path d="M16 4L9 4"/><path d="M16 4L9 4"/><path d="M12 2L12 4"/></svg></div>}
                    {openRepliesFor && openRepliesFor.type === 'comment' && openRepliesFor.id === comment.id && (
                      <div className="mt-3 bg-gray-50 p-3 rounded">
                        <h4 className="text-sm font-semibold">Replies</h4>
                        <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-2">
                          {(commentReplies[comment.id] && commentReplies[comment.id].length > 0) ? (
                            commentReplies[comment.id].map(r => (
                              <div key={r.id} className="p-2 bg-white rounded border border-gray-200">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="text-sm font-medium">{r.author} {r.email ? `(${r.email})` : ''}</div>
                                    <div className="text-xs text-gray-500">{r.timestamp}</div>
                                  </div>
                                  <div className="flex space-x-2">
                                    {!r.approved && <button onClick={() => handleApproveReply(`/api/admin/comments/${comment.id}/replies/${r.id}`)} className="text-xs font-medium text-white bg-green-600 px-2 py-1 rounded-md">Approve</button>}
                                    <button onClick={() => handleDeleteReply(`/api/admin/comments/${comment.id}/replies/${r.id}`)} className="text-xs font-medium text-white bg-red-500 px-2 py-1 rounded-md">Delete</button>
                                  </div>
                                </div>
                                <p className="mt-2 text-sm text-gray-700">{r.content}</p>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-gray-500">No replies yet.</div>
                          )}
                        </div>
                      </div>
                    )}
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
                        <button onClick={async () => {
                          const target = { type: 'suggestion', id: suggestion.id } as const;
                          setOpenRepliesFor(target);
                          if (apiClient) await fetchSuggestionReplies(apiClient, suggestion.id);
                        }} className="text-xs font-medium text-white bg-gray-500 hover:bg-gray-600 px-2 py-1 rounded-md">
                          Manage Replies
                        </button>
                       </div>
                     </div>
                      {openRepliesFor && openRepliesFor.type === 'suggestion' && openRepliesFor.id === suggestion.id && (
                        <div className="mt-3 bg-gray-50 p-3 rounded">
                          <h4 className="text-sm font-semibold">Replies</h4>
                          <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-2">
                            {(suggestionReplies[suggestion.id] && suggestionReplies[suggestion.id].length > 0) ? (
                              suggestionReplies[suggestion.id].map(r => (
                                <div key={r.id} className="p-2 bg-white rounded border border-gray-200">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <div className="text-sm font-medium">{r.author} {r.email ? `(${r.email})` : ''}</div>
                                      <div className="text-xs text-gray-500">{r.timestamp}</div>
                                    </div>
                                    <div className="flex space-x-2">
                                      {!r.approved && <button onClick={() => handleApproveReply(`/api/admin/suggestions/${suggestion.id}/replies/${r.id}`)} className="text-xs font-medium text-white bg-green-600 px-2 py-1 rounded-md">Approve</button>}
                                      <button onClick={() => handleDeleteReply(`/api/admin/suggestions/${suggestion.id}/replies/${r.id}`)} className="text-xs font-medium text-white bg-red-500 px-2 py-1 rounded-md">Delete</button>
                                    </div>
                                  </div>
                                  <p className="mt-2 text-sm text-gray-700">{r.content}</p>
                                </div>
                              ))
                            ) : (
                              <div className="text-sm text-gray-500">No replies yet.</div>
                            )}
                          </div>
                        </div>
                      )}
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

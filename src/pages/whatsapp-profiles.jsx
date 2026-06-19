import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiUpload, FiSearch, FiRefreshCw, FiChevronLeft, FiChevronRight, FiX, FiCheck, FiAlertCircle, FiTrash2, FiMoreVertical } from "react-icons/fi";
import { useRouter } from "next/router";

const API_BASE = "https://chat-back-ymlq.onrender.com";

export default function WhatsAppProfiles() {
  const router = useRouter();
  
  // Input state
  const [phoneInput, setPhoneInput] = useState("");
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  
  // Job state
  const [currentJob, setCurrentJob] = useState(null);
  const [jobProgress, setJobProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pollIntervalRef = useRef(null);
  
  // Results state
  const [results, setResults] = useState([]);
  const [resultsPagination, setResultsPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  
  // All profiles state
  const [allProfiles, setAllProfiles] = useState([]);
  const [profilesPagination, setProfilesPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  
  // View mode
  const [viewMode, setViewMode] = useState("batch"); // "batch" | "all"
  
  // Lightbox state
  const [lightboxImage, setLightboxImage] = useState(null);
  
  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ open: false, type: null, data: null });
  const [isDeleting, setIsDeleting] = useState(false);
  
  // File input ref
  const fileInputRef = useRef(null);

  // Load phone numbers from file (file picker)
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setIsLoadingFile(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target.result;
      setPhoneInput(text.trim());
      toast.success(`Loaded ${file.name}`);
      setIsLoadingFile(false);
    };
    
    reader.onerror = () => {
      console.error("Failed to read file");
      toast.error("Failed to read file");
      setIsLoadingFile(false);
    };
    
    reader.readAsText(file);
    // Reset input so same file can be selected again
    event.target.value = "";
  };
  
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // Parse phone numbers from input
  const parsePhoneNumbers = (input) => {
    return input
      .split(/[\n,;]+/)
      .map((num) => num.replace(/[^\d+]/g, "").trim())
      .filter((num) => num.length > 0);
  };

  // Start batch job
  const startBatchJob = async () => {
    const phoneNumbers = parsePhoneNumbers(phoneInput);
    
    if (phoneNumbers.length === 0) {
      toast.error("Please enter at least one phone number");
      return;
    }
    
    if (phoneNumbers.length > 1000) {
      toast.error("Maximum 1000 numbers per batch");
      return;
    }

    setIsSubmitting(true);
    setResults([]);
    setJobProgress(0);

    try {
      const response = await axios.post(`${API_BASE}/api/whatsapp-profiles/batch`, {
        phone_numbers: phoneNumbers,
      });

      const { jobId, totalCount, status, message } = response.data;
      
      setCurrentJob({ jobId, totalCount, status });
      toast.success(message || "Batch job started");
      
      // Start polling for progress
      startPolling(jobId);
    } catch (err) {
      console.error("Failed to start batch job:", err);
      toast.error(err.response?.data?.message || "Failed to start batch job");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Poll job status
  const startPolling = (jobId) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/whatsapp-profiles/jobs/${jobId}`);
        const { processedCount, totalCount, progress, status } = response.data;

        setJobProgress(progress || Math.round((processedCount / totalCount) * 100));
        setCurrentJob((prev) => ({ ...prev, ...response.data }));

        if (status === "completed" || status === "failed") {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;

          if (status === "completed") {
            toast.success("Batch job completed!");
            fetchJobResults(jobId, 1);
          } else {
            toast.error("Batch job failed");
          }
        }
      } catch (err) {
        console.error("Failed to poll job status:", err);
      }
    }, 2000);
  };

  // Fetch job results
  const fetchJobResults = async (jobId, page = 1) => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/whatsapp-profiles/jobs/${jobId}/results?page=${page}&limit=50`
      );
      
      setResults(response.data.profiles || []);
      setResultsPagination(response.data.pagination || { page, limit: 50, total: 0, totalPages: 0 });
    } catch (err) {
      console.error("Failed to fetch job results:", err);
      toast.error("Failed to fetch results");
    }
  };

  // Fetch all saved profiles
  const fetchAllProfiles = useCallback(async (page = 1, status = statusFilter) => {
    setIsLoadingProfiles(true);
    try {
      let url = `${API_BASE}/api/whatsapp-profiles?page=${page}&limit=50`;
      if (status !== "all") {
        url += `&status=${status}`;
      }
      
      const response = await axios.get(url);
      setAllProfiles(response.data.profiles || []);
      setProfilesPagination(response.data.pagination || { page, limit: 50, total: 0, totalPages: 0 });
    } catch (err) {
      console.error("Failed to fetch profiles:", err);
      toast.error("Failed to fetch profiles");
    } finally {
      setIsLoadingProfiles(false);
    }
  }, [statusFilter]);

  // Handle status filter change
  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    fetchAllProfiles(1, newStatus);
  };

  // Delete single profile
  const deleteSingleProfile = async (phoneNumber) => {
    setIsDeleting(true);
    try {
      await axios.delete(`${API_BASE}/api/whatsapp-profiles/${phoneNumber}`);
      toast.success(`Profile ${phoneNumber} deleted`);
      setDeleteModal({ open: false, type: null, data: null });
      // Refresh data
      if (viewMode === "all") {
        fetchAllProfiles(profilesPagination.page);
      } else if (currentJob?.jobId) {
        fetchJobResults(currentJob.jobId, resultsPagination.page);
      }
    } catch (err) {
      console.error("Failed to delete profile:", err);
      toast.error(err.response?.data?.message || "Failed to delete profile");
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete entire job and its profiles
  const deleteJob = async (jobId) => {
    setIsDeleting(true);
    try {
      await axios.delete(`${API_BASE}/api/whatsapp-profiles/jobs/${jobId}`);
      toast.success("Job and all its profiles deleted");
      setDeleteModal({ open: false, type: null, data: null });
      setCurrentJob(null);
      setResults([]);
      if (viewMode === "all") {
        fetchAllProfiles(1);
      }
    } catch (err) {
      console.error("Failed to delete job:", err);
      toast.error(err.response?.data?.message || "Failed to delete job");
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete all profiles
  const deleteAllProfiles = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`${API_BASE}/api/whatsapp-profiles`);
      toast.success("All profiles deleted");
      setDeleteModal({ open: false, type: null, data: null });
      setAllProfiles([]);
      setResults([]);
      setCurrentJob(null);
      setProfilesPagination({ page: 1, limit: 50, total: 0, totalPages: 0 });
    } catch (err) {
      console.error("Failed to delete all profiles:", err);
      toast.error(err.response?.data?.message || "Failed to delete all profiles");
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete only invalid profiles
  const deleteInvalidProfiles = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`${API_BASE}/api/whatsapp-profiles?status=invalid`);
      toast.success("Invalid profiles deleted");
      setDeleteModal({ open: false, type: null, data: null });
      if (viewMode === "all") {
        fetchAllProfiles(1);
      }
    } catch (err) {
      console.error("Failed to delete invalid profiles:", err);
      toast.error(err.response?.data?.message || "Failed to delete invalid profiles");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    switch (deleteModal.type) {
      case "single":
        deleteSingleProfile(deleteModal.data);
        break;
      case "job":
        deleteJob(deleteModal.data);
        break;
      case "all":
        deleteAllProfiles();
        break;
      case "invalid":
        deleteInvalidProfiles();
        break;
      default:
        break;
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Fetch all profiles when switching to "all" view
  useEffect(() => {
    if (viewMode === "all") {
      fetchAllProfiles(1);
    }
  }, [viewMode, fetchAllProfiles]);

  // Get status badge
  const getStatusBadge = (status, isValid) => {
    if (status === "valid" || isValid === true) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">
          <FiCheck size={12} /> Valid
        </span>
      );
    } else if (status === "invalid" || isValid === false) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-full">
          <FiX size={12} /> Invalid
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-400 rounded-full">
          <FiAlertCircle size={12} /> Error
        </span>
      );
    }
  };

  // Get proxy image URL
  const getProxyImageUrl = (url) => {
    if (!url) return null;
    return `${API_BASE}/api/proxy-image?url=${encodeURIComponent(url)}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-panel-header-background text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-dropdown-background rounded-lg transition-colors"
            >
              <FiChevronLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold">WhatsApp Profile Lookup</h1>
          </div>
          
          {/* View Toggle */}
          <div className="flex bg-dropdown-background rounded-lg p-1">
            <button
              onClick={() => setViewMode("batch")}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === "batch"
                  ? "bg-teal-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Batch Lookup
            </button>
            <button
              onClick={() => setViewMode("all")}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === "all"
                  ? "bg-teal-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              All Profiles
            </button>
          </div>
        </div>

        {viewMode === "batch" ? (
          <>
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".txt,.csv"
              className="hidden"
            />
            
            {/* Input Section */}
            <div className="bg-dropdown-background rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Phone Numbers</h2>
                <button
                  onClick={openFilePicker}
                  disabled={isLoadingFile}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  <FiUpload size={18} />
                  {isLoadingFile ? "Loading..." : "Load from File"}
                </button>
              </div>
              
              <textarea
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="Enter phone numbers (one per line or comma-separated)&#10;Example:&#10;+1234567890&#10;+0987654321"
                className="w-full h-48 bg-input-background border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-teal-500"
              />
              
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-400">
                  {parsePhoneNumbers(phoneInput).length} numbers entered (max 1000)
                </span>
                <button
                  onClick={startBatchJob}
                  disabled={isSubmitting || parsePhoneNumbers(phoneInput).length === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiSearch size={18} />
                  {isSubmitting ? "Starting..." : "Start Batch Lookup"}
                </button>
              </div>
            </div>

            {/* Progress Section */}
            {currentJob && (
              <div className="bg-dropdown-background rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Job Progress</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentJob.status === "completed"
                      ? "bg-green-500/20 text-green-400"
                      : currentJob.status === "failed"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}>
                    {currentJob.status?.toUpperCase()}
                  </span>
                </div>
                
                <div className="relative w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-500"
                    style={{ width: `${jobProgress}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between mt-2 text-sm text-gray-400">
                  <span>
                    Processed: {currentJob.processedCount || 0} / {currentJob.totalCount}
                  </span>
                  <span className="font-semibold text-white">{jobProgress}%</span>
                </div>
              </div>
            )}

            {/* Results Section */}
            {results.length > 0 && (
              <div className="bg-dropdown-background rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Results ({resultsPagination.total || results.length})</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => currentJob?.jobId && fetchJobResults(currentJob.jobId, resultsPagination.page)}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <FiRefreshCw size={16} />
                      Refresh
                    </button>
                    {currentJob?.jobId && (
                      <button
                        onClick={() => setDeleteModal({ open: true, type: "job", data: currentJob.jobId })}
                        className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                      >
                        <FiTrash2 size={16} />
                        Delete Job
                      </button>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Phone Number</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Profile Picture</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((profile, index) => (
                        <tr key={profile.id || index} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                          <td className="py-3 px-4 font-mono">{profile.phoneNumber}</td>
                          <td className="py-3 px-4">
                            {profile.pictureUrl ? (
                              <img
                                src={getProxyImageUrl(profile.pictureUrl)}
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-teal-500 transition-all"
                                onClick={() => setLightboxImage(getProxyImageUrl(profile.pictureUrl))}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-gray-400">
                                ?
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">{getStatusBadge(profile.status, profile.isValid)}</td>
                          <td className="py-3 px-4 text-sm text-gray-400">{formatDate(profile.createdAt)}</td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => setDeleteModal({ open: true, type: "single", data: profile.phoneNumber })}
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="Delete profile"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {resultsPagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                    <span className="text-sm text-gray-400">
                      Page {resultsPagination.page} of {resultsPagination.totalPages}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => fetchJobResults(currentJob.jobId, resultsPagination.page - 1)}
                        disabled={resultsPagination.page <= 1}
                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiChevronLeft size={18} />
                      </button>
                      <button
                        onClick={() => fetchJobResults(currentJob.jobId, resultsPagination.page + 1)}
                        disabled={resultsPagination.page >= resultsPagination.totalPages}
                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* All Profiles View */
          <div className="bg-dropdown-background rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">All Saved Profiles</h2>
              <div className="flex items-center gap-4">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                  className="bg-input-background border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="all">All Status</option>
                  <option value="valid">Valid</option>
                  <option value="invalid">Invalid</option>
                  <option value="error">Error</option>
                </select>
                
                <button
                  onClick={() => fetchAllProfiles(profilesPagination.page)}
                  disabled={isLoadingProfiles}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <FiRefreshCw size={16} className={isLoadingProfiles ? "animate-spin" : ""} />
                  Refresh
                </button>
                
                {/* Delete Options Dropdown */}
                <div className="relative group">
                  <button
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    <FiTrash2 size={16} />
                    Delete
                    <FiMoreVertical size={14} />
                  </button>
                  <div className="absolute right-0 mt-1 w-48 bg-dropdown-background border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button
                      onClick={() => setDeleteModal({ open: true, type: "invalid", data: null })}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-t-lg"
                    >
                      Delete Invalid Only
                    </button>
                    <button
                      onClick={() => setDeleteModal({ open: true, type: "all", data: null })}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-b-lg"
                    >
                      Delete All Profiles
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {isLoadingProfiles ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
              </div>
            ) : allProfiles.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Phone Number</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Profile Picture</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Job ID</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Created</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Updated</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allProfiles.map((profile, index) => (
                        <tr key={profile.id || index} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                          <td className="py-3 px-4 font-mono">{profile.phoneNumber}</td>
                          <td className="py-3 px-4">
                            {profile.pictureUrl ? (
                              <img
                                src={getProxyImageUrl(profile.pictureUrl)}
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-teal-500 transition-all"
                                onClick={() => setLightboxImage(getProxyImageUrl(profile.pictureUrl))}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-gray-400">
                                ?
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">{getStatusBadge(profile.status, profile.isValid)}</td>
                          <td className="py-3 px-4 text-xs text-gray-500 font-mono">
                            {profile.jobId ? profile.jobId.slice(0, 8) + "..." : "-"}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-400">{formatDate(profile.createdAt)}</td>
                          <td className="py-3 px-4 text-sm text-gray-400">{formatDate(profile.updatedAt)}</td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => setDeleteModal({ open: true, type: "single", data: profile.phoneNumber })}
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="Delete profile"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {profilesPagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                    <span className="text-sm text-gray-400">
                      Page {profilesPagination.page} of {profilesPagination.totalPages} ({profilesPagination.total} total)
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => fetchAllProfiles(profilesPagination.page - 1)}
                        disabled={profilesPagination.page <= 1}
                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiChevronLeft size={18} />
                      </button>
                      <button
                        onClick={() => fetchAllProfiles(profilesPagination.page + 1)}
                        disabled={profilesPagination.page >= profilesPagination.totalPages}
                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p>No profiles found</p>
                <p className="text-sm mt-2">Run a batch lookup to start collecting profiles</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <FiX size={28} />
          </button>
          <img
            src={lightboxImage}
            alt="Profile Full View"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => !isDeleting && setDeleteModal({ open: false, type: null, data: null })}
        >
          <div
            className="bg-dropdown-background rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-500/20 rounded-full">
                <FiTrash2 size={24} className="text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Confirm Delete</h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              {deleteModal.type === "single" && (
                <>Are you sure you want to delete the profile for <span className="font-mono text-white">{deleteModal.data}</span>?</>
              )}
              {deleteModal.type === "job" && (
                <>Are you sure you want to delete this job and all {results.length} associated profiles?</>
              )}
              {deleteModal.type === "all" && (
                <>Are you sure you want to delete <span className="text-red-400 font-semibold">ALL</span> saved profiles? This action cannot be undone.</>
              )}
              {deleteModal.type === "invalid" && (
                <>Are you sure you want to delete all <span className="text-red-400 font-semibold">INVALID</span> profiles?</>
              )}
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ open: false, type: null, data: null })}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 size={16} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

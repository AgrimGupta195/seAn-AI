import React, { useState } from 'react';
import { Link2, FileText, Video, Upload, X, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import axiosInstance from '../lib/axios';

export default function UploadPage() {
  const [activeTab, setActiveTab] = useState('youtube');
  const [youtubeUrls, setYoutubeUrls] = useState(['']);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loadingSubtitles, setLoadingSubtitles] = useState(false);
  const [subtitleFiles, setSubtitleFiles] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const showError = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 5000);
  };

  const addYoutubeUrlField = () => {
    setYoutubeUrls([...youtubeUrls, '']);
  };

  const updateYoutubeUrl = (index, value) => {
    const newUrls = [...youtubeUrls];
    newUrls[index] = value;
    setYoutubeUrls(newUrls);
  };

  const removeYoutubeUrl = (index) => {
    setYoutubeUrls(youtubeUrls.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files);
    setSelectedVideos([...selectedVideos, ...files]);
  };

  const handleSubtitleUpload = (e) => {
    const files = Array.from(e.target.files);
    const newSubtitles = files.map(file => ({
      file,
      videoLink: ''
    }));
    setSubtitleFiles([...subtitleFiles, ...newSubtitles]);
  };

  const addSubtitleField = () => {
    setSubtitleFiles([...subtitleFiles, {
      file: null,
      videoLink: ''
    }]);
  };

  const updateSubtitleFile = (index, file) => {
    const updated = [...subtitleFiles];
    updated[index].file = file;
    setSubtitleFiles(updated);
  };

  const updateSubtitleVideoLink = (index, value) => {
    const updated = [...subtitleFiles];
    updated[index].videoLink = value;
    setSubtitleFiles(updated);
  };

  const removeSubtitleField = (index) => {
    setSubtitleFiles(subtitleFiles.filter((_, i) => i !== index));
  };

  const handleFileSubmit = async () => {
    if (selectedFiles.length === 0) return;
    setLoadingFiles(true);
    setErrorMessage('');
    try {
      const formData = new FormData();
      selectedFiles.forEach((f) => formData.append('files', f));
      const res = await axiosInstance.post('/uploadFile/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showSuccess(res.data.message || `✅ ${selectedFiles.length} file(s) uploaded and processed successfully!`);
      setSelectedFiles([]);
    } catch (error) {
      showError(error?.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleSubtitleSubmit = async () => {
    if (subtitleFiles.length === 0) return;
    const validFiles = subtitleFiles.filter(item => item.file && item.videoLink.trim());
    
    if (validFiles.length === 0) {
      showError('Please provide both subtitle files and video links');
      return;
    }
    
    setLoadingSubtitles(true);
    setErrorMessage('');
    try {
      const formData = new FormData();
      validFiles.forEach(({ file, videoLink }) => {
        formData.append('files', file);
        formData.append('links', videoLink);
      });

      const res = await axiosInstance.post('/uploadFile/vttsrtUpload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showSuccess(res.data.message || `✅ ${validFiles.length} subtitle file(s) uploaded and processed successfully!`);
      setSubtitleFiles([]);
    } catch (error) {
      showError(error?.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoadingSubtitles(false);
    }
  };

  const removeFile = (index, type) => {
    if (type === 'file') {
      setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    } else {
      setSelectedVideos(selectedVideos.filter((_, i) => i !== index));
    }
  };

  const handleYoutubeSubmit = async () => {
    const validUrls = youtubeUrls.filter(url => url.trim() !== '');
    if (validUrls.length === 0) {
      showError('Please enter at least one YouTube URL');
      return;
    }

    setLoadingVideo(true);
    setErrorMessage('');
    
    try {
      const results = [];
      for (const url of validUrls) {
        const response = await axiosInstance.post('/uploadFile/youtube', {
          video_url: url
        });
        results.push(response.data);
      }
      
      showSuccess(`✅ ${results.length} YouTube video(s) processed successfully!`);
      setYoutubeUrls(['']);
    } catch (error) {
      showError(error?.response?.data?.message || 'Failed to process YouTube video(s)');
    } finally {
      setLoadingVideo(false);
    }
  };

  const handleVideoSubmit = async() => {
    if (selectedVideos.length === 0) return;
    setLoadingVideo(true);
    setErrorMessage('');
    try {
      const formData = new FormData();
      selectedVideos.forEach((video) => {
        formData.append("videos", video);
      });

      const response = await axiosInstance.post('/uploadFile/videoUpload', formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      showSuccess(response.data.message || `✅ ${selectedVideos.length} video(s) uploaded, transcribed, and processed successfully!`);
      setSelectedVideos([]);
    } catch (error) {
      showError(error?.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoadingVideo(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-transparent pt-20 text-slate-200">
      {(successMessage || errorMessage) && (
        <div className="fixed top-24 right-4 z-50 max-w-md">
          {successMessage && (
            <div className="bg-emerald-600/90 border border-emerald-500/80 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 mb-2 animate-slide-in">
              <CheckCircle size={24} />
              <p className="flex-1">{successMessage}</p>
              <button onClick={() => setSuccessMessage('')} className="hover:text-green-200">
                <X size={20} />
              </button>
            </div>
          )}
          {errorMessage && (
            <div className="bg-red-600/90 border border-red-500/80 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in">
              <AlertCircle size={24} />
              <p className="flex-1">{errorMessage}</p>
              <button onClick={() => setErrorMessage('')} className="hover:text-red-200">
                <X size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col items-center py-8 px-4">
        <h1 className="text-4xl sm:text-5xl font-bold bg-linear-to-r from-indigo-400 via-blue-400 to-purple-500 bg-clip-text text-transparent mb-3">
          Upload Content
        </h1>
        <p className="text-lg sm:text-xl text-slate-400">Choose your upload method</p>
      </div>

      <div className="flex border-b border-slate-800 px-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('youtube')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold transition-all whitespace-nowrap ${
            activeTab === 'youtube'
              ? 'border-b-2 border-indigo-500 text-indigo-400 -mb-px'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Link2 size={20} />
          <span className="hidden sm:inline">YouTube</span>
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold transition-all whitespace-nowrap ${
            activeTab === 'files'
              ? 'border-b-2 border-indigo-500 text-indigo-400 -mb-px'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <FileText size={20} />
          <span className="hidden sm:inline">Documents</span>
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold transition-all whitespace-nowrap ${
            activeTab === 'videos'
              ? 'border-b-2 border-indigo-500 text-indigo-400 -mb-px'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Video size={20} />
          <span className="hidden sm:inline">Videos</span>
        </button>
        <button
          onClick={() => setActiveTab('subtitles')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold transition-all whitespace-nowrap ${
            activeTab === 'subtitles'
              ? 'border-b-2 border-indigo-500 text-indigo-400 -mb-px'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <FileText size={20} />
          <span className="hidden sm:inline">Subtitles</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'youtube' && (
            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-400 mb-2 block">
                YouTube Video URLs
              </label>
              <div className="space-y-3 mb-4">
                {youtubeUrls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => updateYoutubeUrl(index, e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="flex-1 bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    {youtubeUrls.length > 1 && (
                      <button
                        onClick={() => removeYoutubeUrl(index)}
                        className="bg-gray-900 border border-gray-700 text-red-400 px-4 rounded-xl hover:bg-gray-800 hover:border-red-500 transition-all"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addYoutubeUrlField}
                className="w-full border border-gray-700 bg-gray-900/50 text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add Another URL
              </button>
              <button
                onClick={handleYoutubeSubmit}
                disabled={youtubeUrls.every(url => !url.trim())}
                className="w-full bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Process YouTube Videos
              </button>
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-700 rounded-2xl p-12 text-center hover:border-blue-500 transition-all cursor-pointer bg-linear-to-br from-gray-900/50 to-gray-800/50">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept=".vtt,.srt,.txt,.doc,.docx,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="bg-linear-to-r from-blue-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload size={40} className="text-white" />
                  </div>
                  <p className="text-2xl font-semibold text-white mb-2">
                    Click to upload documents
                  </p>
                  <p className="text-sm text-gray-400">
                    Supports: VTT, SRT, TXT, DOC, DOCX, PDF
                  </p>
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-400">Selected Files ({selectedFiles.length}):</p>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-900/50 border border-gray-700 p-4 rounded-xl hover:bg-gray-800/50 transition-all"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="bg-blue-500/20 p-2 rounded-lg">
                            <FileText size={20} className="text-blue-400" />
                          </div>
                          <span className="text-sm font-medium text-white truncate">{file.name}</span>
                        </div>
                        <button
                          onClick={() => removeFile(index, 'file')}
                          className="text-red-400 hover:text-red-300 ml-2 flex-shrink-0 p-2 hover:bg-red-900/20 rounded-lg transition-all"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleFileSubmit}
                    disabled={loadingFiles}
                    className="w-full bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingFiles ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Uploading...
                      </span>
                    ) : (
                      `Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-700 rounded-2xl p-12 text-center hover:border-blue-500 transition-all cursor-pointer bg-linear-to-br from-gray-900/50 to-gray-800/50">
                <input
                  type="file"
                  id="video-upload"
                  multiple
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
                <label htmlFor="video-upload" className="cursor-pointer">
                  <div className="bg-linear-to-r from-purple-500 to-pink-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Video size={40} className="text-white" />
                  </div>
                  <p className="text-2xl font-semibold text-white mb-2">
                    Click to upload videos
                  </p>
                  <p className="text-sm text-gray-400">
                    Supports: MP4, AVI, MOV, MKV, and more
                  </p>
                </label>
              </div>

              {selectedVideos.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-400">Selected Videos ({selectedVideos.length}):</p>
                  <div className="space-y-2">
                    {selectedVideos.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-900/50 border border-gray-700 p-4 rounded-xl hover:bg-gray-800/50 transition-all"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="bg-purple-500/20 p-2 rounded-lg">
                            <Video size={20} className="text-purple-400" />
                          </div>
                          <span className="text-sm font-medium text-white truncate">{file.name}</span>
                        </div>
                        <button
                          onClick={() => removeFile(index, 'video')}
                          className="text-red-400 hover:text-red-300 ml-2 flex-shrink-0 p-2 hover:bg-red-900/20 rounded-lg transition-all"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    disabled={loadingVideo}
                    onClick={handleVideoSubmit}
                    className="w-full bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingVideo ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Uploading & Processing...
                      </span>
                    ) : (
                      `Upload ${selectedVideos.length} Video${selectedVideos.length !== 1 ? 's' : ''}`
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'subtitles' && (
            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-400 mb-2 block">
                Upload Subtitle Files with Video Links
              </label>
              
              <div className="space-y-4 mb-4">
                {subtitleFiles.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex gap-2">
                      <input
                        type="file"
                        id={`subtitle-file-${index}`}
                        accept=".vtt,.srt"
                        onChange={(e) => updateSubtitleFile(index, e.target.files[0])}
                        className="hidden"
                      />
                      <label
                        htmlFor={`subtitle-file-${index}`}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm cursor-pointer hover:bg-gray-700 transition-all flex items-center gap-2"
                      >
                        <FileText size={16} className="text-gray-400 flex-shrink-0" />
                        {item.file ? (
                          <span className="text-white truncate">{item.file.name}</span>
                        ) : (
                          <span className="text-gray-400">Click to upload VTT/SRT file</span>
                        )}
                      </label>
                      {subtitleFiles.length > 1 && (
                        <button
                          onClick={() => removeSubtitleField(index)}
                          className="bg-gray-800 border border-gray-700 text-red-400 px-4 rounded-xl hover:bg-gray-700 hover:border-red-500 transition-all"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>

                    <input
                      type="url"
                      value={item.videoLink}
                      onChange={(e) => updateSubtitleVideoLink(index, e.target.value)}
                      placeholder="Enter video link (YouTube, Vimeo, etc.)"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={addSubtitleField}
                className="w-full border border-gray-700 bg-gray-900/50 text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add Another Subtitle File
              </button>

              {subtitleFiles.length > 0 && (
                <button
                  onClick={handleSubtitleSubmit}
                  disabled={subtitleFiles.some(item => !item.file || !item.videoLink.trim()) || loadingSubtitles}
                  className="w-full bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingSubtitles ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Uploading...
                    </span>
                  ) : (
                    `Upload ${subtitleFiles.length} Subtitle${subtitleFiles.length !== 1 ? 's' : ''} with Video Link${subtitleFiles.length !== 1 ? 's' : ''}`
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
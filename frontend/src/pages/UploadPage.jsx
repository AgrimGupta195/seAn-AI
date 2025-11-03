import React, { useState } from 'react';
import { Link2, FileText, Video, Upload, X, Plus } from 'lucide-react';
import axiosInstance from '../lib/axios';

export default function UploadPage() {
  const [activeTab, setActiveTab] = useState('youtube');
  const [youtubeUrls, setYoutubeUrls] = useState(['']);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [loadingVideo, setLoadingVideo] = useState(false);

  // Subtitle files with video links
  const [subtitleFiles, setSubtitleFiles] = useState([]);

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

  // Subtitle handlers
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

  const handleSubtitleSubmit = async () => {
    console.log('Subtitle files with video links:', subtitleFiles);
    // Add your API call here
    setSubtitleFiles([]);
  };

  const removeFile = (index, type) => {
    if (type === 'file') {
      setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    } else {
      setSelectedVideos(selectedVideos.filter((_, i) => i !== index));
    }
  };

  const handleYoutubeSubmit = () => {
    const validUrls = youtubeUrls.filter(url => url.trim() !== '');
    console.log('YouTube URLs:', validUrls);
    setYoutubeUrls(['']);
  };

  const handleFileSubmit = () => {
    console.log('Files:', selectedFiles);
    setSelectedFiles([]);
  };

  const handleVideoSubmit = async() => {
    setLoadingVideo(true);
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
    } catch (error) {
      alert(error.response.data.message);
    } finally {
      setSelectedVideos([]);
      setLoadingVideo(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-black absolute fixed pt-10">
      <div className="flex flex-col items-center py-6 px-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Upload Content</h1>
        <p className="text-lg sm:text-xl font-semibold text-gray-500">Choose your upload method</p>
      </div>
      <div className="flex border-b border-gray-800 px-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('youtube')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold transition-all whitespace-nowrap ${
            activeTab === 'youtube'
              ? 'border-b-2 border-white text-white -mb-px'
              : 'text-gray-600 hover:text-gray-400'
          }`}
        >
          <Link2 size={20} />
          <span className="hidden sm:inline">YouTube</span>
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold transition-all whitespace-nowrap ${
            activeTab === 'files'
              ? 'border-b-2 border-white text-white -mb-px'
              : 'text-gray-600 hover:text-gray-400'
          }`}
        >
          <FileText size={20} />
          <span className="hidden sm:inline">Documents</span>
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold transition-all whitespace-nowrap ${
            activeTab === 'videos'
              ? 'border-b-2 border-white text-white -mb-px'
              : 'text-gray-600 hover:text-gray-400'
          }`}
        >
          <Video size={20} />
          <span className="hidden sm:inline">Videos</span>
        </button>
        <button
          onClick={() => setActiveTab('subtitles')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold transition-all whitespace-nowrap ${
            activeTab === 'subtitles'
              ? 'border-b-2 border-white text-white -mb-px'
              : 'text-gray-600 hover:text-gray-400'
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
                      className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm sm:text-base text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-gray-700 transition-all"
                    />
                    {youtubeUrls.length > 1 && (
                      <button
                        onClick={() => removeYoutubeUrl(index)}
                        className="bg-gray-900 border border-gray-800 text-red-500 px-4 rounded-lg hover:bg-gray-800 hover:border-red-500 transition-all"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addYoutubeUrlField}
                className="w-full border border-gray-800 bg-gray-900 text-white font-semibold py-3 rounded-lg hover:bg-gray-800 hover:border-gray-700 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add Another URL
              </button>
              <button
                onClick={handleYoutubeSubmit}
                disabled={youtubeUrls.every(url => !url.trim())}
                className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Process YouTube Videos
              </button>
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-800 rounded-lg p-8 sm:p-12 text-center hover:border-gray-700 transition-all cursor-pointer bg-gray-950">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept=".vtt,.srt,.txt,.doc,.docx,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload size={64} className="mx-auto mb-4 text-gray-600" />
                  <p className="text-xl font-semibold text-white mb-2">
                    Click to upload documents
                  </p>
                  <p className="text-sm text-gray-600">
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
                        className="flex items-center justify-between bg-gray-950 border border-gray-800 p-3 rounded-lg hover:bg-gray-900 transition-all"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText size={20} className="text-gray-500 flex-shrink-0" />
                          <span className="text-sm font-medium text-white truncate">{file.name}</span>
                        </div>
                        <button
                          onClick={() => removeFile(index, 'file')}
                          className="text-red-500 hover:text-red-400 ml-2 flex-shrink-0"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleFileSubmit}
                    className="w-full bg-white cursor-pointer text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl"
                  >
                    Upload {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-800 rounded-lg p-8 sm:p-12 text-center hover:border-gray-700 transition-all cursor-pointer bg-gray-950">
                <input
                  type="file"
                  id="video-upload"
                  multiple
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
                <label htmlFor="video-upload" className="cursor-pointer">
                  <Video size={64} className="mx-auto mb-4 text-gray-600" />
                  <p className="text-xl font-semibold text-white mb-2">
                    Click to upload videos
                  </p>
                  <p className="text-sm text-gray-600">
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
                        className="flex items-center justify-between bg-gray-950 border border-gray-800 p-3 rounded-lg hover:bg-gray-900 transition-all"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Video size={20} className="text-gray-500 flex-shrink-0" />
                          <span className="text-sm font-medium text-white truncate">{file.name}</span>
                        </div>
                        <button
                          onClick={() => removeFile(index, 'video')}
                          className="text-red-500 cursor-pointer hover:text-red-400 ml-2 flex-shrink-0"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    disabled={loadingVideo}
                    onClick={handleVideoSubmit}
                    className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingVideo ? 'Uploading...' : `Upload ${selectedVideos.length} Video${selectedVideos.length !== 1 ? 's' : ''}`}
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
                    className="bg-gray-950 border border-gray-800 rounded-lg p-4 space-y-3"
                  >
                    {/* Subtitle File Upload */}
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
                        className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm cursor-pointer hover:bg-gray-800 transition-all flex items-center gap-2"
                      >
                        <FileText size={16} className="text-gray-500 flex-shrink-0" />
                        {item.file ? (
                          <span className="text-white truncate">{item.file.name}</span>
                        ) : (
                          <span className="text-gray-400">Click to upload VTT/SRT file</span>
                        )}
                      </label>
                      {subtitleFiles.length > 1 && (
                        <button
                          onClick={() => removeSubtitleField(index)}
                          className="bg-gray-900 border border-gray-800 text-red-500 px-4 rounded-lg hover:bg-gray-800 hover:border-red-500 transition-all"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>

                    {/* Video Link Input */}
                    <input
                      type="url"
                      value={item.videoLink}
                      onChange={(e) => updateSubtitleVideoLink(index, e.target.value)}
                      placeholder="Enter video link (YouTube, Vimeo, etc.)"
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-700"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={addSubtitleField}
                className="w-full border border-gray-800 bg-gray-900 text-white font-semibold py-3 rounded-lg hover:bg-gray-800 hover:border-gray-700 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add Another Subtitle File
              </button>

              {subtitleFiles.length > 0 && (
                <button
                  onClick={handleSubtitleSubmit}
                  disabled={subtitleFiles.some(item => !item.file || !item.videoLink.trim())}
                  className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload {subtitleFiles.length} Subtitle{subtitleFiles.length !== 1 ? 's' : ''} with Video Link{subtitleFiles.length !== 1 ? 's' : ''}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
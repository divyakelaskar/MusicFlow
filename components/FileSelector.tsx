'use client';
import { Song } from '@/types';
import { Upload, Music, Cloud, FileAudio, Sparkles } from 'lucide-react';
import { useState, useCallback } from 'react';

interface FileSelectorProps {
  onFilesSelected: (songs: Song[]) => void;
  className?: string;
}

export default function FileSelector({ onFilesSelected, className = '' }: FileSelectorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsLoading(true);
    
    // Simulate loading for better UX
    setTimeout(() => {
      const songs: Song[] = Array.from(files).map((file, index) => ({
        id: `song-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        name: file.name.replace(/\.mp3$/i, ''),
        artist: '',
        album: '',
        duration: undefined, // Will be populated from ID3 tags
        albumArt: undefined,
        id3Tags: undefined, // Changed from null to undefined
        colorPalette: undefined,
        displaySettings: undefined
      }));

      onFilesSelected(songs);
      setIsLoading(false);
    }, 500);
  }, [onFilesSelected]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    setIsLoading(true);

    const files = event.dataTransfer.files;
    
    setTimeout(() => {
      const songs: Song[] = Array.from(files).map((file, index) => ({
        id: `song-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        name: file.name.replace(/\.mp3$/i, ''),
        artist: '',
        album: '',
        duration: undefined,
        albumArt: undefined,
        id3Tags: undefined, // Changed from null to undefined
        colorPalette: undefined,
        displaySettings: undefined
      }));

      onFilesSelected(songs);
      setIsLoading(false);
    }, 500);
  }, [onFilesSelected]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div className={`${className}`}>
      <div className="relative">
        {/* Background glow effect */}
        <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
        
        {/* Main container */}
        <div className={`relative backdrop-blur-sm rounded-2xl border-2 transition-all duration-300
          ${isDragging 
            ? 'border-purple-400 bg-purple-500/20 scale-105' 
            : 'border-white/20 bg-white/5 hover:border-purple-300/50 hover:bg-white/10'}
          ${isLoading ? 'cursor-wait' : 'cursor-pointer'}
        `}>
          <div
            className="p-12 text-center"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !isLoading && document.getElementById('music-files')?.click()}
          >
            <input
              id="music-files"
              type="file"
              multiple
              accept=".mp3,.MP3"
              onChange={handleFileChange}
              className="hidden"
              disabled={isLoading}
            />
            
            {/* Loading state */}
            {isLoading ? (
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-purple-500/30 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Music className="w-8 h-8 text-purple-400 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
                    Processing Files
                  </h3>
                  <p className="text-gray-300">Extracting metadata and album art...</p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-150"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-300"></div>
                  </div>
                </div>
              </div>
            ) : (
              /* Default state */
              <div className="flex flex-col items-center gap-6">
                {/* Animated icons */}
                <div className="relative">
                  <div className="p-5 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-2xl backdrop-blur-sm animate-pulse">
                    <Upload className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full animate-bounce">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Main text */}
                <div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent mb-3">
                    Drop Your Music
                  </h3>
                  <p className="text-gray-300 text-lg mb-6 max-w-md">
                    Drag & drop MP3 files here or click to browse your collection
                  </p>
                  
                  {/* CTA Button */}
                  <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-3 rounded-full font-semibold text-white hover:from-purple-700 hover:to-blue-700 transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/30">
                    <Cloud className="w-5 h-5" />
                    <span className="text-lg">Browse Files</span>
                  </div>
                </div>

                {/* Features list */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 w-full max-w-2xl">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl backdrop-blur-sm">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <FileAudio className="w-5 h-5 text-purple-300" />
                    </div>
                    <span className="text-sm text-gray-300">MP3 Files</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl backdrop-blur-sm">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Music className="w-5 h-5 text-blue-300" />
                    </div>
                    <span className="text-sm text-gray-300">ID3 Tags</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl backdrop-blur-sm">
                    <div className="p-2 bg-pink-500/20 rounded-lg">
                      <Sparkles className="w-5 h-5 text-pink-300" />
                    </div>
                    <span className="text-sm text-gray-300">Album Art</span>
                  </div>
                </div>

                {/* Hint text */}
                <p className="text-gray-400 text-sm mt-6">
                  Supports all standard MP3 metadata including lyrics, album art, and more
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-2xl backdrop-blur-sm flex items-center justify-center animate-pulse">
            <div className="text-center">
              <div className="p-4 bg-white/20 rounded-full inline-block mb-4">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-white">Drop to upload</h4>
              <p className="text-white/80">Release to add to your playlist</p>
            </div>
          </div>
        )}
      </div>

      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
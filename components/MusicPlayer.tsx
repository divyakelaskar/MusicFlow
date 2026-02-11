'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { PlaylistState } from '@/types';

interface MusicPlayerProps {
  playlist: PlaylistState;
  onPlaylistUpdate: (playlist: PlaylistState) => void;
  colors: {
    background: string;
    cardBackground: string;
    heading: string;
    subtitle: string;
  };
}

type RepeatMode = false | 'all' | 'one';

export default function MusicPlayer({ playlist, onPlaylistUpdate, colors }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isDragging, setIsDragging] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeating, setIsRepeating] = useState<RepeatMode>(false);

  const currentSong = playlist.songs[playlist.currentSongIndex];

  // Reset error when song changes
  useEffect(() => {
    setAudioError(null);
  }, [currentSong?.id]);

  // Control playback when isPlaying changes
  // Handle song change and auto-play
  useEffect(() => {
    if (currentSong && audioRef.current) {
      const audio = audioRef.current;

      // Only reset and reload if it's a different song
      if (audio.src !== URL.createObjectURL(currentSong.file)) {
        setCurrentTime(0);
        setAudioError(null);

        // Update the audio source
        audio.src = URL.createObjectURL(currentSong.file);
        audio.load();

        // Auto-play when song changes if playlist isPlaying is true
        if (playlist.isPlaying) {
          const playPromise = audio.play();

          if (playPromise !== undefined) {
            playPromise.catch(error => {
              // This is expected if user interacts before audio can play
              if (error.name !== 'AbortError') {
                console.error('Auto-play failed:', error);
              }
            });
          }
        }
      }
    }
  }, [currentSong?.id]);

  // Handle play/pause state changes for the same song
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    // Skip if we just changed songs (audio.src might not be set yet)
    if (!audio.src) return;

    const controlPlayback = async () => {
      try {
        if (playlist.isPlaying) {
          // If audio is already playing, don't restart it
          if (audio.paused) {
            const playPromise = audio.play();

            if (playPromise !== undefined) {
              playPromise.catch(error => {
                if (error.name !== 'AbortError') {
                  setAudioError('Failed to play audio: ' + error.message);
                  onPlaylistUpdate({
                    ...playlist,
                    isPlaying: false
                  });
                }
              });
            }
          }
        } else {
          audio.pause();
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setAudioError('Failed to play audio: ' + (error as Error).message);
          onPlaylistUpdate({
            ...playlist,
            isPlaying: false
          });
        }
      }
    };

    controlPlayback();
  }, [playlist.isPlaying, currentSong]);

  // Apply playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Apply mute state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Handle song change and auto-play
  useEffect(() => {
    if (currentSong && audioRef.current) {
      const audio = audioRef.current;

      // Only reset and reload if it's a different song
      if (audio.src !== URL.createObjectURL(currentSong.file)) {
        setCurrentTime(0);
        setAudioError(null);

        // Update the audio source
        audio.src = URL.createObjectURL(currentSong.file);
        audio.load();

        // Auto-play when song changes if playlist isPlaying is true
        if (playlist.isPlaying) {
          const playAudio = async () => {
            try {
              await audio.play();
            } catch (error) {
              console.error('Auto-play failed:', error);
            }
          };
          playAudio();
        }
      }
    }
  }, [currentSong?.id]);

  // Handle play/pause state changes for the same song
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    // Only control playback if we're not changing songs
    const controlPlayback = async () => {
      try {
        if (playlist.isPlaying) {
          // If audio is already playing, don't restart it
          if (audio.paused) {
            await audio.play();
          }
        } else {
          audio.pause();
        }
      } catch (error) {
        setAudioError('Failed to play audio: ' + (error as Error).message);
        onPlaylistUpdate({
          ...playlist,
          isPlaying: false
        });
      }
    };

    controlPlayback();
  }, [playlist.isPlaying, currentSong]);

  const handlePlayPause = useCallback(async () => {
    if (!currentSong) return;

    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (playlist.isPlaying) {
        audio.pause();
        onPlaylistUpdate({
          ...playlist,
          isPlaying: false
        });
      } else {
        // Only load if there's an error or no source
        if (audioError || !audio.src) {
          audio.src = URL.createObjectURL(currentSong.file);
          audio.load();
          setAudioError(null);
        }

        const playPromise = audio.play();

        if (playPromise !== undefined) {
          playPromise.then(() => {
            onPlaylistUpdate({
              ...playlist,
              isPlaying: true
            });
          }).catch(error => {
            // Don't show AbortError to user
            if (error.name !== 'AbortError') {
              setAudioError('Playback failed: ' + error.message);
            }
            onPlaylistUpdate({
              ...playlist,
              isPlaying: false
            });
          });
        }
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        setAudioError('Playback failed: ' + (error as Error).message);
      }
      onPlaylistUpdate({
        ...playlist,
        isPlaying: false
      });
    }
  }, [playlist, currentSong, audioError, onPlaylistUpdate]);

  const handleNext = useCallback(() => {
    if (playlist.songs.length === 0) return;

    let nextIndex;
    if (isShuffled) {
      // Get random index different from current
      do {
        nextIndex = Math.floor(Math.random() * playlist.songs.length);
      } while (playlist.songs.length > 1 && nextIndex === playlist.currentSongIndex);
    } else {
      nextIndex = playlist.currentSongIndex + 1;

      // If at the end
      if (nextIndex >= playlist.songs.length) {
        // If repeat all is on, go to first song
        if (isRepeating === 'all') {
          nextIndex = 0;
        } else {
          // No repeat, stay on last song but pause
          nextIndex = playlist.currentSongIndex;
          onPlaylistUpdate({
            ...playlist,
            isPlaying: false
          });
          return;
        }
      }
    }

    // Pause current audio before changing song to avoid race condition
    if (audioRef.current) {
      audioRef.current.pause();
    }

    onPlaylistUpdate({
      ...playlist,
      currentSongIndex: nextIndex,
      isPlaying: true // Auto-play next song
    });
    setAudioError(null);
  }, [playlist, isShuffled, isRepeating, onPlaylistUpdate]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedData = () => {
      setDuration(audio.duration || 0);
      setAudioError(null);
    };

    const handleTimeUpdate = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleEnded = () => {
      if (isRepeating === 'one') {
        // Repeat one: restart current song
        audio.currentTime = 0;
        audio.play();
      } else {
        // Repeat all or no repeat: go to next song
        // handleNext already handles repeat all logic
        handleNext();
      }
    };

    const handleError = (e: Event) => {
      const error = audio.error;
      let errorMessage = 'Failed to load audio';

      if (error) {
        switch (error.code) {
          case error.MEDIA_ERR_ABORTED:
            errorMessage = 'Audio playback was aborted';
            break;
          case error.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error occurred';
            break;
          case error.MEDIA_ERR_DECODE:
            errorMessage = 'Audio decoding error';
            break;
          case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Audio format not supported';
            break;
          default:
            errorMessage = 'Unknown audio error';
        }
      }

      setAudioError(errorMessage);
    };

    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [currentSong, isDragging, isRepeating, handleNext]); // Added handleNext to dependencies

  const handlePrevious = useCallback(() => {
    if (playlist.songs.length === 0) return;

    let prevIndex;
    if (isShuffled) {
      // Get random index different from current
      do {
        prevIndex = Math.floor(Math.random() * playlist.songs.length);
      } while (playlist.songs.length > 1 && prevIndex === playlist.currentSongIndex);
    } else {
      prevIndex = playlist.currentSongIndex - 1;

      // If at the beginning
      if (prevIndex < 0) {
        // If repeat all is on, go to last song
        if (isRepeating === 'all') {
          prevIndex = playlist.songs.length - 1;
        } else {
          // No repeat, stay on first song
          prevIndex = 0;
        }
      }
    }

    // Pause current audio before changing song to avoid race condition
    if (audioRef.current) {
      audioRef.current.pause();
    }

    onPlaylistUpdate({
      ...playlist,
      currentSongIndex: prevIndex,
      isPlaying: true // Auto-play previous song
    });
    setAudioError(null);
  }, [playlist, isShuffled, isRepeating, onPlaylistUpdate]);

  // ... rest of the functions remain the same (handleSeekStart, handleSeek, handleSeekEnd, etc.)

  const handleSeekStart = () => {
    setIsDragging(true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
  };

  const handleSeekEnd = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = currentTime;
    }
    setIsDragging(false);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
  };

  const toggleRepeat = () => {
    if (!isRepeating) {
      setIsRepeating('all');
    } else if (isRepeating === 'all') {
      setIsRepeating('one');
    } else {
      setIsRepeating(false);
    }
  };

  const changePlaybackRate = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime += 10;
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime -= 10;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return duration ? (currentTime / duration) * 100 : 0;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipForward();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipBackward();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(prev => Math.min(1, prev + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(prev => Math.max(0, prev - 0.1));
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyS':
          e.preventDefault();
          toggleShuffle();
          break;
        case 'KeyR':
          e.preventDefault();
          toggleRepeat();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlePlayPause]);

  if (!currentSong) {
    return (
      <div className="flex items-center justify-center h-full" style={{ color: colors.subtitle }}>
        No song selected
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Error Display */}
      {audioError && (
        <div className="mb-3 p-2 rounded-lg text-sm" style={{ backgroundColor: `${colors.background}80`, color: colors.heading }}>
          <strong>Error:</strong> {audioError}
          <button
            onClick={() => setAudioError(null)}
            className="ml-2 hover:opacity-70 transition-opacity"
            style={{ color: colors.heading }}
          >
            ×
          </button>
        </div>
      )}

      {/* Main Player Controls - Horizontal Layout */}
      <div className="flex-1 flex items-center justify-between space-x-6">
        {/* Song Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold truncate" style={{ color: colors.heading }}>
            {currentSong.id3Tags?.title || currentSong.name}
          </h3>
          <p className="truncate" style={{ color: colors.subtitle }}>
            {currentSong.id3Tags?.artist || 'Unknown Artist'}
          </p>
        </div>

        {/* Advanced Controls */}
        <div className="flex items-center space-x-4">
          {/* Playback Rate */}
          <button
            onClick={changePlaybackRate}
            className="p-2 rounded-lg transition-all duration-200 shadow-sm text-sm font-medium"
            style={{ backgroundColor: `${colors.cardBackground}80`, color: colors.heading }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.cardBackground}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = `${colors.cardBackground}80`}
            title={`Playback Speed: ${playbackRate}x`}
          >
            {playbackRate}x
          </button>

          {/* Skip Backward */}
          <button
            onClick={skipBackward}
            className="p-2 rounded-full transition-all duration-200 shadow-sm"
            style={{ backgroundColor: `${colors.cardBackground}80`, color: colors.heading }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.cardBackground}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = `${colors.cardBackground}80`}
            title="Skip Backward 10s"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
            </svg>
          </button>

          {/* Previous */}
          <button
            onClick={handlePrevious}
            disabled={playlist.songs.length <= 1 || (!isShuffled && !isRepeating && playlist.currentSongIndex === 0)}
            className="p-2 rounded-full transition-all duration-200 shadow-sm disabled:opacity-30"
            style={{ backgroundColor: `${colors.cardBackground}80`, color: colors.heading }}
            onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = colors.cardBackground)}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = `${colors.cardBackground}80`}
            title="Previous"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          {/* Play/Pause */}
          <button
            onClick={handlePlayPause}
            className="p-4 rounded-full shadow-lg transition-all duration-200"
            style={{ backgroundColor: colors.heading, color: colors.cardBackground }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            title={playlist.isPlaying ? 'Pause' : 'Play'}
          >
            {playlist.isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Next */}
          <button
            onClick={handleNext}
            disabled={playlist.songs.length <= 1 || (!isShuffled && !isRepeating && playlist.currentSongIndex === playlist.songs.length - 1)}
            className="p-2 rounded-full transition-all duration-200 shadow-sm disabled:opacity-30"
            style={{ backgroundColor: `${colors.cardBackground}80`, color: colors.heading }}
            onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = colors.cardBackground)}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = `${colors.cardBackground}80`}
            title="Next"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>

          {/* Skip Forward */}
          <button
            onClick={skipForward}
            className="p-2 rounded-full transition-all duration-200 shadow-sm"
            style={{ backgroundColor: `${colors.cardBackground}80`, color: colors.heading }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.cardBackground}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = `${colors.cardBackground}80`}
            title="Skip Forward 10s"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.01 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" />
            </svg>
          </button>

          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`p-2 rounded-full transition-all duration-200 shadow-sm ${isShuffled ? 'opacity-100' : 'opacity-70'
              }`}
            style={{
              backgroundColor: isShuffled ? `${colors.heading}20` : `${colors.cardBackground}80`,
              color: colors.heading
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.cardBackground}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isShuffled ? `${colors.heading}20` : `${colors.cardBackground}80`}
            title={isShuffled ? 'Disable Shuffle' : 'Enable Shuffle'}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
            </svg>
          </button>

          {/* Repeat */}
          <button
            onClick={toggleRepeat}
            className={`p-2 rounded-full transition-all duration-200 shadow-sm ${isRepeating ? 'opacity-100' : 'opacity-70'
              }`}
            style={{
              backgroundColor: isRepeating ? `${colors.heading}20` : `${colors.cardBackground}80`,
              color: colors.heading
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.cardBackground}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isRepeating ? `${colors.heading}20` : `${colors.cardBackground}80`}
            title={
              isRepeating === 'all' ? 'Repeat All' :
                isRepeating === 'one' ? 'Repeat One' :
                  'Repeat Off'
            }
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
              {isRepeating === 'one' && (
                <text x="12" y="16" textAnchor="middle" fontSize="8" fontWeight="bold" fill="currentColor">1</text>
              )}
            </svg>
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleMute}
            className="p-1 rounded-full transition-colors"
            style={{ color: colors.heading }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${colors.cardBackground}80`}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            ) : volume > 0.5 ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            ) : volume > 0 ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 9v6h4l5 5V4l-5 5H7z" />
              </svg>
            )}
          </button>
          <div className="w-24">
            <style>{`
    #volume-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: ${colors.heading};
      cursor: pointer;
      border: 2px solid white;
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
    }
    
    #volume-slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: ${colors.heading};
      cursor: pointer;
      border: 2px solid white;
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
    }
  `}</style>
            <input
              id="volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                backgroundColor: `${colors.cardBackground}80`,
                backgroundImage: `linear-gradient(to right, ${colors.heading} ${volume * 100}%, #e2e2e2 ${volume * 100}%)`
              }}
            />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-sm mb-2">
          <span style={{ color: colors.subtitle }}>{formatTime(currentTime)}</span>
          <span style={{ color: colors.subtitle }}>{formatTime(duration)}</span>
        </div>
        <div className="relative">
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${colors.cardBackground}80` }}>
            <div
              className="h-full rounded-full transition-all duration-100"
              style={{
                backgroundColor: colors.heading,
                width: `${getProgressPercentage()}%`
              }}
            />
          </div>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            onMouseDown={handleSeekStart}
            onMouseUp={handleSeekEnd}
            onTouchStart={handleSeekStart}
            onTouchEnd={handleSeekEnd}
            className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        key={currentSong.id}
        preload="auto"
      >
        <source src={URL.createObjectURL(currentSong.file)} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
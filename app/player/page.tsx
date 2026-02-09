'use client';
import { useState, useEffect } from 'react';
import { Song, PlaylistState, ID3Tags, DisplaySettings as DisplaySettingsType } from '@/types';
import FileSelector from '@/components/FileSelector';
import PlaylistQueue from '@/components/PlaylistQueue';
import MusicPlayer from '@/components/MusicPlayer';
import ColorThief from 'colorthief';
import { readID3Tags, extractAlbumArt } from '@/utils/id3Reader';
import DisplaySettings from '@/components/DisplaySettings';

export default function PlayerPage() {
    const [playlist, setPlaylist] = useState<PlaylistState>({
        songs: [],
        currentSongIndex: 0,
        isPlaying: false,
        displaySettings: {
            showYear: true,
            showGenre: true,
            showTrackNumber: true,
            showDuration: true,
            showComposer: false,
            showComment: false,
            showLyrics: false,
        }
    });

    const [colors, setColors] = useState<{
        background: string;
        heading: string;
        accent: string;
        cardBackground: string;
        subtitle: string;
    }>({
        background: 'rgb(249, 250, 251)',
        heading: 'rgb(17, 24, 39)',
        accent: 'rgb(107, 114, 128)',
        cardBackground: 'rgb(255, 255, 255)',
        subtitle: 'rgb(107, 114, 128)'
    });

    // Load ID3 tags for all songs when files are selected
    useEffect(() => {
        const loadAllID3Tags = async () => {
            console.log('=== STARTING ID3 TAG LOADING ===');
            console.log('Number of songs:', playlist.songs.length);
            
            const songsWithTags: Song[] = await Promise.all(
                playlist.songs.map(async (song, index): Promise<Song> => {
                    if (song.id3Tags) return song; // Already loaded

                    try {
                        console.log(`\n=== Processing song ${index + 1}: ${song.name} ===`);
                        const id3Tags = await readID3Tags(song.file);
                        
                        // DEBUG: Log all ID3 tags
                        console.log('ID3 Tags loaded:', {
                            title: id3Tags.title,
                            artist: id3Tags.artist,
                            album: id3Tags.album,
                            lyrics: id3Tags.lyrics,  // Check this!
                            hasLyrics: !!id3Tags.lyrics,
                            lyricsLength: id3Tags.lyrics?.length,
                            lyricsPreview: id3Tags.lyrics?.substring(0, 100) + '...',
                            allKeys: Object.keys(id3Tags).filter(key => key !== 'raw' && key !== 'artwork')
                        });
                        
                        let albumArt = song.albumArt;

                        if (id3Tags.artwork) {
                            albumArt = extractAlbumArt(id3Tags.artwork);
                        }

                        // Create properly typed Song object with fallbacks
                        const updatedSong: Song = {
                            ...song,
                            id3Tags,
                            albumArt,
                            name: id3Tags.title || song.name,
                            artist: id3Tags.artist || song.artist || 'Unknown Artist',
                            album: id3Tags.album || song.album || 'Unknown Album',
                        };

                        return updatedSong;
                    } catch (error) {
                        console.error(`Error loading ID3 tags for ${song.name}:`, error);
                        return song; // Return original song if error
                    }
                })
            );

            console.log('\n=== FINISHED LOADING ALL SONGS ===');
            console.log('Songs with tags:', songsWithTags.map(s => ({
                name: s.name,
                hasLyrics: !!s.id3Tags?.lyrics
            })));

            setPlaylist(prev => ({
                ...prev,
                songs: songsWithTags
            }));
        };

        if (playlist.songs.length > 0) {
            loadAllID3Tags();
        }
    }, [playlist.songs.length]); // Only run when number of songs changes

    // Extract colors from current song's album art
    useEffect(() => {
        const extractColors = async () => {
            const currentSong = playlist.songs[playlist.currentSongIndex];
            if (!currentSong?.albumArt) {
                // Reset to default colors if no album art
                setColors({
                    background: 'rgb(249, 250, 251)',
                    heading: 'rgb(17, 24, 39)',
                    accent: 'rgb(107, 114, 128)',
                    cardBackground: 'rgb(255, 255, 255)',
                    subtitle: 'rgb(107, 114, 128)'
                });
                return;
            }

            try {
                const colorThief = new ColorThief();
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                img.src = currentSong.albumArt;

                img.onload = () => {
                    try {
                        const palette = colorThief.getPalette(img, 3);
                        if (palette && palette.length >= 3) {
                            setColors({
                                background: `rgb(${palette[0][0]}, ${palette[0][1]}, ${palette[0][2]})`,
                                heading: `rgb(${palette[1][0]}, ${palette[1][1]}, ${palette[1][2]})`,
                                accent: `rgb(${palette[2][0]}, ${palette[2][1]}, ${palette[2][2]})`,
                                cardBackground: 'rgb(255, 255, 255)',
                                subtitle: `rgb(${palette[2][0]}, ${palette[2][1]}, ${palette[2][2]})`
                            });
                        }
                    } catch (error) {
                        console.error('Error extracting colors from image:', error);
                    }
                };

                img.onerror = () => {
                    console.error('Error loading album art image for color extraction');
                };
            } catch (error) {
                console.error('Error in color extraction:', error);
            }
        };

        extractColors();
    }, [playlist.currentSongIndex, playlist.songs]);

    const handleFilesSelected = (songs: Song[]) => {
        // Set basic song info first, ID3 tags will be loaded in useEffect
        const songsWithBasicInfo: Song[] = songs.map(song => ({
            ...song,
            name: song.name.replace(/\.mp3$/i, ''),
            artist: song.artist || 'Unknown Artist', // Ensure artist is always a string
            // id3Tags and albumArt will be loaded async
        }));

        setPlaylist(prev => ({
            ...prev,
            songs: songsWithBasicInfo,
            currentSongIndex: 0,
            isPlaying: false
        }));
    };

    const handleReorder = (fromIndex: number, toIndex: number) => {
        setPlaylist(prev => {
            const newSongs = [...prev.songs];
            const [movedSong] = newSongs.splice(fromIndex, 1);
            newSongs.splice(toIndex, 0, movedSong);

            let newCurrentIndex = prev.currentSongIndex;
            if (prev.currentSongIndex === fromIndex) {
                newCurrentIndex = toIndex;
            } else if (
                prev.currentSongIndex > fromIndex &&
                prev.currentSongIndex <= toIndex
            ) {
                newCurrentIndex--;
            } else if (
                prev.currentSongIndex < fromIndex &&
                prev.currentSongIndex >= toIndex
            ) {
                newCurrentIndex++;
            }

            return { ...prev, songs: newSongs, currentSongIndex: newCurrentIndex };
        });
    };

    const handleRemove = (songId: string) => {
        setPlaylist(prev => {
            const songIndex = prev.songs.findIndex(song => song.id === songId);
            const newSongs = prev.songs.filter(song => song.id !== songId);

            let newCurrentIndex = prev.currentSongIndex;
            if (songIndex < prev.currentSongIndex) {
                newCurrentIndex--;
            } else if (songIndex === prev.currentSongIndex) {
                newCurrentIndex = Math.min(newCurrentIndex, newSongs.length - 1);
            }

            return { ...prev, songs: newSongs, currentSongIndex: newCurrentIndex };
        });
    };

    const currentSong = playlist.songs[playlist.currentSongIndex];

    if (playlist.songs.length === 0) {
        return (
            <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-900 via-black to-blue-900 flex items-center justify-center p-8">
                <FileSelector onFilesSelected={handleFilesSelected} />
            </div>
        );
    }

    return (
        <div
            className="min-h-screen flex flex-col transition-colors duration-500"
            style={{ backgroundColor: colors.background }}
        >
            {/* Top Section - 3/4 of screen */}
            <div className="flex-1 flex" style={{ height: '75vh' }}>
                {/* Left Column - Album Art (1/3 of top section) */}
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="relative w-full max-w-2xl aspect-square">
                        {currentSong?.albumArt ? (
                            <img
                                src={currentSong.albumArt}
                                alt="Album Art"
                                className="w-full h-full object-cover rounded-3xl shadow-2xl"
                                crossOrigin="anonymous"
                                onError={(e) => {
                                    console.error('Error loading album art:', e);
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        ) : (
                            <div
                                className="w-full h-full rounded-3xl shadow-2xl flex items-center justify-center"
                                style={{ backgroundColor: colors.accent }}
                            >
                                <span
                                    className="text-6xl"
                                    style={{ color: colors.background }}
                                >
                                    🎵
                                </span>
                                <div className="absolute bottom-4 text-white text-sm">
                                    {currentSong?.id3Tags ? 'No album art' : 'Loading...'}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Middle Column - ID3 Data (1/3 of top section) */}
                <div className="flex-1 p-8">
                    <div
                        className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 h-full shadow-xl flex flex-col"
                        style={{ backgroundColor: colors.cardBackground }}
                    >
                        {/* Header with Settings Gear - Fixed height */}
                        <div className="flex-shrink-0 flex justify-between items-center mb-3">
                            <h2
                                className="text-3xl font-bold"
                                style={{ color: colors.heading }}
                            >
                                Track Information
                            </h2>
                            <DisplaySettings
                                settings={playlist.displaySettings}
                                onSettingsChange={(newSettings) => setPlaylist(prev => ({ ...prev, displaySettings: newSettings }))}
                                colors={colors}
                            />
                        </div>

                        {/* Current Song Basic Info - Fixed height */}
                        <div className="flex-shrink-0 mb-6">
                            <h3
                                className="text-2xl font-semibold mb-2 truncate"
                                style={{ color: colors.heading }}
                            >
                                {currentSong?.id3Tags?.title || currentSong?.name || 'Unknown Title'}
                            </h3>
                            <p
                                className="text-lg mb-1"
                                style={{ color: colors.subtitle }}
                            >
                                {currentSong?.artist || 'Unknown Artist'}
                            </p>
                            <p
                                className="text-md"
                                style={{ color: colors.subtitle }}
                            >
                                {currentSong?.album || 'Unknown Album'}
                            </p>
                            {!currentSong?.id3Tags && (
                                <p className="text-sm text-gray-500 mt-2">Loading ID3 tags...</p>
                            )}
                        </div>

                        {/* Scrollable ID3 Details Container */}
                        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                            <div className="flex-1 overflow-y-auto pr-2">
                                {currentSong?.id3Tags && (
                                    <div className="space-y-6">
                                        {/* Main 7 attributes in 3 columns layout */}
                                        <div className="grid grid-cols-3 gap-4">
                                            {/* Year */}
                                            {currentSong.id3Tags.year && playlist.displaySettings.showYear && (
                                                <div>
                                                    <span className="font-semibold" style={{ color: colors.heading }}>
                                                        Year:
                                                    </span>
                                                    <span style={{ color: colors.subtitle }} className="ml-1">
                                                        {currentSong.id3Tags.year}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Genre */}
                                            {currentSong.id3Tags.genre && playlist.displaySettings.showGenre && (
                                                <div>
                                                    <span className="font-semibold" style={{ color: colors.heading }}>
                                                        Genre:
                                                    </span>
                                                    <span style={{ color: colors.subtitle }} className="ml-1">
                                                        {Array.isArray(currentSong.id3Tags.genre) 
                                                            ? currentSong.id3Tags.genre.join(', ')
                                                            : currentSong.id3Tags.genre}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Composer */}
                                            {currentSong.id3Tags.composer && playlist.displaySettings.showComposer && (
                                                <div>
                                                    <span className="font-semibold" style={{ color: colors.heading }}>
                                                        Composer:
                                                    </span>
                                                    <span style={{ color: colors.subtitle }} className="ml-1">
                                                        {currentSong.id3Tags.composer}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Track Number */}
                                            {currentSong.id3Tags.track && playlist.displaySettings.showTrackNumber && (
                                                <div>
                                                    <span className="font-semibold" style={{ color: colors.heading }}>
                                                        Track:
                                                    </span>
                                                    <span style={{ color: colors.subtitle }} className="ml-1">
                                                        {currentSong.id3Tags.totalTracks 
                                                            ? `${currentSong.id3Tags.track} of ${currentSong.id3Tags.totalTracks}`
                                                            : currentSong.id3Tags.track}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Duration */}
                                            {currentSong.id3Tags.duration && playlist.displaySettings.showDuration && (
                                                <div>
                                                    <span className="font-semibold" style={{ color: colors.heading }}>
                                                        Duration:
                                                    </span>
                                                    <span style={{ color: colors.subtitle }} className="ml-1">
                                                        {`${Math.floor(currentSong.id3Tags.duration / 60)}:${Math.floor(currentSong.id3Tags.duration % 60).toString().padStart(2, '0')}`}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Comment */}
                                            {currentSong.id3Tags.comment && playlist.displaySettings.showComment && (
                                                <div>
                                                    <span className="font-semibold" style={{ color: colors.heading }}>
                                                        Comment:
                                                    </span>
                                                    <span style={{ color: colors.subtitle }} className="ml-1 truncate block">
                                                        {currentSong.id3Tags.comment}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Lyrics Section - Always visible if exists and setting is enabled */}
                                        {currentSong.id3Tags.lyrics && playlist.displaySettings.showLyrics && (
                                            <div className="pt-2 border-t border-gray-200">
                                                <h4 
                                                    className="text-xl font-bold mb-2 text-center"
                                                    style={{ color: colors.heading }}
                                                >
                                                    Lyrics
                                                </h4>
                                                <div
                                                    style={{ color: colors.subtitle }}
                                                    className="mt-1 overflow-y-auto text-sm bg-gray-50/50 p-4 rounded-lg whitespace-pre-line max-h-30"
                                                >
                                                    {currentSong.id3Tags.lyrics}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Playlist (1/3 of top section) */}
                <div className="flex-1 p-8">
                    <div
                        className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 h-full shadow-xl flex flex-col"
                        style={{ backgroundColor: colors.cardBackground }}
                    >
                        <h2
                            className="text-3xl font-bold mb-6 flex-shrink-0"
                            style={{ color: colors.heading }}
                        >
                            Playlist
                        </h2>
                        <div className="flex-1 overflow-hidden min-h-0">
                            <PlaylistQueue
                                songs={playlist.songs}
                                currentSongIndex={playlist.currentSongIndex}
                                onReorder={handleReorder}
                                onRemove={handleRemove}
                                colors={colors}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section - Music Player (1/4 of screen) */}
            <div className="flex-shrink-0" style={{ height: '25vh' }}>
                <div className="h-full px-8 pb-8">
                    <div
                        className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 h-full shadow-xl"
                        style={{ backgroundColor: colors.cardBackground }}
                    >
                        <MusicPlayer
                            playlist={playlist}
                            onPlaylistUpdate={setPlaylist}
                            colors={colors}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
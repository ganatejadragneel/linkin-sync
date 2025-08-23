import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MusicPlayerProvider, useMusicPlayer } from './MusicPlayerContext';
import { UnifiedTrack } from '../types';

// Mock the storage service
jest.mock('../services/storage.service', () => ({
  storageService: {
    getAccessToken: jest.fn(() => 'mock_access_token'),
    getRefreshToken: jest.fn(),
    clearAuthData: jest.fn(),
  },
}));

// Mock the spotify device manager
jest.mock('../utils/spotify-device-manager', () => ({
  spotifyDeviceManager: {
    startPlaybackOnDevice: jest.fn(() => Promise.resolve()),
  },
}));

// Test component that uses the music player context
function TestComponent() {
  const {
    currentTrack,
    playlist,
    isPlaying,
    playTrack,
    playNext,
    playPrevious,
    setIsPlaying,
  } = useMusicPlayer();

  const testTrack: UnifiedTrack = {
    id: 'test1',
    name: 'Test Song',
    artist: 'Test Artist',
    album: 'Test Album',
    source: 'spotify',
    duration: '240',
    imageUrl: 'https://test.image.url',
    externalUrl: 'https://spotify.com/test',
    originalData: { uri: 'spotify:track:test1' }
  };

  const testPlaylist: UnifiedTrack[] = [
    testTrack,
    {
      id: 'test2',
      name: 'Test Song 2',
      artist: 'Test Artist 2',
      album: 'Test Album 2',
      source: 'youtube',
      duration: '180',
      imageUrl: 'https://test2.image.url',
      externalUrl: 'https://youtube.com/test2',
      originalData: { uri: 'youtube:video:test2' }
    }
  ];

  return (
    <div>
      <div data-testid="current-track">
        {currentTrack ? `${currentTrack.name} - ${currentTrack.artist}` : 'No track'}
      </div>
      <div data-testid="playlist-length">{playlist.length}</div>
      <div data-testid="is-playing">{isPlaying ? 'Playing' : 'Paused'}</div>
      <button onClick={() => playTrack(testTrack, testPlaylist)}>
        Play Track
      </button>
      <button onClick={playNext}>Next</button>
      <button onClick={playPrevious}>Previous</button>
      <button onClick={() => setIsPlaying(!isPlaying)}>Toggle Play/Pause</button>
    </div>
  );
}

describe('MusicPlayerContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Ensure mocks are set up properly for each test
    const { storageService } = require('../services/storage.service');
    const { spotifyDeviceManager } = require('../utils/spotify-device-manager');
    
    storageService.getAccessToken.mockReturnValue('mock_access_token');
    spotifyDeviceManager.startPlaybackOnDevice.mockResolvedValue(undefined);
  });

  it('provides initial state', () => {
    render(
      <MusicPlayerProvider>
        <TestComponent />
      </MusicPlayerProvider>
    );

    expect(screen.getByTestId('current-track')).toHaveTextContent('No track');
    expect(screen.getByTestId('playlist-length')).toHaveTextContent('0');
    expect(screen.getByTestId('is-playing')).toHaveTextContent('Paused');
  });

  it('plays a track and updates state', async () => {
    const { spotifyDeviceManager } = require('../utils/spotify-device-manager');
    spotifyDeviceManager.startPlaybackOnDevice.mockResolvedValue(undefined);

    render(
      <MusicPlayerProvider>
        <TestComponent />
      </MusicPlayerProvider>
    );

    fireEvent.click(screen.getByText('Play Track'));

    await waitFor(() => {
      expect(screen.getByTestId('current-track')).toHaveTextContent('Test Song - Test Artist');
      expect(screen.getByTestId('playlist-length')).toHaveTextContent('2');
      expect(screen.getByTestId('is-playing')).toHaveTextContent('Playing');
    });

    expect(spotifyDeviceManager.startPlaybackOnDevice).toHaveBeenCalledWith('spotify:track:test1');
  });

  it('plays next track in playlist', async () => {
    const { spotifyDeviceManager } = require('../utils/spotify-device-manager');
    spotifyDeviceManager.startPlaybackOnDevice.mockResolvedValue(undefined);

    render(
      <MusicPlayerProvider>
        <TestComponent />
      </MusicPlayerProvider>
    );

    // First, set up a playlist
    fireEvent.click(screen.getByText('Play Track'));

    await waitFor(() => {
      expect(screen.getByTestId('current-track')).toHaveTextContent('Test Song - Test Artist');
    });

    // Then play next
    fireEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(screen.getByTestId('current-track')).toHaveTextContent('Test Song 2 - Test Artist 2');
    });
  });

  it('plays previous track in playlist', async () => {
    const { spotifyDeviceManager } = require('../utils/spotify-device-manager');
    spotifyDeviceManager.startPlaybackOnDevice.mockResolvedValue(undefined);

    render(
      <MusicPlayerProvider>
        <TestComponent />
      </MusicPlayerProvider>
    );

    // Set up playlist and go to second track
    fireEvent.click(screen.getByText('Play Track'));
    await waitFor(() => {
      expect(screen.getByTestId('current-track')).toHaveTextContent('Test Song - Test Artist');
    });

    fireEvent.click(screen.getByText('Next'));
    await waitFor(() => {
      expect(screen.getByTestId('current-track')).toHaveTextContent('Test Song 2 - Test Artist 2');
    });

    // Then play previous
    fireEvent.click(screen.getByText('Previous'));
    await waitFor(() => {
      expect(screen.getByTestId('current-track')).toHaveTextContent('Test Song - Test Artist');
    });
  });

  it('toggles play/pause state', async () => {
    const { spotifyDeviceManager } = require('../utils/spotify-device-manager');
    spotifyDeviceManager.startPlaybackOnDevice.mockResolvedValue(undefined);

    render(
      <MusicPlayerProvider>
        <TestComponent />
      </MusicPlayerProvider>
    );

    // Start playing
    fireEvent.click(screen.getByText('Play Track'));
    await waitFor(() => {
      expect(screen.getByTestId('is-playing')).toHaveTextContent('Playing');
    });

    // Toggle to pause
    fireEvent.click(screen.getByText('Toggle Play/Pause'));
    await waitFor(() => {
      expect(screen.getByTestId('is-playing')).toHaveTextContent('Paused');
    });

    // Toggle back to play
    fireEvent.click(screen.getByText('Toggle Play/Pause'));
    await waitFor(() => {
      expect(screen.getByTestId('is-playing')).toHaveTextContent('Playing');
    });
  });

  it('handles empty playlist for next/previous', async () => {
    render(
      <MusicPlayerProvider>
        <TestComponent />
      </MusicPlayerProvider>
    );

    // Try next/previous without any playlist
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByTestId('current-track')).toHaveTextContent('No track');

    fireEvent.click(screen.getByText('Previous'));
    expect(screen.getByTestId('current-track')).toHaveTextContent('No track');
  });

  it('loops to beginning when reaching end of playlist', async () => {
    const { spotifyDeviceManager } = require('../utils/spotify-device-manager');
    spotifyDeviceManager.startPlaybackOnDevice.mockResolvedValue(undefined);

    render(
      <MusicPlayerProvider>
        <TestComponent />
      </MusicPlayerProvider>
    );

    // Set up playlist
    fireEvent.click(screen.getByText('Play Track'));
    await waitFor(() => {
      expect(screen.getByTestId('current-track')).toHaveTextContent('Test Song - Test Artist');
    });

    // Go to last track
    fireEvent.click(screen.getByText('Next'));
    await waitFor(() => {
      expect(screen.getByTestId('current-track')).toHaveTextContent('Test Song 2 - Test Artist 2');
    });

    // Go next again - should loop to first
    fireEvent.click(screen.getByText('Next'));
    await waitFor(() => {
      expect(screen.getByTestId('current-track')).toHaveTextContent('Test Song - Test Artist');
    });
  });

  it('loops to end when going previous from beginning', async () => {
    const { spotifyDeviceManager } = require('../utils/spotify-device-manager');
    spotifyDeviceManager.startPlaybackOnDevice.mockResolvedValue(undefined);

    render(
      <MusicPlayerProvider>
        <TestComponent />
      </MusicPlayerProvider>
    );

    // Set up playlist (starts at first track)
    fireEvent.click(screen.getByText('Play Track'));
    await waitFor(() => {
      expect(screen.getByTestId('current-track')).toHaveTextContent('Test Song - Test Artist');
    });

    // Go previous - should loop to last track
    fireEvent.click(screen.getByText('Previous'));
    await waitFor(() => {
      expect(screen.getByTestId('current-track')).toHaveTextContent('Test Song 2 - Test Artist 2');
    });
  });
});
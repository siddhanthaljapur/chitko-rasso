'use client';

import { useState } from 'react';
import styles from './VideoShowcase.module.css';

interface Video {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    // Support multiple video sources
    videoUrl?: string; // For local files: /videos/filename.mp4
    youtubeId?: string; // For YouTube: video ID
    cloudUrl?: string; // For cloud storage: full URL
}

const videos: Video[] = [
    {
        id: '1',
        title: 'Mutton Biryani Making Process',
        description: 'Watch our expert chefs prepare authentic Hyderabadi Mutton Biryani from scratch',
        thumbnail: '/thumbnails/mutton-biryani.jpg',
        // Option 1: Local video file (place in public/videos/)
        videoUrl: '/videos/mutton-biryani.mp4',
        // Option 2: YouTube embed (uncomment and add your YouTube ID)
        // youtubeId: 'YOUR_YOUTUBE_VIDEO_ID',
        // Option 3: Cloud URL (uncomment and add your cloud URL)
        // cloudUrl: 'https://your-cdn.com/videos/mutton-biryani.mp4',
    },
    {
        id: '2',
        title: 'Chicken Biryani Preparation',
        description: 'Experience the art of making tender, flavorful Chicken Biryani',
        thumbnail: '/thumbnails/chicken-biryani.jpg',
        videoUrl: '/videos/chicken-biryani.mp4',
    },
    {
        id: '3',
        title: 'Kitchen Tour',
        description: 'Take a behind-the-scenes look at our hygienic, modern kitchen',
        thumbnail: '/thumbnails/kitchen-tour.jpg',
        videoUrl: '/videos/kitchen-tour.mp4',
    },
];

export default function VideoShowcase() {
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handleVideoClick = (video: Video) => {
        setSelectedVideo(video);
        setIsPlaying(true);
    };

    const closeModal = () => {
        setSelectedVideo(null);
        setIsPlaying(false);
    };

    const getVideoSource = (video: Video) => {
        if (video.youtubeId) {
            return `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`;
        }
        return video.cloudUrl || video.videoUrl || '';
    };

    return (
        <section className={styles.videoSection}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Behind the Scenes</h2>
                    <p className={styles.subtitle}>
                        Watch how we prepare our signature biryanis with love and authenticity
                    </p>
                </div>

                <div className={styles.videoGrid}>
                    {videos.map((video) => (
                        <div
                            key={video.id}
                            className={styles.videoCard}
                            onClick={() => handleVideoClick(video)}
                        >
                            <div className={styles.thumbnailWrapper}>
                                <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className={styles.thumbnail}
                                    onError={(e) => {
                                        // Fallback to placeholder if thumbnail doesn't exist
                                        (e.target as HTMLImageElement).src = '/placeholder-video.jpg';
                                    }}
                                />
                                <div className={styles.playButton}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="60"
                                        height="60"
                                        viewBox="0 0 24 24"
                                        fill="white"
                                    >
                                        <circle cx="12" cy="12" r="10" fill="rgba(255, 107, 53, 0.9)" />
                                        <polygon points="10,8 16,12 10,16" fill="white" />
                                    </svg>
                                </div>
                            </div>
                            <div className={styles.videoInfo}>
                                <h3 className={styles.videoTitle}>{video.title}</h3>
                                <p className={styles.videoDescription}>{video.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Video Modal */}
            {selectedVideo && (
                <div className={styles.modal} onClick={closeModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeButton} onClick={closeModal}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>

                        {selectedVideo.youtubeId ? (
                            // YouTube Embed
                            <iframe
                                className={styles.videoPlayer}
                                src={getVideoSource(selectedVideo)}
                                title={selectedVideo.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        ) : (
                            // HTML5 Video Player (for local/cloud videos)
                            <video
                                className={styles.videoPlayer}
                                controls
                                autoPlay
                                src={getVideoSource(selectedVideo)}
                            >
                                Your browser does not support the video tag.
                            </video>
                        )}

                        <div className={styles.modalInfo}>
                            <h3>{selectedVideo.title}</h3>
                            <p>{selectedVideo.description}</p>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

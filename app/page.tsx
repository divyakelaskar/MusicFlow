'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Play, Music, Headphones, Sparkles, ArrowRight } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasSize();

    // Create initial particles
    const particles: Particle[] = [];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.5 - 0.25,
        color: `rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, 255, ${Math.random() * 0.3 + 0.2})`
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(147, 51, 234, 0.1)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw particles
      particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      setCanvasSize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-900 via-black to-blue-900">
      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">

        {/* Main title with gradient */}
        <h1 className="text-7xl md:text-8xl font-bold mb-6 text-center">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-gradient">
            MusicFlow
          </span>
        </h1>

        {/* Animated subtitle */}
        <div className="relative mb-12">
          <p className="text-2xl md:text-3xl font-light text-gray-200 mb-2">
            Your local music
            <span className="inline-block animate-pulse">🎵</span>
            player
          </p>
          <div className="h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-shimmer" />
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-400/50 transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Music className="w-6 h-6 text-purple-300" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">MP3 Metadata</h3>
            <p className="text-gray-300">Reads album art, artist info & more</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-blue-400/50 transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Headphones className="w-6 h-6 text-blue-300" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Sleek Player</h3>
            <p className="text-gray-300">Beautiful modern interface</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-pink-400/50 transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Sparkles className="w-6 h-6 text-pink-300" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Local Files</h3>
            <p className="text-gray-300">Play your personal music collection</p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="relative group">
          <Link 
            href="/player"
            className="relative inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 px-10 py-5 rounded-full font-semibold text-xl text-white hover:from-purple-700 hover:to-blue-700 transition-all duration-300 group-hover:scale-105 shadow-2xl shadow-purple-500/30"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Play className={`w-6 h-6 transition-transform duration-300 ${isHovered ? 'rotate-90' : ''}`} />
            Get Started
            <ArrowRight className={`w-6 h-6 transition-all duration-300 ${isHovered ? 'translate-x-2' : ''}`} />
          </Link>
          
          {/* Button glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10" />
        </div>

        {/* Footer with creator info */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-gray-400 text-sm">
            Built by{' '}
            <a className="text-purple-300 font-medium" href='https://linkedin.com/in/divyakelaskar'>Divya Kelaskar</a>
          </p>
        </div>

        {/* Floating music notes */}
        <div className="absolute top-10 left-10 text-3xl animate-float hidden md:block">♪</div>
        <div className="absolute top-1/3 right-16 text-2xl animate-float delay-1000 hidden md:block">♫</div>
        <div className="absolute bottom-1/4 left-20 text-2xl animate-float delay-2000 hidden md:block">♬</div>
      </div>

      {/* Add custom animations to tailwind config */}
      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  );
}
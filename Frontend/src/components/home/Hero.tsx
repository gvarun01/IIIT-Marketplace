import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Hero = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX / window.innerWidth);
      setMouseY(e.clientY / window.innerHeight);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#FDF8F3]">
      {/* Parallax Background Elements */}
      <div 
        className="absolute inset-0 bg-[#F8E5D5] opacity-50"
        style={{
          transform: `translate3d(${mouseX * -20}px, ${mouseY * -20}px, 0)`,
        }}
      />
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at ${mouseX * 100}% ${mouseY * 100}%, #E8B4A2 0%, transparent 25%)`,
          transform: `translate3d(${mouseX * -30}px, ${mouseY * -30}px, 0)`,
        }}
      />
      
      {/* Content */}
      <div className="relative container mx-auto px-4 pt-32 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column */}
            <div className="relative z-10">
              <h1 className="text-6xl md:text-7xl font-bold mb-8">
                <span className="block text-[#2A363B]">Campus</span>
                <span 
                  className="bg-gradient-to-r from-[#99B898] to-[#FECEA8] bg-clip-text text-transparent"
                  style={{
                    transform: `translateX(${scrollY * 0.1}px)`,
                  }}
                >
                  Marketplace
                </span>
              </h1>
              <p className="text-xl text-[#4A5859] mb-12 max-w-xl">
                Your trusted platform for buying and selling within the IIIT community. 
                Simple, secure, and student-focused.
              </p>
              <div className="flex flex-wrap gap-6">
                <button className="bg-[#2A363B] text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-[#435055] transition-all"
                onClick={() => navigate('/delivery')}>
                  Start Selling
                </button>
                <button className="bg-transparent text-[#2A363B] px-8 py-4 rounded-full text-lg font-medium border-2 border-[#2A363B] hover:bg-[#2A363B] hover:text-white transition-all"
                onClick={() => navigate('/shop')}>
                  Browse Items
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div className="relative">
              <div 
                className="absolute inset-0 bg-gradient-to-r from-[#99B898]/20 to-[#FECEA8]/20 rounded-3xl"
                style={{
                  transform: `translate3d(${mouseX * 20}px, ${mouseY * 20}px, 0)`,
                }}
              />
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                alt="Students collaborating"
                className="relative rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-700"
                style={{
                  transform: `translate3d(${mouseX * -10}px, ${mouseY * -10}px, 0)`,
                }}
              />
              <div 
                className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl"
                style={{
                  transform: `translate3d(${mouseX * 30}px, ${mouseY * 30}px, 0)`,
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-[#99B898] rounded-full w-3 h-3 animate-pulse" />
                  <span className="text-[#2A363B] font-medium">500+ Active Listings</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
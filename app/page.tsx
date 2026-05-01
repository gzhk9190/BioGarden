'use client';

import PlantIdentifier from '@/components/PlantIdentifier';
import { Leaf } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  return (
    <main className="min-h-screen py-12 md:py-24 bg-[#f0f4ef] dark:bg-[#121212] transition-colors duration-500">
      <div className="container mx-auto px-4">
        {/* Header/Hero Section */}
        <div className="flex flex-col items-center text-center space-y-6 mb-16 font-sans">
          <motion.div 
            initial={{ rotate: -20, scale: 0.8, opacity: 0 }}
            animate={{ 
              rotate: [-6, 6, -6],
              scale: [1, 1.1, 1],
              opacity: 1
            }}
            transition={{
              rotate: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              },
              scale: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              },
              opacity: { duration: 0.8 }
            }}
            className="w-16 h-16 bg-[#588157] rounded-2xl flex items-center justify-center shadow-lg transform"
          >
            <Leaf className="w-10 h-10 text-white" />
          </motion.div>
          <div className="space-y-2">
            <h1 className="font-serif text-5xl md:text-7xl text-[#3a5a40] dark:text-[#a3b18a] tracking-tight">
              BioGarden
            </h1>
            <p className="text-xl text-[#588157] dark:text-[#a3b18a]/80 font-serif italic">
              Cultivating knowledge, one snap at a time.
            </p>
          </div>
          <p className="max-w-2xl text-[#344e41] dark:text-[#e0e0e0] text-lg leading-relaxed">
            Turn your phone into a horticultural expert. Identify thousands of plants, 
            diagnose issues, and get personalized care guides tailored to your plant&apos;s needs.
          </p>
        </div>

        {/* Main Interaction Area */}
        <section className="bg-white/50 dark:bg-[#1a1a1a]/50 backdrop-blur-sm rounded-[3rem] p-4 md:p-12 shadow-xl border border-white/20 dark:border-[#2d3436]/20">
          <PlantIdentifier />
        </section>

        {/* Footer Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-white dark:bg-[#252525] rounded-full flex items-center justify-center mx-auto shadow-sm">
              <span className="text-2xl">🌱</span>
            </div>
            <h3 className="font-serif text-xl text-[#3a5a40] dark:text-[#a3b18a]">Instant Identify</h3>
            <p className="text-[#588157] dark:text-[#a3b18a]/70">High-precision AI identification for indoor and outdoor plants.</p>
          </div>
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-white dark:bg-[#252525] rounded-full flex items-center justify-center mx-auto shadow-sm">
              <span className="text-2xl">💧</span>
            </div>
            <h3 className="font-serif text-xl text-[#3a5a40] dark:text-[#a3b18a]">Watering Guides</h3>
            <p className="text-[#588157] dark:text-[#a3b18a]/70">Detailed moisture requirements to keep your garden thriving.</p>
          </div>
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-white dark:bg-[#252525] rounded-full flex items-center justify-center mx-auto shadow-sm">
              <span className="text-2xl">☀️</span>
            </div>
            <h3 className="font-serif text-xl text-[#3a5a40] dark:text-[#a3b18a]">Light Analysis</h3>
            <p className="text-[#588157] dark:text-[#a3b18a]/70">Understand the optimal sun exposure for ogni species.</p>
          </div>
        </div>

        <footer className="mt-24 pt-8 border-t border-[#a3b18a]/20 text-center text-[#588157] dark:text-[#a3b18a]/60 text-sm">
          <p>© {new Date().getFullYear()} BioGarden AI. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Compass, Twitter, Instagram, Youtube, Mail, Zap, Skull } from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-orange-500 selection:text-black overflow-hidden relative">
      {/* Scanlines Effect */}
      <div className="pointer-events-none fixed inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/20 rounded-full blur-[120px] animate-pulse" />

      {/* Floating Kanji Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none select-none flex items-center justify-center overflow-hidden">
        <div className="text-[20rem] font-black rotate-12 leading-none">
          冒険 <br /> アニマックス
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        
        {/* Logo/Icon Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 animate-pulse" />
          <div className="relative p-6 border-2 border-orange-500/30 rounded-full bg-black/40 backdrop-blur-sm">
            <Compass size={64} className="text-orange-500 animate-[spin_10s_linear_infinite]" />
          </div>
          {/* Neon Ring */}
          <div className="absolute -inset-2 border border-orange-500/20 rounded-full animate-ping" />
        </motion.div>

        {/* Title Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter mb-2 relative group">
            <span className="relative z-10 bg-gradient-to-b from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]">
              ANIMAX
            </span>
            {/* Glitch Layers */}
            <span className="absolute inset-0 text-red-500 opacity-0 group-hover:opacity-50 group-hover:translate-x-1 transition-all duration-75 -z-10">ANIMAX</span>
            <span className="absolute inset-0 text-blue-500 opacity-0 group-hover:opacity-50 group-hover:-translate-x-1 transition-all duration-75 -z-10">ANIMAX</span>
          </h1>
          
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-orange-500" />
            <span className="text-orange-500 font-mono tracking-[0.3em] text-sm uppercase">
              Coming Back Soon • 2026
            </span>
            <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-orange-500" />
          </div>
        </motion.div>

        {/* Japanese Text / Subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <p className="text-2xl md:text-3xl font-light text-slate-400 max-w-2xl leading-relaxed">
            La aventura se está <span className="text-white font-bold italic">recalibrando</span>. <br />
            <span className="text-orange-500/80 font-mono text-lg">再起動中... (Reiniciando...)</span>
          </p>
        </motion.div>

        {/* Action / Newsletter */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="w-full max-w-md"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
            <div className="relative flex bg-black rounded-lg overflow-hidden border border-white/10">
              <input 
                type="email" 
                placeholder="Tu email para el acceso anticipado..." 
                className="w-full bg-transparent px-4 py-4 outline-none text-sm placeholder:text-slate-600"
              />
              <button className="bg-orange-600 px-6 py-4 hover:bg-orange-500 transition-colors flex items-center justify-center">
                <Zap size={20} className="fill-current" />
              </button>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500 font-mono">
            Únete a la tripulación. No te pierdas el lanzamiento.
          </p>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 flex gap-8"
        >
          <SocialIcon icon={<Twitter size={24} />} href="#" />
          <SocialIcon icon={<Instagram size={24} />} href="#" />
          <SocialIcon icon={<Youtube size={24} />} href="#" />
          <SocialIcon icon={<Skull size={24} />} href="#" />
        </motion.div>
      </main>

      {/* Footer Decoration */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50" />
      <div className="fixed bottom-4 right-6 text-[10px] font-mono text-slate-700 uppercase tracking-widest vertical-text select-none">
        System Status: Online // Protocol: Adventure
      </div>
    </div>
  );
}

function SocialIcon({ icon, href }: { icon: React.ReactNode, href: string }) {
  return (
    <a 
      href={href} 
      className="text-slate-500 hover:text-orange-500 transition-all hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]"
    >
      {icon}
    </a>
  );
}

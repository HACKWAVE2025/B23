import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, Users, Clock } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function LandingPage() {
  const [sites, setSites] = useState([]);
  
  useEffect(() => {
    fetchSites();
  }, []);
  
  const fetchSites = async () => {
    try {
      const response = await axios.get(`${API}/sites`);
      setSites(response.data);
    } catch (error) {
      console.error('Failed to fetch sites:', error);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1520283451192-c3b05d7db25b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwyfHxhbmNpZW50JTIwdGVtcGxlfGVufDB8fHx8MTc2MTkwNDQyNHww&ixlib=rb-4.1.0&q=85')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        </div>
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#D4AF37] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: '0',
              opacity: 0.3
            }}
            animate={{
              y: [0, -window.innerHeight],
              opacity: [0.2, 0.4, 0]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          />
        ))}
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-7xl md:text-8xl font-serif text-[#D4AF37] mb-6"
            style={{
              fontFamily: "'Playfair Display', serif",
              textShadow: '0 0 20px rgba(212, 175, 55, 0.5)'
            }}
          >
            TimeLeap
          </motion.h1>
          
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="h-1 bg-[#D4AF37] mx-auto mb-8 max-w-md"
          />
          
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-2xl md:text-3xl text-[#F5F1E8] mb-4 font-light"
          >
            Experience History Through Interactive 3D Reconstruction
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-sm md:text-base text-gray-300 mb-10"
          >
            Explore ancient monuments as they were, witness their transformation
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <Link
              to="/explore/hampi_virupaksha"
              className="inline-flex items-center gap-3 bg-[#D4AF37] hover:bg-[#C79F1F] text-[#2C1810] px-8 py-4 rounded-md font-semibold text-lg transition-all hover:scale-105 shadow-lg hover:shadow-2xl"
            >
              Begin Your Journey
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-[#D4AF37] rounded-full flex items-start justify-center p-2"
          >
            <motion.div 
              className="w-1 h-2 bg-[#D4AF37] rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </section>
      
      {/* Featured Sites Section */}
      <section className="py-20 px-6 bg-[#F5F1E8]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-serif text-[#2C1810] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Featured Monuments
            </h2>
            <p className="text-lg text-gray-600">Travel through time with our 3D reconstructions</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sites.map((site, index) => (
              <motion.div
                key={site.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
              >
                <Link to={`/explore/${site.id}`}>
                  <div className="relative h-96 rounded-lg overflow-hidden group cursor-pointer">
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-all duration-500 group-hover:scale-110"
                      style={{ 
                        backgroundImage: `url('${site.thumbnail_url}')`,
                        filter: 'brightness(0.6)'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#2C1810] opacity-80"></div>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                      <h3 className="text-3xl font-serif text-[#D4AF37] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {site.name}
                      </h3>
                      <p className="text-sm text-gray-300 mb-4">{site.location}</p>
                      
                      <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="bg-[#D4AF37] text-[#2C1810] px-6 py-2 rounded-md font-semibold opacity-0 group-hover:opacity-100 transition-all"
                      >
                        Explore in 3D
                      </motion.button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Statistics Section */}
      <section className="py-20 px-6 bg-white" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(212, 175, 55, 0.05) 10px, rgba(212, 175, 55, 0.05) 20px)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Globe, number: '50+', label: 'Monuments', subtext: 'Fully Reconstructed' },
              { icon: Clock, number: '10,000+', label: 'Years', subtext: 'Of History Explored' },
              { icon: Users, number: '15M+', label: 'Users', subtext: 'Worldwide' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="text-center p-8 bg-[#F5F1E8] rounded-lg hover:bg-[#D4AF37]/10 transition-all cursor-pointer"
              >
                <stat.icon className="w-16 h-16 mx-auto mb-4 text-[#D4AF37]" />
                <h3 className="text-5xl font-bold text-[#D4AF37] mb-2">{stat.number}</h3>
                <p className="text-xl font-semibold text-[#2C1810] mb-1">{stat.label}</p>
                <p className="text-sm text-gray-600">{stat.subtext}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-6 bg-[#2C1810] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif mb-6" 
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Ready to explore?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-300 mb-10"
          >
            Dive into interactive 3D reconstructions of the world's most iconic historical sites
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Link
              to="/explore/hampi_virupaksha"
              className="inline-flex items-center gap-3 bg-[#D4AF37] hover:bg-[#C79F1F] text-[#2C1810] px-8 py-4 rounded-md font-semibold text-lg transition-all hover:scale-105 shadow-lg"
            >
              Start Exploring
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-[#2C1810] text-white py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-serif text-[#D4AF37] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>TimeLeap</h3>
            <p className="text-sm text-gray-400">Experience history through immersive 3D reconstructions</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">About</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Our Mission</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Team</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Partners</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors">API</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors">GitHub</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
          <p>© 2024 TimeLeap. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
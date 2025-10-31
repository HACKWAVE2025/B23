import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ArrowLeft, MapPin, Calendar, Award, ExternalLink, Heart, Share2, MessageSquare, Send } from 'lucide-react';
import Hero3DSlider from '../components/Hero3DSlider';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { toast } from '../hooks/use-toast';
import { Toaster } from '../components/ui/toaster';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function ExplorePage() {
  const { siteId } = useParams();
  const [site, setSite] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [facts, setFacts] = useState([]);
  const [annotations, setAnnotations] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState('');
  const [userName, setUserName] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  useEffect(() => {
    if (siteId) {
      fetchSiteData();
      fetchTimeline();
      fetchFacts();
      fetchAnnotations();
    }
  }, [siteId]);
  
  const fetchSiteData = async () => {
    try {
      const response = await axios.get(`${API}/sites/${siteId}`);
      setSite(response.data);
    } catch (error) {
      console.error('Failed to fetch site:', error);
    }
  };
  
  const fetchTimeline = async () => {
    try {
      const response = await axios.get(`${API}/sites/${siteId}/timeline`);
      setTimeline(response.data);
    } catch (error) {
      console.error('Failed to fetch timeline:', error);
    }
  };
  
  const fetchFacts = async () => {
    try {
      const response = await axios.get(`${API}/sites/${siteId}/facts`);
      setFacts(response.data);
    } catch (error) {
      console.error('Failed to fetch facts:', error);
    }
  };
  
  const fetchAnnotations = async () => {
    try {
      const response = await axios.get(`${API}/sites/${siteId}/annotations`);
      setAnnotations(response.data);
    } catch (error) {
      console.error('Failed to fetch annotations:', error);
    }
  };
  
  const handleSubmitAnnotation = async () => {
    if (!newAnnotation.trim() || !userName.trim()) {
      toast({ title: "Error", description: "Please enter your name and annotation" });
      return;
    }
    
    try {
      await axios.post(`${API}/sites/${siteId}/annotations`, {
        site_id: siteId,
        user_name: userName,
        content: newAnnotation
      });
      
      setNewAnnotation('');
      toast({ title: "Success", description: "Your insight has been posted!" });
      fetchAnnotations();
    } catch (error) {
      console.error('Failed to post annotation:', error);
      toast({ title: "Error", description: "Failed to post annotation" });
    }
  };
  
  const handleChatSend = async () => {
    if (!chatMessage.trim()) return;
    
    const userMsg = { role: 'user', content: chatMessage };
    setChatHistory(prev => [...prev, userMsg]);
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API}/chat`, {
        session_id: sessionId,
        site_id: siteId,
        message: chatMessage
      });
      
      const aiMsg = { role: 'assistant', content: response.data.response };
      setChatHistory(prev => [...prev, aiMsg]);
      setChatMessage('');
    } catch (error) {
      console.error('Chat error:', error);
      toast({ title: "Error", description: "Failed to get response from AI" });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!site) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-[#2C1810] text-lg">Loading monument data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <Toaster />
      
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-[#2C1810]/95 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[#D4AF37] hover:text-[#C79F1F] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-xl font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>TimeLeap</span>
          </Link>
          
          <div className="text-center">
            <h1 className="text-xl font-serif text-[#D4AF37]" style={{ fontFamily: "'Playfair Display', serif" }}>{site.name}</h1>
            <p className="text-sm text-gray-400">{site.location}</p>
          </div>
          
          <Button 
            onClick={() => setShowChat(!showChat)}
            className="bg-[#D4AF37] hover:bg-[#C79F1F] text-[#2C1810]"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            AI Guide
          </Button>
        </div>
      </header>
      
      {/* Hero 3D Slider */}
      <Hero3DSlider site={site} />
      
      {/* Timeline Section */}
      <section className="py-16 px-6 bg-[#F5F1E8]">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-serif text-[#2C1810] text-center mb-12"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Historical Timeline
          </motion.h2>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#D4AF37]"></div>
            
            <div className="space-y-12">
              {timeline.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12'}`}>
                    <Card className="bg-white border-l-4 border-[#D4AF37] hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <p className="text-[#D4AF37] font-serif text-lg mb-2">{event.year}</p>
                        <h3 className="text-xl font-bold text-[#2C1810] mb-2">{event.title}</h3>
                        <p className="text-gray-600 text-sm">{event.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="relative flex items-center justify-center w-12 h-12">
                    <div className="absolute w-4 h-4 bg-[#D4AF37] rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                  
                  <div className="w-1/2"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Facts Grid */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-serif text-[#2C1810] text-center mb-12"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Key Facts & Historical Data
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facts.map((fact, index) => (
              <motion.div
                key={fact.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-l-4 border-[#D4AF37] hover:shadow-lg hover:bg-[#FFFBF7] transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <Calendar className="w-8 h-8 text-[#D4AF37] mb-3" />
                    <h3 className="text-lg font-bold text-[#2C1810] mb-2">{fact.title}</h3>
                    <p className="text-sm text-gray-600">{fact.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Annotations Section */}
      <section className="py-16 px-6 bg-[#F5F1E8]">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-serif text-[#2C1810] text-center mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Researcher Insights & Community Notes
          </motion.h2>
          <p className="text-center text-gray-600 mb-12">Contributions from historians, archaeologists, and researchers worldwide</p>
          
          {/* Add New Annotation */}
          <Card className="mb-8 bg-white">
            <CardContent className="p-6">
              <h3 className="font-semibold text-[#2C1810] mb-4">Share your research or observation</h3>
              <div className="space-y-4">
                <Input
                  placeholder="Your name..."
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="border-[#D4AF37] focus:ring-[#D4AF37]"
                />
                <Textarea
                  placeholder="Share your historical insight, observation, or research..."
                  value={newAnnotation}
                  onChange={(e) => setNewAnnotation(e.target.value)}
                  maxLength={500}
                  className="min-h-[100px] border-[#D4AF37] focus:ring-[#D4AF37]"
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{newAnnotation.length}/500</span>
                  <Button 
                    onClick={handleSubmitAnnotation}
                    className="bg-[#D4AF37] hover:bg-[#C79F1F] text-[#2C1810]"
                  >
                    Post Insight
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Annotations List */}
          <div className="space-y-4">
            {annotations.map((annotation, index) => (
              <motion.div
                key={annotation.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-[#FFFBF7] border-l-4 border-[#D4AF37] hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center text-white font-bold">
                        {annotation.user_name[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-[#2C1810]">{annotation.user_name}</span>
                          {annotation.badge && (
                            <span className="text-xs bg-[#D4AF37] text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              {annotation.badge}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {new Date(annotation.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3">{annotation.content}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <button className="flex items-center gap-1 hover:text-[#D4AF37] transition-colors">
                            <Heart className="w-4 h-4" />
                            {annotation.likes}
                          </button>
                          <button className="flex items-center gap-1 hover:text-[#D4AF37] transition-colors">
                            <Share2 className="w-4 h-4" />
                            Share
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Wikipedia Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-[#D4AF37]">
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-serif text-[#2C1810]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Learn More on Wikipedia
                </h3>
                <ExternalLink className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <p className="text-gray-700 mb-4">{site.description}</p>
              <a 
                href={`https://en.wikipedia.org/wiki/${site.name.replace(/ /g, '_')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D4AF37] hover:text-[#C79F1F] font-semibold underline"
              >
                Read Full Article →
              </a>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* AI Chat Panel (Floating) */}
      {showChat && (
        <motion.div
          initial={{ x: 400 }}
          animate={{ x: 0 }}
          exit={{ x: 400 }}
          className="fixed right-0 top-20 bottom-0 w-96 bg-white shadow-2xl border-l border-gray-200 z-40 flex flex-col"
        >
          <div className="bg-[#D4AF37] p-4 flex items-center justify-between">
            <h3 className="font-semibold text-[#2C1810]">AI Historical Guide</h3>
            <button onClick={() => setShowChat(false)} className="text-[#2C1810] hover:text-white">×</button>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {chatHistory.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Ask me anything about {site.name}!</p>
                </div>
              )}
              
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-[#D4AF37] text-[#2C1810]' : 'bg-gray-100 text-gray-800'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Ask about history..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                className="flex-1"
              />
              <Button 
                onClick={handleChatSend}
                disabled={isLoading}
                className="bg-[#D4AF37] hover:bg-[#C79F1F] text-[#2C1810]"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Footer */}
      <footer className="bg-[#2C1810] text-white py-8 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-400">© 2024 TimeLeap. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default ExplorePage;
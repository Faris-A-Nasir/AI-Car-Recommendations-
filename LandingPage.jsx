import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, MessageSquare } from 'lucide-react';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')",
          filter: "brightness(0.3)"
        }}
      />

      {/* Navigation Buttons (Top Right) */}
      <div className="absolute top-6 right-6 flex gap-4 z-20">
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sign In
        </button>
        <button
          onClick={() => navigate('/register')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sign Up
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="flex items-center mb-8">
          <Car className="w-12 h-12 text-blue-500 mr-4" />
          <h1 className="text-5xl font-bold text-white">CarAI Advisor</h1>
        </div>
        
        <p className="text-xl text-gray-300 mb-12 text-center max-w-2xl">
          Your personal AI assistant for finding the perfect car. Get expert recommendations, and make informed decisions with our advanced AI chatbot.
        </p>
        
        {/* Get Started Button */}
        <button
          onClick={() => navigate('/chat')}
          className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Get Started
        </button>

        {/* Feature Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full">
          <FeatureCard
            icon={<MessageSquare className="w-8 h-8 text-blue-500" />}
            title="AI-Powered Chat"
            description="Get instant, intelligent responses to all your car-related questions"
          />
          <FeatureCard
            icon={<Car className="w-8 h-8 text-blue-500" />}
            title="Expert Recommendations"
            description="Receive personalized car suggestions based on your preferences"
          />
          <FeatureCard
            icon={<MessageSquare className="w-8 h-8 text-blue-500" />}
            title="Chat History"
            description="Access your previous conversations and recommendations anytime"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}

export default LandingPage;

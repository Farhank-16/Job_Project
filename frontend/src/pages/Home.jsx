import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Users, Shield, Star, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: MapPin,
      title: 'Location Based',
      description: 'Find jobs near your area',
    },
    {
      icon: Users,
      title: 'Skill Matching',
      description: 'Get matched with your skills',
    },
    {
      icon: Shield,
      title: 'Verified Profiles',
      description: 'Trust verified workers',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700">
      {/* Hero Section */}
      <div className="px-6 pt-12 pb-8">
        <div className="flex items-center space-x-2 text-white mb-8">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-primary-600" />
          </div>
          <span className="text-xl font-bold">JobNest</span>
        </div>

        <h1 className="text-3xl font-bold text-white leading-tight mb-4">
          Find Skilled Work
          <br />
          Near Your Area
        </h1>
        <p className="text-primary-100 text-lg mb-8">
          Connect with local opportunities and skilled workers in rural areas
        </p>

        <Button
          onClick={() => navigate('/login')}
          variant="secondary"
          size="lg"
          fullWidth
          icon={ArrowRight}
          iconPosition="right"
        >
          Get Started
        </Button>
      </div>

      {/* Features Section */}
      <div className="bg-white rounded-t-3xl pt-8 pb-12 px-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Why JobNest?</h2>
        
        <div className="space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600">1000+</p>
            <p className="text-sm text-gray-500">Jobs Posted</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600">500+</p>
            <p className="text-sm text-gray-500">Workers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600">50+</p>
            <p className="text-sm text-gray-500">Villages</p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 p-6 bg-primary-50 rounded-xl">
          <h3 className="font-semibold text-primary-900 mb-2">Ready to start?</h3>
          <p className="text-sm text-primary-700 mb-4">
            Join thousands of workers and employers in your area
          </p>
          <Button onClick={() => navigate('/login')} fullWidth>
            Sign In / Register
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
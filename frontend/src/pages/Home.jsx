import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, ShieldCheck, Star, ArrowRight, Briefcase, TrendingUp } from 'lucide-react';
import Logo from '../components/ui/Logo';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">

      {/* Hero */}
      <div className="bg-brand px-6 pt-8 pb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-white opacity-[0.04] -translate-y-20 translate-x-20" />
        <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-white opacity-[0.04] translate-y-14 -translate-x-14" />

        {/* Logo */}
        <div className="mb-10">
          <Logo size="lg" light />
        </div>

        <div className="page-enter">
          <h1 className="font-display text-3xl font-extrabold text-white leading-tight mb-3">
            Find the right job.<br />
            <span className="text-blue-200">Hire the right talent.</span>
          </h1>
          <p className="text-blue-100 text-sm leading-relaxed mb-8">
            Connect with local opportunities and skilled professionals near you.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary w-full py-4 text-base justify-between"
            style={{ borderRadius: '12px', background: 'white', color: '#1d4ed8', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white mx-4 mt-4 rounded-2xl shadow-lg grid grid-cols-3 divide-x divide-slate-100 py-4">
        {[
          { value: '10K+', label: 'Jobs Posted' },
          { value: '25K+', label: 'Professionals' },
          { value: '500+', label: 'Companies' },
        ].map(({ value, label }) => (
          <div key={label} className="text-center px-2">
            <p className="font-display text-xl font-extrabold text-blue-600">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="flex-1 bg-slate-50 px-4 pt-7 pb-10">
        <h2 className="font-display text-base font-bold text-slate-700 mb-4">Why JobNest?</h2>
        <div className="space-y-3">
          {[
            { icon: MapPin,      bg: '#eff6ff', fg: '#2563eb', title: 'Location-Based Search',   desc: 'Find jobs within your preferred distance' },
            { icon: Users,       bg: '#faf5ff', fg: '#7e22ce', title: 'Smart Skill Matching',    desc: 'Get matched based on your skills & experience' },
            { icon: ShieldCheck, bg: '#f0fdf4', fg: '#15803d', title: 'Verified Profiles',       desc: 'Trusted employers and verified candidates' },
            { icon: Star,        bg: '#fefce8', fg: '#ca8a04', title: 'Skill Certification',     desc: 'Take exams, earn badges, stand out' },
          ].map(({ icon: Icon, bg, fg, title, desc }) => (
            <div key={title} className="card p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: bg }}>
                <Icon className="w-5 h-5" style={{ color: fg }} />
              </div>
              <div>
                <p className="font-display font-semibold text-slate-800 text-sm">{title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Employer CTA */}
        <div className="mt-6 bg-brand rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-4 h-4 text-blue-200" />
            <span className="text-blue-200 text-xs font-semibold uppercase tracking-wider">For Employers</span>
          </div>
          <p className="font-display font-bold text-white text-base mb-4">
            Post jobs & find the right candidates fast
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-white text-blue-700 font-display font-bold py-3 rounded-xl text-sm"
          >
            Start Hiring →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
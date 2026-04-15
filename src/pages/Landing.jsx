import { ArrowRight, Droplets, MessageSquare, Camera, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div>
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="max-w-6xl mx-auto px-6 py-20 relative z-10 text-center">
          <h1 className="text-5xl sm:text-7xl font-bold text-white mb-6 leading-tight" style={{textShadow: '0 2px 4px rgba(0,0,0,0.3)'}}>
            Predicting Floods Before They Happen
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-10 leading-relaxed" style={{textShadow: '0 1px 2px rgba(0,0,0,0.3)'}}>
            Early warning system for Gaborone using IoT sensors, community intelligence, and predictive analytics
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard" className="button-primary text-lg">
              View Live Dashboard
            </Link>
            <a href="#how" className="button-secondary text-lg">
              Learn How It Works
            </a>
          </div>
        </div>
      </section>

      <section className="bg-primary py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-headline text-primary mb-4">
              The Challenge: Gaborone's Flood Risk
            </h2>
            <p className="text-lg text-body text-secondary max-w-3xl mx-auto">
              Urban flooding poses significant threats to life, infrastructure, and economic stability in Botswana's capital
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 border border-custom rounded-lg shadow-professional bg-secondary">
              <div className="text-4xl font-bold text-headline text-primary mb-2">9</div>
              <div className="text-caption text-secondary uppercase tracking-wide mb-1">Fatalities</div>
              <div className="text-body text-secondary">February 2025 floods</div>
            </div>
            <div className="text-center p-8 border border-custom rounded-lg shadow-professional bg-secondary">
              <div className="text-4xl font-bold text-headline text-primary mb-2">P10M+</div>
              <div className="text-caption text-secondary uppercase tracking-wide mb-1">Annual Damage</div>
              <div className="text-body text-secondary">Infrastructure and property</div>
            </div>
            <div className="text-center p-8 border border-custom rounded-lg shadow-professional bg-secondary">
              <div className="text-4xl font-bold text-headline text-primary mb-2">15</div>
              <div className="text-caption text-secondary uppercase tracking-wide mb-1">Minutes Warning</div>
              <div className="text-body text-secondary">Current system limitations</div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-headline text-primary mb-4">
              Our Solution: Integrated Intelligence
            </h2>
            <p className="text-lg text-body text-secondary max-w-3xl mx-auto">
              Multi-layered approach combining real-time monitoring, community engagement, and predictive analytics
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-primary p-6 rounded-lg border border-custom shadow-professional">
              <div className="w-12 h-12 bg-floodwater rounded-lg flex items-center justify-center mb-4">
                <Droplets className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-headline text-primary mb-2">Infrastructure Monitoring</h3>
              <p className="text-body text-secondary text-sm leading-relaxed">
                Network of 50+ IoT sensors monitoring water levels, drain blockages, and pump status in real-time
              </p>
            </div>
            <div className="bg-primary p-6 rounded-lg border border-custom shadow-professional">
              <div className="w-12 h-12 bg-floodwater rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-headline text-primary mb-2">Community Intelligence</h3>
              <p className="text-body text-secondary text-sm leading-relaxed">
                AI-powered analysis of social media and citizen reports for early flood detection
              </p>
            </div>
            <div className="bg-primary p-6 rounded-lg border border-custom shadow-professional">
              <div className="w-12 h-12 bg-floodwater rounded-lg flex items-center justify-center mb-4">
                <Camera className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-headline text-primary mb-2">Visual Analysis</h3>
              <p className="text-body text-secondary text-sm leading-relaxed">
                Computer vision system identifies drainage blockages from citizen-submitted photos
              </p>
            </div>
            <div className="bg-primary p-6 rounded-lg border border-custom shadow-professional">
              <div className="w-12 h-12 bg-floodwater rounded-lg flex items-center justify-center mb-4">
                <Brain className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-headline text-primary mb-2">Predictive Analytics</h3>
              <p className="text-body text-secondary text-sm leading-relaxed">
                Machine learning models analyze 7 years of historical data for 92% accuracy
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="bg-primary py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-headline text-primary mb-4">
              How It Works
            </h2>
            <p className="text-lg text-body text-secondary max-w-3xl mx-auto">
              Five-step process from detection to life-saving action
            </p>
          </div>
          <div className="grid md:grid-cols-5 gap-4 items-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-concrete rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <div className="text-caption text-secondary uppercase tracking-wide">Sensors Detect</div>
            </div>
            <ArrowRight className="mx-auto text-secondary" />
            <div className="text-center">
              <div className="w-16 h-16 bg-concrete rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <div className="text-caption text-secondary uppercase tracking-wide">AI Analyzes</div>
            </div>
            <ArrowRight className="mx-auto text-secondary" />
            <div className="text-center">
              <div className="w-16 h-16 bg-concrete rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <div className="text-caption text-secondary uppercase tracking-wide">Predictions Made</div>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4 items-center mt-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-concrete rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">4</span>
              </div>
              <div className="text-caption text-secondary uppercase tracking-wide">Alerts Sent</div>
            </div>
            <ArrowRight className="mx-auto text-secondary" />
            <div className="text-center">
              <div className="w-16 h-16 bg-concrete rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">5</span>
              </div>
              <div className="text-caption text-secondary uppercase tracking-wide">Lives Saved</div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-headline text-primary mb-4">
              Measurable Impact
            </h2>
            <p className="text-lg text-body text-secondary max-w-3xl mx-auto">
              Proven results from pilot implementations and modeling
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-primary rounded-lg border border-custom shadow-professional">
              <div className="text-3xl font-bold text-headline text-primary mb-2">6-24h</div>
              <div className="text-body text-secondary">Advance warning time</div>
            </div>
            <div className="text-center p-6 bg-primary rounded-lg border border-custom shadow-professional">
              <div className="text-3xl font-bold text-headline text-primary mb-2">90%</div>
              <div className="text-body text-secondary">Reduction in fatalities</div>
            </div>
            <div className="text-center p-6 bg-primary rounded-lg border border-custom shadow-professional">
              <div className="text-3xl font-bold text-headline text-primary mb-2">65%</div>
              <div className="text-body text-secondary">Reduction in property damage</div>
            </div>
            <div className="text-center p-6 bg-primary rounded-lg border border-custom shadow-professional">
              <div className="text-3xl font-bold text-headline text-primary mb-2">P300K</div>
              <div className="text-body text-secondary">Pilot cost vs P10M damage</div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-headline text-primary mb-6">
            Ready to Protect Gaborone?
          </h2>
          <p className="text-lg text-body text-secondary mb-10">
            Join us in implementing early warning systems across Botswana
          </p>
          <Link to="/dashboard" className="button-primary text-lg">
            View Live Dashboard
          </Link>
          <p className="mt-6 text-sm text-secondary">
            CHAABO 2026 Climate Resilience Hackathon
          </p>
        </div>
      </section>
    </div>
  );
}


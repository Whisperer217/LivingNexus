import { useState } from 'react';
import { Shield, Heart, Sprout, AlertCircle, Database, Lock, Users, Zap, CheckCircle, ArrowRight } from 'lucide-react';

function App() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email submission here
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-950 to-emerald-900/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-900/10 via-transparent to-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3 mb-12">
            <Database className="w-10 h-10 text-emerald-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Living Nexus</h1>
              <p className="text-sm text-orange-400 font-medium">by Command Domains</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full mb-6">
                <span className="text-orange-400 font-semibold text-sm">From Trauma to Innovations</span>
              </div>

              <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Take Back Your Family's Data. Build Your Own Future.
              </h2>

              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                The trauma-informed AI system that runs entirely on <span className="text-emerald-400 font-semibold">YOUR computer</span>.
                No cloud. No subscriptions. No Big Tech.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                >
                  Join the Waitlist <ArrowRight className="w-5 h-5" />
                </button>
                <button className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-white font-semibold rounded-lg border border-slate-700 transition-all">
                  Learn More
                </button>
              </div>

              <div className="flex items-center gap-6 text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm">$49.98 One-Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm">No Subscriptions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm">100% Local</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <Lock className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-white mb-1">100% Local Control</h3>
                      <p className="text-sm text-slate-400">Your data never leaves your home</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <Heart className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-white mb-1">Trauma-Informed Design</h3>
                      <p className="text-sm text-slate-400">Safe for kids and vulnerable users</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <Zap className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-white mb-1">Family Independence</h3>
                      <p className="text-sm text-slate-400">Build, create, and grow together</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold text-white mb-6">
            Empower Families with Data Sovereignty Through Local-First AI
          </h3>
          <p className="text-xl text-slate-300 leading-relaxed">
            Break free from Big Tech extraction and build true self-sufficiency.
            Living Nexus is more than software—it's a <span className="text-emerald-400 font-semibold">movement</span> toward family independence.
          </p>
        </div>
      </section>

      {/* Four Pillars */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-4xl font-bold text-white text-center mb-16">
            Four Pillars of Independence
          </h3>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Data Sovereignty */}
            <div className="group bg-gradient-to-br from-blue-900/20 to-blue-950/20 border border-blue-500/20 rounded-2xl p-8 hover:border-blue-500/40 transition-all">
              <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-blue-400" />
              </div>
              <h4 className="text-2xl font-bold text-white mb-4">Data Sovereignty</h4>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>100% local, zero cloud dependency</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>Your data never leaves your home</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>Break free from Big Tech extraction</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>Decentralized ecosystem</span>
                </li>
              </ul>
            </div>

            {/* Trauma-Informed AI */}
            <div className="group bg-gradient-to-br from-emerald-900/20 to-emerald-950/20 border border-emerald-500/20 rounded-2xl p-8 hover:border-emerald-500/40 transition-all">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Heart className="w-7 h-7 text-emerald-400" />
              </div>
              <h4 className="text-2xl font-bold text-white mb-4">Trauma-Informed AI</h4>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Designed to prevent neurological harm</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Safe for kids and vulnerable users</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Parental controls built-in</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Educational focus</span>
                </li>
              </ul>
            </div>

            {/* Self-Sufficiency Tools */}
            <div className="group bg-gradient-to-br from-orange-900/20 to-orange-950/20 border border-orange-500/20 rounded-2xl p-8 hover:border-orange-500/40 transition-all">
              <div className="w-14 h-14 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sprout className="w-7 h-7 text-orange-400" />
              </div>
              <h4 className="text-2xl font-bold text-white mb-4">Self-Sufficiency Tools</h4>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <span>Grow your own food (gardening guides)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <span>Build your own games and apps</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <span>Create intellectual property</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <span>Family creativity unleashed</span>
                </li>
              </ul>
            </div>

            {/* Emergency Support */}
            <div className="group bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-600/30 rounded-2xl p-8 hover:border-slate-500/40 transition-all">
              <div className="w-14 h-14 bg-slate-700/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <AlertCircle className="w-7 h-7 text-slate-300" />
              </div>
              <h4 className="text-2xl font-bold text-white mb-4">Emergency Support</h4>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>Medical guidance without pressure</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>Keep situations under control</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>Escalate to authorities if needed</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>Always trauma-informed</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-4xl mx-auto px-6">
          <h3 className="text-4xl font-bold text-white text-center mb-4">
            Simple, Honest Pricing
          </h3>
          <p className="text-xl text-slate-400 text-center mb-12">
            No tricks. No subscriptions. Own it forever.
          </p>

          <div className="bg-gradient-to-br from-emerald-900/20 via-slate-900/50 to-blue-900/20 border-2 border-emerald-500/30 rounded-3xl p-10">
            <div className="text-center mb-8">
              <div className="inline-block px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full mb-4">
                <span className="text-emerald-400 font-semibold">One-Time Purchase</span>
              </div>
              <h4 className="text-5xl font-bold text-white mb-2">$49.98</h4>
              <p className="text-slate-400">Base package for 1-10 users</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold">Complete System Access</p>
                  <p className="text-slate-400 text-sm">All four pillars included</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold">1-10 Users Included</p>
                  <p className="text-slate-400 text-sm">Perfect for most families</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold">Lifetime License</p>
                  <p className="text-slate-400 text-sm">No recurring fees, ever</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold">Optional Updates: $9.99</p>
                  <p className="text-slate-400 text-sm">Per major release - your choice</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold">Scale as Needed</p>
                  <p className="text-slate-400 text-sm">Pay-per-slot over 10 users</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              Join the Waitlist <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-gradient-to-br from-orange-900/10 to-slate-900/30 border border-orange-500/20 rounded-2xl p-12 text-center">
            <Users className="w-16 h-16 text-orange-400 mx-auto mb-6" />
            <blockquote className="text-2xl lg:text-3xl text-white font-medium mb-6 leading-relaxed">
              "Built by someone who understands trauma and innovation. This isn't just software—it's a movement toward family independence."
            </blockquote>
            <p className="text-slate-400 text-lg">
              Join <span className="text-emerald-400 font-bold">500+ families</span> taking back their data
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-6">
          <h3 className="text-4xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h3>

          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all">
              <h4 className="text-xl font-bold text-white mb-3">Why local-first?</h4>
              <p className="text-slate-300 leading-relaxed">
                Privacy, sovereignty, and freedom from Big Tech. Your family's data belongs to you—not in corporate data centers.
                Local-first means no cloud dependency, no data extraction, and complete control over your digital life.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all">
              <h4 className="text-xl font-bold text-white mb-3">Is it safe for kids?</h4>
              <p className="text-slate-300 leading-relaxed">
                Absolutely. Living Nexus uses trauma-informed design principles to prevent neurological harm.
                Built-in parental controls, educational focus, and safe-by-design architecture protect vulnerable users while empowering learning.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all">
              <h4 className="text-xl font-bold text-white mb-3">What about updates?</h4>
              <p className="text-slate-300 leading-relaxed">
                Updates are completely optional. Major releases cost $9.99 each—but you decide if and when to upgrade.
                Your current version will keep working forever. No forced updates, no subscription pressure.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all">
              <h4 className="text-xl font-bold text-white mb-3">How many users can I have?</h4>
              <p className="text-slate-300 leading-relaxed">
                The base package includes 1-10 users, perfect for most families. Need more?
                You can scale by purchasing additional user slots. No artificial limits—just honest, straightforward pricing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section id="waitlist" className="py-20 bg-gradient-to-br from-emerald-900/20 via-slate-950 to-blue-900/20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h3 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Join 500+ Families Taking Back Their Data
          </h3>
          <p className="text-xl text-slate-300 mb-10">
            Be among the first to experience true data sovereignty. Early access launching soon.
          </p>

          {submitted ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 max-w-md mx-auto">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-emerald-400 font-semibold text-lg">You're on the list!</p>
              <p className="text-slate-300 text-sm mt-2">We'll be in touch soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-6 py-4 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-emerald-500/25 whitespace-nowrap"
                >
                  Join Waitlist
                </button>
              </div>
              <p className="text-slate-500 text-sm mt-4">
                No spam. Just updates on your path to digital independence.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-emerald-400" />
              <div>
                <h1 className="text-lg font-bold text-white">Living Nexus</h1>
                <p className="text-sm text-orange-400">Command Domains - From Trauma to Innovations</p>
              </div>
            </div>

            <div className="flex gap-6 text-slate-400 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
            <p>© 2025 Command Domains. All rights reserved. Built for families, by those who care.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

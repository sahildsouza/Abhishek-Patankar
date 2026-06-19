import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

interface Transformation {
  id: string;
  before_image_url: string;
  after_image_url: string;
  description: string;
}

interface Review {
  id: string;
  client_name: string;
  review_text: string;
  rating: number;
}

export default function Registration() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age_group: '18-25',
    fitness_status: 'Just starting out',
    goal: 'Lose weight and tone up',
    biggest_struggle: 'Diet/Nutrition',
    injuries: 'No'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [transformations, setTransformations] = useState<Transformation[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const [transRes, revRes] = await Promise.all([
        supabase.from('transformations').select('*').order('created_at', { ascending: false }),
        supabase.from('reviews').select('*').order('created_at', { ascending: false })
      ]);
      if (transRes.data) setTransformations(transRes.data);
      if (revRes.data) setReviews(revRes.data);
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { error: sbError } = await supabase.from('registrations').insert([formData]);

    setLoading(false);
    if (sbError) {
      setError(sbError.message);
    } else {
      setSuccess(true);
      setFormData({ 
        name: '', 
        email: '', 
        phone: '', 
        age_group: '18-25',
        fitness_status: 'Just starting out', 
        goal: 'Lose weight and tone up',
        biggest_struggle: 'Diet/Nutrition',
        injuries: 'No'
      });
    }
  };

  const scrollToForm = () => {
    document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#050505] min-h-screen selection:bg-[#FF9933] selection:text-black">
      
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-[#050505]/90 backdrop-blur-md border-b-2 border-neutral-900 px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-black tracking-widest text-white">ABHISHEK<span className="text-[#FF9933]">FITNESS</span></div>
        <button onClick={() => navigate('/admin')} className="text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">
          Admin Login
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505] z-10"></div>
          {/* A brutalist geometric background element */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] border-[40px] border-[#111] rotate-45 opacity-50 z-0"></div>
          <div className="absolute top-1/3 left-1/3 -translate-x-1/2 w-[600px] h-[600px] border-[20px] border-[#FF9933]/10 rotate-12 z-0"></div>
        </div>
        
        <div className="relative z-20 max-w-5xl mx-auto text-center">
          <p className="text-[#FF9933] font-bold mb-4 tracking-[0.3em] uppercase text-sm">Namaste & Swagat</p>
          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-none tracking-tight">
            FORGE YOUR <br className="hidden md:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9933] to-[#e68a2e] italic">ULTIMATE FORM</span>
          </h1>
          <p className="text-xl md:text-2xl text-neutral-400 font-['Inter'] mb-12 max-w-2xl mx-auto font-light">
            Join the exclusive 90-minute live webinar on elite training protocols. Zero fluff. Pure results. <span className="text-white font-semibold">June 21, 2026.</span>
          </p>
          <button onClick={scrollToForm} className="bg-[#FF9933] text-black text-lg md:text-xl font-black uppercase tracking-widest py-5 px-12 rounded-none hover:bg-white hover:text-black transition-all duration-300 transform hover:-translate-y-1">
            CLAIM YOUR SPOT
          </button>
        </div>
      </section>

      {/* Coach Section */}
      <section className="py-24 px-6 bg-[#0a0a0a] border-y-2 border-neutral-900 relative">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <div className="text-[#FF9933] font-bold tracking-[0.2em] uppercase text-sm mb-4">The Architect</div>
            <h2 className="text-5xl font-black mb-6">COACH ABHISHEK PATANKAR</h2>
            <p className="text-neutral-400 font-['Inter'] leading-relaxed mb-8 text-lg">
              With years of dedicated research and hands-on experience transforming hundreds of physiques, Abhishek brings a unique, culturally-rooted yet scientifically rigorous approach to fitness. His methods shatter plateaus and redefine what your body is capable of.
            </p>
            <div className="flex flex-col gap-4 font-['Inter'] font-semibold text-neutral-300">
              <div className="flex items-center gap-4 bg-[#111] p-4 border border-neutral-800 hover:border-[#FF9933] transition-colors">
                <span className="text-[#FF9933] text-xl">📞</span> 
                <a href="tel:+917738918466" className="hover:text-white transition-colors">+91 77389 18466</a>
              </div>
              <div className="flex items-center gap-4 bg-[#111] p-4 border border-neutral-800 hover:border-[#FF9933] transition-colors">
                <span className="text-[#FF9933] text-xl">✉️</span> 
                <a href="mailto:patankarabhishek126@gmail.com" className="hover:text-white transition-colors break-all">patankarabhishek126@gmail.com</a>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2 flex justify-center">
            <div className="w-full max-w-md aspect-square bg-[#111] border-4 border-[#FF9933] relative overflow-hidden flex items-center justify-center shadow-[20px_20px_0px_0px_rgba(255,153,51,0.2)] group">
              <img src="/coach-abhishek.jpg" alt="Coach Abhishek Patankar" className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-700 pointer-events-none"></div>
              <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] pointer-events-none"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Transformations Gallery / Slider */}
      {transformations.length > 0 && (
        <section className="py-24 bg-[#050505] overflow-hidden">
          <div className="w-full">
            <div className="text-center mb-16 px-6">
              <h2 className="text-5xl font-black mb-4">THE EVIDENCE</h2>
              <p className="text-neutral-500 font-['Inter'] text-lg">Real results from the Abhishek Fitness protocol. Swipe to see more.</p>
            </div>
            
            {/* The Horizontal Slider container */}
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-8 pb-12 px-6 lg:px-12 custom-scrollbar">
              {transformations.map(trans => (
                <div key={trans.id} className="snap-center shrink-0 w-[90vw] md:w-[700px] bg-[#0a0a0a] border-2 border-neutral-900 overflow-hidden flex flex-col shadow-2xl">
                  
                  <div className="flex flex-1 relative bg-black">
                    {/* Before Image Side */}
                    <div className="w-1/2 relative group">
                      <div className="absolute top-4 left-4 z-10 bg-black/80 px-3 py-1 font-black text-xs tracking-widest uppercase border border-neutral-800 text-neutral-400">Before</div>
                      <img 
                        src={trans.before_image_url} 
                        alt="Before" 
                        className="w-full h-[300px] md:h-[450px] object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700 opacity-90"
                      />
                    </div>
                    
                    {/* The Divider line */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-[#FF9933] z-20 shadow-[0_0_15px_rgba(255,153,51,0.5)] transform -translate-x-1/2"></div>
                    
                    {/* After Image Side */}
                    <div className="w-1/2 relative group">
                      <div className="absolute top-4 right-4 z-10 bg-[#FF9933] text-black px-3 py-1 font-black text-xs tracking-widest uppercase shadow-lg">After</div>
                      <img 
                        src={trans.after_image_url} 
                        alt="After" 
                        className="w-full h-[300px] md:h-[450px] object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700"
                      />
                    </div>
                  </div>
                  
                  {/* Card Description */}
                  <div className="p-6 bg-[#111] border-t-4 border-[#FF9933]/20 flex items-center justify-center min-h-[80px]">
                    <p className="text-white font-['Inter'] font-bold text-lg md:text-xl text-center tracking-wide uppercase">
                      "{trans.description}"
                    </p>
                  </div>
                  
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Client Testimonials */}
      {reviews.length > 0 && (
        <section className="py-24 px-6 bg-[#0a0a0a] border-t-2 border-neutral-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black mb-4">CLIENT TESTIMONIALS</h2>
              <p className="text-neutral-500 font-['Inter'] text-lg">Words from those who survived the protocol.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map(review => (
                <div key={review.id} className="bg-[#050505] border-2 border-neutral-800 p-8 flex flex-col justify-between hover:border-[#FF9933]/50 transition-colors">
                  <div>
                    <div className="flex text-[#FF9933] text-lg mb-4">
                      {Array(review.rating).fill('★').join('')}
                      {Array(5 - review.rating).fill('☆').join('')}
                    </div>
                    <p className="font-['Inter'] text-neutral-300 italic mb-8 leading-relaxed">
                      "{review.review_text}"
                    </p>
                  </div>
                  <div>
                    <div className="w-10 h-1 bg-[#FF9933] mb-4"></div>
                    <h3 className="font-black text-white text-xl tracking-wider uppercase">{review.client_name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Registration Form */}
      <section id="registration-form" className="py-24 px-6 bg-[#0a0a0a] border-t-2 border-[#FF9933]/30 relative overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black mb-4">SECURE YOUR ACCESS</h2>
            <p className="text-neutral-400 font-['Inter']">Spaces are strictly limited to ensure high-quality interaction.</p>
          </div>

          <div className="bg-[#050505] border-2 border-neutral-800 p-8 md:p-12 shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#FF9933]"></div>
            
            {success && (
              <div className="bg-green-900/20 border-2 border-green-500 text-green-400 p-6 mb-8 text-center font-bold uppercase tracking-widest text-sm">
                Spot Secured Successfully. Prepare yourself.
              </div>
            )}
            
            {error && (
              <div className="bg-red-900/20 border-2 border-red-500 text-red-400 p-6 mb-8 text-center font-bold uppercase tracking-widest text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 font-['Inter']">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase tracking-widest">Full Name</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleChange} 
                    className="w-full bg-[#111] border border-neutral-800 rounded-none px-4 py-4 text-white focus:outline-none focus:border-[#FF9933] transition-colors" placeholder="e.g. Rahul Sharma" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase tracking-widest">Email Address</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} 
                    className="w-full bg-[#111] border border-neutral-800 rounded-none px-4 py-4 text-white focus:outline-none focus:border-[#FF9933] transition-colors" placeholder="rahul@example.com" />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase tracking-widest">Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} 
                    className="w-full bg-[#111] border border-neutral-800 rounded-none px-4 py-4 text-white focus:outline-none focus:border-[#FF9933] transition-colors" placeholder="+91 90000 00000" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase tracking-widest">Age Group</label>
                  <select name="age_group" value={formData.age_group} onChange={handleChange} 
                    className="w-full bg-[#111] border border-neutral-800 rounded-none px-4 py-4 text-white focus:outline-none focus:border-[#FF9933] transition-colors appearance-none">
                    <option value="Under 18">Under 18</option>
                    <option value="18-25">18-25</option>
                    <option value="26-35">26-35</option>
                    <option value="36-45">36-45</option>
                    <option value="46+">46+</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase tracking-widest">How active are you currently?</label>
                  <select name="fitness_status" value={formData.fitness_status} onChange={handleChange} 
                    className="w-full bg-[#111] border border-neutral-800 rounded-none px-4 py-4 text-white focus:outline-none focus:border-[#FF9933] transition-colors appearance-none">
                    <option value="Just starting out">I'm just starting out</option>
                    <option value="Working out occasionally">I work out occasionally</option>
                    <option value="Training regularly">I train regularly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase tracking-widest">What is your main goal?</label>
                  <select name="goal" value={formData.goal} onChange={handleChange} 
                    className="w-full bg-[#111] border border-neutral-800 rounded-none px-4 py-4 text-white focus:outline-none focus:border-[#FF9933] transition-colors appearance-none">
                    <option value="Lose weight and tone up">Lose weight and tone up</option>
                    <option value="Build muscle and get stronger">Build muscle and get stronger</option>
                    <option value="Improve stamina">Improve stamina</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase tracking-widest">Biggest struggle right now?</label>
                  <select name="biggest_struggle" value={formData.biggest_struggle} onChange={handleChange} 
                    className="w-full bg-[#111] border border-neutral-800 rounded-none px-4 py-4 text-white focus:outline-none focus:border-[#FF9933] transition-colors appearance-none">
                    <option value="Diet/Nutrition">Diet & Nutrition</option>
                    <option value="Consistency">Staying Consistent</option>
                    <option value="Not knowing what to do">Not knowing what to do</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase tracking-widest">Any injuries?</label>
                  <select name="injuries" value={formData.injuries} onChange={handleChange} 
                    className="w-full bg-[#111] border border-neutral-800 rounded-none px-4 py-4 text-white focus:outline-none focus:border-[#FF9933] transition-colors appearance-none">
                    <option value="No">No, I'm fully healthy</option>
                    <option value="Yes - Minor">Yes, a minor ache/issue</option>
                    <option value="Yes - Major">Yes, something serious</option>
                  </select>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-[#FF9933] text-black font-black py-5 mt-4 transition-colors hover:bg-white disabled:opacity-50 text-xl tracking-[0.2em] uppercase border-none outline-none">
                {loading ? 'INITIALIZING...' : 'REGISTER NOW'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#050505] py-12 border-t border-neutral-900 text-center">
        <p className="text-neutral-600 font-['Inter'] text-sm uppercase tracking-widest">© 2026 Abhishek Fitness. All rights reserved.</p>
      </footer>
    </div>
  );
}

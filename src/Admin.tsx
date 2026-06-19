import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string;
  age_group?: string;
  fitness_status: string;
  goal: string;
  biggest_struggle?: string;
  injuries?: string;
  created_at: string;
}

interface Transformation {
  id: string;
  before_image_url: string;
  after_image_url: string;
  description: string;
  created_at: string;
}

interface Review {
  id: string;
  client_name: string;
  review_text: string;
  rating: number;
  created_at: string;
}

export default function Admin() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [transformations, setTransformations] = useState<Transformation[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState<'registrations' | 'transformations' | 'reviews'>('registrations');
  
  // Upload states
  const [uploadBefore, setUploadBefore] = useState<File | null>(null);
  const [uploadAfter, setUploadAfter] = useState<File | null>(null);
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploading, setUploading] = useState(false);

  // Review states
  const [reviewName, setReviewName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchData();
      else setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchData();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [regRes, transRes, revRes] = await Promise.all([
      supabase.from('registrations').select('*').order('created_at', { ascending: false }),
      supabase.from('transformations').select('*').order('created_at', { ascending: false }),
      supabase.from('reviews').select('*').order('created_at', { ascending: false })
    ]);
    
    if (regRes.data) setRegistrations(regRes.data);
    if (transRes.data) setTransformations(transRes.data);
    if (revRes.data) setReviews(revRes.data);
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: emailInput,
      password: passwordInput,
    });
    if (error) {
      alert(error.message);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP, GIF.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: 5MB.`;
    }
    return null;
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadBefore || !uploadAfter) return;

    const beforeErr = validateFile(uploadBefore);
    if (beforeErr) { alert('Before image: ' + beforeErr); return; }
    const afterErr = validateFile(uploadAfter);
    if (afterErr) { alert('After image: ' + afterErr); return; }

    setUploading(true);

    const uploadFile = async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const { error } = await supabase.storage.from('transformations').upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from('transformations').getPublicUrl(fileName);
      return data.publicUrl;
    };

    try {
      const [beforeUrl, afterUrl] = await Promise.all([
        uploadFile(uploadBefore),
        uploadFile(uploadAfter)
      ]);

      const { error: dbError } = await supabase
        .from('transformations')
        .insert([{ before_image_url: beforeUrl, after_image_url: afterUrl, description: uploadDesc.trim() }]);

      if (dbError) throw dbError;

      setUploadBefore(null);
      setUploadAfter(null);
      setUploadDesc('');
      fetchData();
    } catch (err: any) {
      alert('Error uploading images: ' + err.message);
    }
    
    setUploading(false);
  };

  const handleDelete = async (id: string, beforeUrl: string, afterUrl: string) => {
    if (!window.confirm('Are you sure you want to delete this transformation?')) return;
    
    const beforeName = beforeUrl.split('/').pop();
    const afterName = afterUrl.split('/').pop();
    
    if (beforeName && afterName) {
      await supabase.storage.from('transformations').remove([beforeName, afterName]);
    }
    await supabase.from('transformations').delete().eq('id', id);
    fetchData();
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    const { error } = await supabase.from('reviews').insert([{ 
      client_name: reviewName, 
      review_text: reviewText, 
      rating: reviewRating 
    }]);

    if (error) {
      alert('Error adding review: ' + error.message);
    } else {
      setReviewName('');
      setReviewText('');
      setReviewRating(5);
      fetchData(); // refresh list
    }
    setSubmittingReview(false);
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    await supabase.from('reviews').delete().eq('id', id);
    fetchData();
  };

  const handleDeleteRegistration = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this registration?')) return;
    const { error } = await supabase.from('registrations').delete().eq('id', id);
    if (error) {
      alert("Error deleting registration: " + error.message);
    } else {
      fetchData();
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-[#0a0a0a] p-8 border-2 border-neutral-800 w-full max-w-sm rounded-none">
          <h2 className="text-3xl font-black mb-6 text-center text-[#FF9933] font-['Oswald'] tracking-wide">ADMIN ACCESS</h2>
          <input 
            type="email" 
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="EMAIL ADDRESS"
            className="w-full bg-[#111] border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-[#FF9933] rounded-none mb-4 font-['Inter']"
          />
          <input 
            type="password" 
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="PASSWORD"
            className="w-full bg-[#111] border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-[#FF9933] rounded-none mb-6 font-['Inter']"
          />
          <button type="submit" disabled={loading} className="w-full bg-[#FF9933] text-black font-bold py-3 rounded-none hover:bg-[#e68a2e] transition-colors uppercase tracking-widest disabled:opacity-50">
            {loading ? 'AUTHENTICATING...' : 'LOGIN'}
          </button>
          <button type="button" onClick={() => navigate('/')} className="w-full mt-4 text-neutral-500 text-sm hover:text-white transition-colors uppercase tracking-widest">
            Return to Landing
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 md:mb-12 border-b-2 border-neutral-800 pb-6">
          <h1 className="text-2xl md:text-3xl font-black tracking-widest text-[#FF9933] uppercase">Admin<span className="text-white">Panel</span></h1>
          <div className="flex items-center gap-4 text-sm font-bold text-neutral-400">
            <span className="hidden md:inline">{session.user.email}</span>
            <button onClick={handleLogout} className="border-2 border-neutral-700 px-3 py-2 md:px-4 text-xs md:text-sm hover:bg-neutral-800 transition-colors uppercase tracking-widest">Log Out</button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('registrations')}
            className={`px-4 py-3 md:px-6 md:py-2 text-sm font-bold uppercase tracking-wider border-2 transition-colors ${activeTab === 'registrations' ? 'border-[#FF9933] bg-[#FF9933] text-black' : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'}`}
          >
            Registrations
          </button>
          <button 
            onClick={() => setActiveTab('transformations')}
            className={`px-4 py-3 md:px-6 md:py-2 text-sm font-bold uppercase tracking-wider border-2 transition-colors ${activeTab === 'transformations' ? 'border-[#FF9933] bg-[#FF9933] text-black' : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'}`}
          >
            Transformations
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-3 md:px-6 md:py-2 text-sm font-bold uppercase tracking-wider border-2 transition-colors ${activeTab === 'reviews' ? 'border-[#FF9933] bg-[#FF9933] text-black' : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'}`}
          >
            Reviews
          </button>
        </div>

        {loading ? (
          <div className="text-center font-bold text-neutral-500 py-12 uppercase tracking-widest">Loading data...</div>
        ) : (
          <>
            {activeTab === 'registrations' && (
              <div className="bg-[#0a0a0a] border-2 border-neutral-800 overflow-hidden rounded-none shadow-xl">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-[#111] text-neutral-400 text-xs uppercase tracking-widest border-b-2 border-neutral-800">
                        <th className="px-6 py-5 font-bold">Name</th>
                        <th className="px-6 py-5 font-bold">Contact</th>
                        <th className="px-6 py-5 font-bold">Details</th>
                        <th className="px-6 py-5 font-bold">Status & Goal</th>
                        <th className="px-6 py-5 font-bold">Struggle</th>
                        <th className="px-6 py-5 font-bold">Registered</th>
                        <th className="px-6 py-5 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-neutral-800 font-['Inter']">
                      {registrations.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-neutral-500 font-bold uppercase tracking-widest">No registrations yet.</td>
                        </tr>
                      ) : (
                        registrations.map(reg => (
                          <tr key={reg.id} className="hover:bg-[#111] transition-colors">
                            <td className="px-6 py-5">
                              <div className="font-bold text-white uppercase text-sm tracking-wide">{reg.name}</div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="text-sm">
                                <a href={`mailto:${reg.email}`} className="text-[#FF9933] hover:text-[#e68a2e] transition-colors underline decoration-neutral-800 hover:decoration-[#FF9933] underline-offset-4">
                                  {reg.email}
                                </a>
                              </div>
                              <div className="text-xs mt-2 font-medium">
                                {reg.phone ? (
                                  <a href={`tel:${reg.phone.replace(/[^0-9+]/g, '')}`} className="text-neutral-400 hover:text-white transition-colors">
                                    {reg.phone}
                                  </a>
                                ) : (
                                  <span className="text-neutral-600">N/A</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="text-sm text-neutral-300">Age: <span className="font-bold text-white">{reg.age_group || 'N/A'}</span></div>
                              <div className="text-xs text-neutral-500 mt-1 font-medium">Injuries: <span className={reg.injuries && reg.injuries.startsWith('Yes') ? 'text-red-400' : 'text-neutral-400'}>{reg.injuries || 'N/A'}</span></div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="mb-2">
                                <span className="px-3 py-1.5 bg-neutral-900 text-neutral-300 text-xs font-bold border border-neutral-700 uppercase tracking-wider inline-block">
                                  {reg.fitness_status}
                                </span>
                              </div>
                              <div>
                                <span className="px-3 py-1.5 bg-[#FF9933]/10 text-[#FF9933] text-xs font-bold border border-[#FF9933]/30 uppercase tracking-wider inline-block">
                                  {reg.goal}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="text-sm text-neutral-300 font-medium">{reg.biggest_struggle || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-5 text-sm text-neutral-400 font-medium">
                              {new Date(reg.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-5 text-right">
                              <button 
                                onClick={() => handleDeleteRegistration(reg.id)}
                                className="text-red-500 hover:text-red-400 font-bold text-xs tracking-widest uppercase transition-colors"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'transformations' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <div className="bg-[#0a0a0a] p-6 border-2 border-neutral-800">
                    <h2 className="text-2xl font-bold mb-6 text-[#FF9933] tracking-wider">UPLOAD NEW</h2>
                    <form onSubmit={handleUpload} className="space-y-4 font-['Inter']">
                      <div>
                        <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-widest">Before Image</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          required
                          onChange={(e) => setUploadBefore(e.target.files?.[0] || null)}
                          className="w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-bold file:bg-[#FF9933] file:text-black hover:file:bg-[#e68a2e] cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-widest">After Image</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          required
                          onChange={(e) => setUploadAfter(e.target.files?.[0] || null)}
                          className="w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-bold file:bg-[#FF9933] file:text-black hover:file:bg-[#e68a2e] cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-widest">Description / Name</label>
                        <input 
                          type="text" 
                          value={uploadDesc}
                          onChange={(e) => setUploadDesc(e.target.value)}
                          placeholder="e.g., John lost 20lbs in 3 months"
                          className="w-full bg-[#111] border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-[#FF9933] rounded-none"
                        />
                      </div>
                      <button 
                        type="submit" 
                        disabled={uploading}
                        className="w-full bg-[#FF9933] text-black font-bold py-3 rounded-none hover:bg-[#e68a2e] transition-colors disabled:opacity-50 uppercase tracking-widest mt-4"
                      >
                        {uploading ? 'UPLOADING...' : 'SAVE TRANSFORMATION'}
                      </button>
                    </form>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 gap-6">
                    {transformations.length === 0 ? (
                      <div className="p-8 text-center border-2 border-dashed border-neutral-800 text-neutral-500 font-bold uppercase tracking-widest">
                        No transformations uploaded yet.
                      </div>
                    ) : (
                      transformations.map(trans => (
                        <div key={trans.id} className="group relative bg-[#0a0a0a] border-2 border-neutral-800 flex flex-col md:flex-row overflow-hidden">
                          <div className="flex w-full md:w-2/3">
                            <div className="w-1/2 border-r-2 border-[#FF9933]">
                               <img src={trans.before_image_url} alt="Before" className="w-full h-40 md:h-48 object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500" />
                            </div>
                            <div className="w-1/2">
                               <img src={trans.after_image_url} alt="After" className="w-full h-40 md:h-48 object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500" />
                            </div>
                          </div>
                          <div className="w-full md:w-1/3 p-4 flex items-center justify-center bg-black/50 border-t-2 md:border-t-0 md:border-l-2 border-neutral-800">
                            <p className="font-['Inter'] text-sm text-neutral-300 font-bold text-center">{trans.description || 'No description'}</p>
                          </div>
                          <button 
                            onClick={() => handleDelete(trans.id, trans.before_image_url, trans.after_image_url)}
                            className="absolute top-2 right-2 md:top-4 md:right-4 bg-red-600 text-white px-2 py-1 md:p-2 text-[10px] md:text-xs font-bold uppercase tracking-widest md:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                          >
                            DELETE
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <div className="bg-[#0a0a0a] p-6 border-2 border-neutral-800">
                    <h2 className="text-2xl font-bold mb-6 text-[#FF9933] tracking-wider">ADD REVIEW</h2>
                    <form onSubmit={handleAddReview} className="space-y-4 font-['Inter']">
                      <div>
                        <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-widest">Client Name</label>
                        <input 
                          type="text" 
                          required
                          value={reviewName}
                          onChange={(e) => setReviewName(e.target.value)}
                          placeholder="e.g., Sarah Jenkins"
                          className="w-full bg-[#111] border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-[#FF9933] rounded-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-widest">Review Text</label>
                        <textarea 
                          required
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder="This program completely changed my life..."
                          rows={4}
                          className="w-full bg-[#111] border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-[#FF9933] rounded-none resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-widest">Rating (1-5)</label>
                        <select 
                          value={reviewRating}
                          onChange={(e) => setReviewRating(Number(e.target.value))}
                          className="w-full bg-[#111] border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-[#FF9933] rounded-none appearance-none"
                        >
                          {[5, 4, 3, 2, 1].map(num => (
                            <option key={num} value={num}>{num} Stars</option>
                          ))}
                        </select>
                      </div>
                      <button 
                        type="submit" 
                        disabled={submittingReview}
                        className="w-full bg-[#FF9933] text-black font-bold py-3 rounded-none hover:bg-[#e68a2e] transition-colors disabled:opacity-50 uppercase tracking-widest mt-4"
                      >
                        {submittingReview ? 'SAVING...' : 'SAVE REVIEW'}
                      </button>
                    </form>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <div className="space-y-4">
                    {reviews.length === 0 ? (
                      <div className="p-8 text-center border-2 border-dashed border-neutral-800 text-neutral-500 font-bold uppercase tracking-widest">
                        No reviews added yet.
                      </div>
                    ) : (
                      reviews.map(review => (
                        <div key={review.id} className="relative bg-[#0a0a0a] border-2 border-neutral-800 p-6 flex flex-col justify-between group">
                          <div>
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="font-bold text-white text-lg tracking-wide uppercase">{review.client_name}</h3>
                              <div className="flex text-[#FF9933] text-sm">
                                {Array(review.rating).fill('★').join('')}
                                {Array(5 - review.rating).fill('☆').join('')}
                              </div>
                            </div>
                            <p className="font-['Inter'] text-neutral-400 italic mb-4 text-sm leading-relaxed">
                              "{review.review_text}"
                            </p>
                          </div>
                          <button 
                            onClick={() => handleDeleteReview(review.id)}
                            className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                          >
                            DELETE
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

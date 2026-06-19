import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#050505] min-h-screen selection:bg-[#FF9933] selection:text-black flex flex-col items-center justify-center p-6 text-center">
      <div className="relative z-20 max-w-2xl mx-auto">
        <p className="text-[#FF9933] font-bold mb-4 tracking-[0.3em] uppercase text-sm">Error 404</p>
        <h1 className="text-6xl md:text-8xl font-black mb-6 leading-none tracking-tight text-white">
          PAGE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9933] to-[#e68a2e] italic pr-2">NOT</span>{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9933] to-[#e68a2e] italic pr-2">FOUND</span>
        </h1>
        <p className="text-xl text-neutral-400 font-['Inter'] mb-12 font-light">
          The path you are looking for does not exist in this protocol.
        </p>
        <button 
          onClick={() => navigate('/')} 
          className="bg-[#FF9933] text-black text-lg font-black uppercase tracking-widest py-4 px-10 rounded-none hover:bg-white hover:text-black transition-all duration-300 transform hover:-translate-y-1"
        >
          RETURN TO BASE
        </button>
      </div>
    </div>
  );
}

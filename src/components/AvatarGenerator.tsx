import React, { useState, useRef } from 'react';
import { generateAvatar } from '../services/geminiService';
import { Wand2, Download, Loader2, Upload, X, Image as ImageIcon, FileCheck, FilePlus2 } from 'lucide-react';

interface AvatarGeneratorProps {
  onAttachToResume?: (avatarUrl: string) => void;
}

const AvatarGenerator: React.FC<AvatarGeneratorProps> = ({ onAttachToResume }) => {
  const [stylePrompt, setStylePrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [attached, setAttached] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;
    setLoading(true);
    setAttached(false);
    try {
      const image = await generateAvatar(selectedImage, stylePrompt);
      setGeneratedImage(image);
    } catch (error) {
      alert("Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAttach = () => {
    if (generatedImage && onAttachToResume) {
      onAttachToResume(generatedImage);
      setAttached(true);
      setTimeout(() => setAttached(false), 3000);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-brand-deep mb-2">AI Professional Avatar</h1>
        <p className="text-slate-500">Generate a professional LinkedIn-style headshot.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Left Column: Input */}
        <div className="bg-white p-6 rounded-2xl border border-brand-mint shadow-sm shadow-brand-primary/5 flex flex-col">
          <div className="flex-1 flex flex-col">
            <label className="block text-sm font-bold text-slate-700 mb-4">Upload Your Photo</label>
            
            <div className="flex-1 bg-emerald-50 border-2 border-dashed border-emerald-500 rounded-xl flex flex-col items-center justify-center p-6 relative mb-6 transition-colors hover:bg-emerald-100/50 min-h-[240px]">
              {!selectedImage ? (
                <>
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <ImageIcon className="text-emerald-600" size={32} />
                  </div>
                  <p className="text-emerald-800/80 text-sm mb-4 text-center max-w-xs">
                    Upload a clear selfie or portrait to professionalize.
                  </p>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white border border-emerald-500 text-emerald-700 px-6 py-2.5 rounded-xl font-medium hover:bg-emerald-50 transition shadow-sm flex items-center gap-2"
                  >
                    <Upload size={18} />
                    Upload Reference
                  </button>
                </>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center bg-slate-100 rounded-lg overflow-hidden">
                  <img src={selectedImage} alt="Reference" className="max-h-64 object-contain" />
                  <button 
                    onClick={clearImage}
                    className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Style Preferences (Optional)</label>
              <input
                type="text"
                className="w-full p-3 border border-brand-mint rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none text-slate-800 bg-white text-sm placeholder-slate-400"
                placeholder="e.g. Navy blue suit, natural lighting"
                value={stylePrompt}
                onChange={(e) => setStylePrompt(e.target.value)}
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !selectedImage}
              className="w-full flex items-center justify-center gap-2 bg-[rgb(0,201,183)] text-white py-3.5 rounded-xl hover:bg-brand-deep transition disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-[rgb(0,201,183)]/20"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
              {loading ? 'Processing Image...' : 'Generate Avatar'}
            </button>
            
            <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
               Don't worry. We do not store your images.
            </p>
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="bg-white p-6 rounded-2xl border border-brand-mint shadow-sm shadow-brand-primary/5 flex flex-col items-center justify-center min-h-[500px]">
          {generatedImage ? (
            <div className="w-full flex flex-col items-center">
              {/* Generated Image Container */}
              <div className="w-full max-w-sm aspect-square bg-brand-rose rounded-xl overflow-hidden border border-brand-mint ring-1 ring-brand-secondary shadow-sm mb-6">
                 <img 
                   src={generatedImage} 
                   alt="Generated Avatar" 
                   className="w-full h-full object-cover"
                 />
              </div>

              {/* Separator */}
              <div className="w-full border-t border-brand-mint mb-6"></div>

              {/* Actions */}
              <div className="flex gap-4 w-full max-w-sm">
                <a 
                  href={generatedImage} 
                  download="professional-avatar.png"
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-brand-mint text-brand-deep rounded-xl hover:bg-brand-rose transition font-medium text-sm"
                >
                  <Download size={18} />
                  Download Image
                </a>
                
                <button 
                  onClick={handleAttach}
                  disabled={attached}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition font-medium text-sm ${
                    attached 
                      ? 'bg-brand-mint text-brand-deep border border-brand-secondary' 
                      : 'bg-brand-primary text-white border border-brand-primary hover:bg-brand-deep'
                  }`}
                >
                  {attached ? <FileCheck size={18} /> : <FilePlus2 size={18} />}
                  {attached ? 'Attached!' : 'Attach to Resume'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center w-full h-full flex flex-col items-center justify-center">
              <div className="w-64 h-64 bg-emerald-50 rounded-full mx-auto mb-6 flex items-center justify-center border-2 border-dashed border-emerald-500">
                <UserCirclePlaceholder />
              </div>
              <p className="font-bold text-emerald-800 text-lg">Your professional headshot will appear here</p>
              <p className="text-sm mt-2 max-w-xs mx-auto text-emerald-700/70">Upload a photo and click generate to see the magic happen.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const UserCirclePlaceholder = () => (
  <svg className="w-20 h-20 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="10" r="3"/>
    <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/>
  </svg>
);

export default AvatarGenerator;
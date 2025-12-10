"use client";

import { useParams } from "next/navigation";
import Image from "next/image";

export default function UploadPage() {
  const params = useParams();
  const sessionId = params.session_id as string;

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans selection:bg-black selection:text-white flex flex-col relative overflow-x-hidden">
      {/* Subtle Background Mesh/Gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-slate-100 to-transparent opacity-70 blur-3xl rounded-full" />
      </div>

      {/* Modern Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative transition-transform group-hover:scale-105 duration-300">
              <Image
                src="/iprintlogo.png"
                alt="iPrint Logo"
                width={100}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <div className="h-6 w-px bg-slate-300 mx-2 hidden sm:block" />
            <span className="text-sm font-medium text-slate-500 hidden sm:block">
              Secure Upload Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Step Indicator */}
            <div className="hidden md:flex items-center gap-2 text-sm font-medium">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs">1</span>
              <span>Upload file</span>
              <div className="w-8 h-px bg-slate-200" />
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-xs">2</span>
              <span className="text-slate-400">Payment</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4 sm:p-8 z-10">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900">
            Welcome to our design upload portal
          </h1>
        </div>
      </main>

      {/* Modern Dark Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 sm:py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
            <div className="col-span-1 md:col-span-1">
              <h3 className="text-white text-lg font-bold mb-4">iPrint</h3>
              <p className="text-sm leading-relaxed">
                Premium printing services for professionals. High quality, fast turnaround, and secure handling of your creative assets.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Digital Printing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Large Format</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Corporate Gifts</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">File Guidelines</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Track Order</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">© 2025 iPrint Design Upload. All rights reserved.</p>
            <div className="flex gap-6">
              <div className="w-5 h-5 bg-slate-800 rounded hover:bg-slate-700 cursor-pointer transition-colors"></div>
              <div className="w-5 h-5 bg-slate-800 rounded hover:bg-slate-700 cursor-pointer transition-colors"></div>
              <div className="w-5 h-5 bg-slate-800 rounded hover:bg-slate-700 cursor-pointer transition-colors"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
'use client';

import { ArrowRight, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const products = [
  {
    name: 'ValorAlgo',
    description: 'Advanced algorithmic trading platform',
    link: 'https://valoralgo.com',
    gradient: 'from-purple-500/20 to-blue-500/20'
  },
  {
    name: 'Valortraders',
    description: 'Professional trading terminal',
    link: 'https://valortraders.com',
    gradient: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    name: 'Valortraders Store',
    description: 'Traders Gear & Merch',
    link: 'https://valortraders.store',
    gradient: 'from-emerald-500/20 to-green-500/20'
  }
];

export function AdCard() {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    // Load hidden state from localStorage
    const hidden = localStorage.getItem('hideAdCard') === 'true';
    setIsHidden(hidden);
  }, []);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  const handleOpenChange = (open: boolean) => setIsOpen(open);

  const handleHide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHidden(true);
    localStorage.setItem('hideAdCard', 'true');
  };

  const handleHideKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsHidden(true);
      localStorage.setItem('hideAdCard', 'true');
    }
  };

  const handleShow = () => {
    setIsHidden(false);
    localStorage.setItem('hideAdCard', 'false');
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open drawer if clicking the hide button
    if ((e.target as HTMLElement).closest('[data-hide-button]')) {
      return;
    }
    setIsOpen(true);
  };

  if (isHidden) {
    return (
      <button
        onClick={handleShow}
        className="w-full text-center py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Show Valortraders Products
      </button>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>
        <div
          className="w-full relative group cursor-pointer"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          role="button"
          tabIndex={0}
          onClick={handleCardClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(true);
            }
          }}
        >
          <div className="relative overflow-hidden rounded-xl border border-blue-200/20 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 p-6 shadow-lg transition-all duration-500 hover:scale-[1.02] hover:shadow-xl dark:from-blue-950/30 dark:to-indigo-950/30 backdrop-blur-md">
            {/* Hide button */}
            <div 
              data-hide-button
              onClick={handleHide}
              className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 transition-all duration-200 cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label="Hide ad"
              onKeyDown={handleHideKeyDown}
            >
              <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>

            {/* Animated glow effects */}
            <div className="absolute -right-8 -top-8 h-32 w-32 rotate-12 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 blur-2xl animate-float backdrop-blur-sm" />
            <div className="absolute -bottom-8 -left-8 h-32 w-32 -rotate-12 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 blur-2xl animate-float backdrop-blur-sm delay-1000" style={{ animationDelay: '-4s' }} />
            
            {/* Interactive hover glow */}
            <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/0 via-indigo-500/10 to-blue-500/0 transition-opacity duration-700 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

            {/* Content */}
            <div className="relative space-y-4">
              {/* Header with animated sparkle */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Sparkles className={`h-5 w-5 text-blue-500 transition-transform duration-300 ${isHovered ? 'scale-125' : 'scale-100'}`} />
                  <div className={`absolute inset-0 animate-ping ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <Sparkles className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
                <h3 className="font-semibold text-blue-950 transition-colors duration-300 dark:text-blue-100">
                  Discover Valortraders
                </h3>
              </div>

              {/* Description with fade-in effect */}
              <p className="text-sm text-gray-600 transition-colors duration-300 dark:text-gray-300">
                Elevate your trading with advanced algorithms and real-time market insights. Join the Valortraders ecosystem today.
              </p>

              {/* Features with animated bullets */}
              <ul className="space-y-2 text-sm">
                {[
                  'Advanced Trading Algorithms',
                  'Real-time Market Analysis',
                  'Professional Trading Tools'
                ].map((feature, index) => (
                  <li 
                    key={feature}
                    className="flex items-center gap-2 text-gray-600 transition-all duration-300 dark:text-gray-300"
                    style={{ 
                      transform: isHovered ? 'translateX(8px)' : 'translateX(0)',
                      transitionDelay: `${index * 50}ms`
                    }}
                  >
                    <div className={`h-1 w-1 rounded-full bg-blue-500 transition-all duration-300 ${isHovered ? 'scale-150' : 'scale-100'}`} />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA Button with enhanced hover effect */}
              <div className={`group inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition-all duration-300 dark:text-blue-400 ${isHovered ? 'translate-x-1' : ''}`}>
                View Products
                <ArrowRight className={`h-4 w-4 transition-all duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
              </div>
            </div>
          </div>
        </div>
      </DrawerTrigger>

      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="text-center">Valortraders Ecosystem</DrawerTitle>
            <DrawerDescription className="text-center">
              Discover our suite of professional trading tools
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4 space-y-4">
            {products.map((product) => (
              <Link
                key={product.name}
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  block p-4 rounded-lg
                  bg-gradient-to-r ${product.gradient}
                  hover:scale-[1.02] transition-all duration-300
                  backdrop-blur-xl backdrop-saturate-150
                  shadow-lg
                  border border-white/10
                  relative overflow-hidden
                  group
                `}
                onClick={() => setIsOpen(false)}
              >
                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Content */}
                <div className="relative">
                  <h3 className="font-semibold text-foreground/90 mb-1 text-lg">{product.name}</h3>
                  <p className="text-muted-foreground/80 text-sm">{product.description}</p>
                </div>
              </Link>
            ))}
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <button 
                type="button"
                className="w-full px-4 py-2 rounded-lg bg-gray-100/80 hover:bg-gray-200/80 dark:bg-gray-800/80 dark:hover:bg-gray-700/80 backdrop-blur-sm transition-colors duration-200"
              >
                Close
              </button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
} 
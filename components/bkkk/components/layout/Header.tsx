'use client';
import { Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { Logo } from '../ui/Logo';

interface HeaderProps {
  onMenuClick: () => void;
  isMenuOpen?: boolean;
  onLogoClick?: () => void;
  isTransparent?: boolean;
  isScrolled?: boolean;
}

export function Header({ onMenuClick, onLogoClick, isMenuOpen = false, isTransparent = false, isScrolled = false }: HeaderProps) {
  return (
    <header 
      className={`fixed top-0 left-0 w-full z-40 px-[5%] flex justify-between items-start md:items-center transition-all duration-300 bg-transparent ${isScrolled ? 'py-3' : 'py-6'}`}
    >
      <div 
        onClick={onLogoClick}
        className={`mt-0 mr-0 mb-0 ml-0 p-0 overflow-visible ${onLogoClick ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <Logo 
          className={`h-[40px] md:h-[60px] w-auto mx-[-8px] my-[0px] ${isTransparent ? 'text-white' : 'text-black'} ${isScrolled ? 'hidden' : 'block'}`}
          white={isTransparent}
        />
      </div>
      <div className="flex items-center gap-4 mr-[-2%]">
        {/* Removed KYAF link */}
        <Button 
          variant="ghost" 
          onClick={onMenuClick}
          aria-label={isMenuOpen ? 'Hide menu' : 'Expand menu'}
          aria-expanded={isMenuOpen}
          className={`w-[9vw] h-[9vw] min-w-[9vw] min-h-[9vw] md:w-[6vw] md:h-[6vw] md:min-w-[6vw] md:min-h-[6vw] !p-0 transition-colors hover:bg-gray-500/40 ${
            isTransparent 
              ? 'text-white' 
              : 'text-black'
          }`}
        >
          <Menu className="!w-[100%] !h-[82%] md:!w-[45%] md:!h-[45%] transition-all rounded p-1" strokeWidth={1.5} />
        </Button>
      </div>
    </header>
  );
}

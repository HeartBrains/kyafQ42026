'use client';
import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [mobileFooterHeight, setMobileFooterHeight] = useState(64);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  useEffect(() => {
    const mobileFooter = document.querySelector<HTMLElement>('[data-mobile-sticky-footer]');
    if (!mobileFooter) return;

    const updateFooterHeight = () => {
      setMobileFooterHeight(Math.ceil(mobileFooter.getBoundingClientRect().height));
    };

    updateFooterHeight();
    const resizeObserver = new ResizeObserver(updateFooterHeight);
    resizeObserver.observe(mobileFooter);
    return () => resizeObserver.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      data-back-to-top
      className="fixed right-6 z-50 p-3 bg-black text-white rounded-full shadow-lg transition-opacity duration-300 md:hidden hover:bg-gray-800"
      style={{ bottom: `${mobileFooterHeight + 20}px` }}
      aria-label="Back to Top"
    >
      <ArrowUp className="w-6 h-6" />
    </button>
  );
}

'use client';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export interface AccordionRecord {
  id: string | number;
  slug: string;
  title: string;
}

export interface AccordionSection {
  id: string;
  label: string;
  records: AccordionRecord[];
}

function AccordionRecordsList({ records, isPast, onRecordClick }: {
  records: AccordionRecord[];
  isPast: boolean;
  onRecordClick: (slug: string) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState({ hasOverflow: false, canScrollUp: false, canScrollDown: false });

  useEffect(() => {
    const list = listRef.current;
    if (!list || !isPast) return;

    const updateOverflow = () => {
      const hasOverflow = list.scrollHeight > list.clientHeight + 1;
      setOverflow({
        hasOverflow,
        canScrollUp: list.scrollTop > 1,
        canScrollDown: list.scrollTop + list.clientHeight < list.scrollHeight - 1,
      });
    };

    updateOverflow();
    const resizeObserver = new ResizeObserver(updateOverflow);
    resizeObserver.observe(list);
    list.addEventListener('scroll', updateOverflow, { passive: true });
    window.addEventListener('resize', updateOverflow);

    return () => {
      resizeObserver.disconnect();
      list.removeEventListener('scroll', updateOverflow);
      window.removeEventListener('resize', updateOverflow);
    };
  }, [isPast, records.length]);

  const scroll = (direction: 'up' | 'down') => {
    const list = listRef.current;
    if (!list) return;
    list.scrollBy({ top: direction === 'up' ? -list.clientHeight * 0.7 : list.clientHeight * 0.7, behavior: 'smooth' });
  };

  return (
    <>
      {isPast && overflow.hasOverflow && (
        <div className="flex justify-end gap-1 pb-1">
          <button
            type="button"
            onClick={() => scroll('up')}
            disabled={!overflow.canScrollUp}
            aria-label="Scroll past records up"
            className="rounded p-1 text-gray-500 transition-colors hover:text-black disabled:cursor-default disabled:opacity-30"
          >
            <ChevronUp className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scroll('down')}
            disabled={!overflow.canScrollDown}
            aria-label="Scroll past records down"
            className="rounded p-1 text-gray-500 transition-colors hover:text-black disabled:cursor-default disabled:opacity-30"
          >
            <ChevronDown className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      )}
      <div ref={listRef} className={`flex flex-col gap-1 pb-2 ${isPast ? 'max-h-[55vh] overflow-y-auto overscroll-contain' : ''}`}>
        {records.map((record) => (
          <button
            key={record.slug}
            onClick={() => onRecordClick(record.slug)}
            className="pl-4 md:pl-6 text-left text-xl md:text-2xl font-normal text-gray-400 hover:text-black transition-colors duration-200 leading-snug py-0.5"
          >
            {record.title}
          </button>
        ))}
      </div>
    </>
  );
}

interface ListingAccordionNavProps {
  sections: AccordionSection[];
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  onRecordClick: (slug: string) => void;
}

export function ListingAccordionNav({
  sections,
  activeSection,
  onSectionClick,
  onRecordClick,
}: ListingAccordionNavProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const populatedSections = sections.filter((section) => section.records.length > 0);

  const handleSectionClick = (sectionId: string) => {
    const isOpening = expandedSection !== sectionId;
    setExpandedSection(prev => (prev === sectionId ? null : sectionId));
    onSectionClick(sectionId);
    // Also scroll to first record when opening
    if (isOpening) {
      const section = sections.find(s => s.id === sectionId);
      if (section && section.records.length > 0) {
        setTimeout(() => {
          const el = document.getElementById(`record-${section.records[0].slug}`);
          if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
        }, 50);
      }
    }
  };

  return (
    <nav className="md:sticky md:top-32 flex flex-col items-start gap-1">
      {populatedSections.map((section) => {
        const isExpanded = expandedSection === section.id;
        const isActive = activeSection === section.id;

        return (
          <div key={section.id} className="w-full">
            <button
              onClick={() => handleSectionClick(section.id)}
              className={`flex items-center gap-1 text-left text-xl md:text-2xl font-normal transition-all duration-300 py-1 ${
                isActive ? 'text-black' : 'text-gray-400 hover:text-black'
              }`}
            >
              <span>{section.label}</span>
              <ChevronDown
                className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <AccordionRecordsList
                    records={section.records}
                    isPast={section.id.startsWith('past-')}
                    onRecordClick={onRecordClick}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );
}

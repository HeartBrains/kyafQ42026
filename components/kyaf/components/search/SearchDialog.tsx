'use client';
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { getFullSearchData, SearchDocument } from "../../utils/searchData";
import { useLanguage } from "../../utils/languageContext";

interface SearchDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (page: string, slug?: string) => void;
    initialQuery?: string;
}

export function SearchDialog({ isOpen, onClose, onNavigate, initialQuery = "" }: SearchDialogProps) {
    const { language, t } = useLanguage();
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<SearchDocument[]>([]);
    const [allData, setAllData] = useState<SearchDocument[]>([]);

    // Refresh the search data each time the dialog opens so recent CMS edits are picked up.
    useEffect(() => {
        if (!isOpen) return;

        let isCurrent = true;
        getFullSearchData().then(fetchedData => {
            if (isCurrent) setAllData(fetchedData);
        });
        return () => {
            isCurrent = false;
        };
    }, [isOpen]);

    // Perform search when query or language changes
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const searchTerm = query.toLowerCase().trim();

        // Find all matches across both languages
        const matches = allData.filter(doc => {
            const titleMatch = doc.title?.toLowerCase().includes(searchTerm);
            const contentMatch = doc.content?.toLowerCase().includes(searchTerm);
            const keywordMatch = doc.keywords?.toLowerCase().includes(searchTerm);
            
            return titleMatch || contentMatch || keywordMatch;
        });

        // Deduplicate and prefer current language version
        const uniqueKeys = new Set<string>();
        matches.forEach(doc => {
            const key = doc.slug ? `${doc.page}-${doc.slug}` : doc.page;
            uniqueKeys.add(key);
        });

        const refinedResults: SearchDocument[] = [];

        uniqueKeys.forEach(key => {
            // Find all versions of this content
            const versions = allData.filter(d => {
                const dKey = d.slug ? `${d.page}-${d.slug}` : d.page;
                return dKey === key;
            });

            // Prefer the current language version
            const preferred = versions.find(v => v.lang === language);
            
            if (preferred) {
                refinedResults.push(preferred);
            } else if (versions.length > 0) {
                refinedResults.push(versions[0]);
            }
        });

        setResults(refinedResults);
    }, [query, allData, language]);

    // Reset on dialog open/close
    useEffect(() => {
        if (isOpen) {
            if (initialQuery) {
                setQuery(initialQuery);
            }
        } else {
            setQuery("");
            setResults([]);
        }
    }, [isOpen, initialQuery]);

    const handleResultClick = (result: SearchDocument) => {
        onNavigate(result.page, result.slug);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl bg-white text-black z-[60] gap-4">
                <DialogHeader>
                    <DialogTitle className="font-sans text-xl">{t('common.search')}</DialogTitle>
                    <DialogDescription className="sr-only">
                        {language === 'th' ? 'ค้นหาเว็บไซต์' : 'Search the website'}
                    </DialogDescription>
                </DialogHeader>
                
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('search.placeholder')}
                        className="pl-9 bg-gray-50 border-gray-200 focus:border-black focus:ring-black"
                        autoFocus
                    />
                </div>

                <div className="min-h-[100px] max-h-[400px] overflow-y-auto">
                    {results.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {results.map((result) => (
                                <button
                                    key={result.id} 
                                    onClick={() => handleResultClick(result)}
                                    className="w-full text-left p-3 hover:bg-gray-100 rounded-md transition-colors block group"
                                >
                                    <h3 className="font-medium text-black group-hover:text-red-600 transition-colors">
                                        {result.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                                        {result.content}
                                    </p>
                                </button>
                            ))}
                        </div>
                    ) : query ? (
                         <div className="text-center py-8 text-gray-400">
                            {t('common.noResults')} "{query}"
                         </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            {t('search.placeholder')}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

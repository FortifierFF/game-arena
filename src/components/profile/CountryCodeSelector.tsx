import React, { useState, useRef, useEffect } from 'react';
import Icon, { ChevronDown, Globe } from '@/components/ui/Icon';
import 'flag-icons/css/flag-icons.min.css';
import { countryCodes, type CountryCode } from '@/lib/countries';

interface CountryCodeSelectorProps {
  selectedCode: string;
  onCodeChange: (code: string) => void;
  className?: string;
}

export default function CountryCodeSelector({ selectedCode, onCodeChange, className = '' }: CountryCodeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter countries based on search term
  const filteredCountries = countryCodes.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.dialCode.includes(searchTerm) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get selected country display info
  const selectedCountry = countryCodes.find(country => country.dialCode === selectedCode);

  const handleCountrySelect = (country: CountryCode) => {
    onCodeChange(country.dialCode);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Country Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-l-xl text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-colors duration-200 min-w-[120px] border-r-0 h-[52px]"
      >
        {selectedCountry && (
          <>
            <span className={`fi fi-${selectedCountry.flag} text-lg`}></span>
            <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
          </>
        )}
        <Icon icon={ChevronDown} size="sm" className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 bg-gray-900 border border-white/20 rounded-xl shadow-2xl max-h-80 overflow-hidden w-96">
          {/* Search Input */}
          <div className="p-3 border-b border-white/10">
            <div className="relative">
              <Icon icon={Globe} size="sm" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20 focus:ring-2 focus:outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Countries List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors duration-200 ${
                    country.dialCode === selectedCode ? 'bg-cyan-500/20 border-r-2 border-cyan-400' : ''
                  }`}
                >
                  <span className={`fi fi-${country.flag} text-lg flex-shrink-0`}></span>
                  <div className="flex-1 text-left">
                    <div className="text-white font-medium">{country.name}</div>
                    <div className="text-gray-400 text-sm">{country.dialCode}</div>
                  </div>
                  {country.dialCode === selectedCode && (
                    <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0"></div>
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-400">
                <Icon icon={Globe} size="lg" className="mx-auto mb-2 opacity-50" />
                <p>No countries found</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="px-4 py-3 bg-black/20 border-t border-white/10 text-center text-gray-400 text-sm">
            {filteredCountries.length} of {countryCodes.length} countries
          </div>
        </div>
      )}
    </div>
  );
} 
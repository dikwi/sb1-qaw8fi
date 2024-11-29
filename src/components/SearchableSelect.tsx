import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Search, X, Loader } from 'lucide-react';
import { useInfiniteQuery } from 'react-query';
import { diagnosisService } from '../services/diagnosisService';
import debounce from 'lodash/debounce';

interface Option {
  value: string;
  label: string;
  group?: string;
}

interface Diagnosis {
  id: string;
  name: string;
  type?: string;
}

interface DiagnosisResponse {
  data: Diagnosis[];
  nextPage?: number;
}

interface SearchableSelectProps {
  options?: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  isDiagnosis?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options = [],
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  id,
  name,
  isDiagnosis = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedOptionState, setSelectedOptionState] = useState<Option | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useMemo(
    () =>
      debounce((term: string) => {
        setDebouncedSearchTerm(term);
      }, 300),
    []
  );

  useEffect(() => {
    if (isDiagnosis) {
      debouncedSearch(inputValue);
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [inputValue, isDiagnosis, debouncedSearch]);

  const {
    data,
    isLoading,
    isFetching,
    error,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery<DiagnosisResponse, Error>(
    ['diagnoses', debouncedSearchTerm],
    ({ pageParam = 1 }) => diagnosisService.search(debouncedSearchTerm, pageParam),
    {
      enabled: isDiagnosis && isOpen,
      getNextPageParam: (lastPage) => lastPage.nextPage || false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const filteredOptions = useMemo(() => {
    let optionsList = isDiagnosis
      ? data?.pages.flatMap(page => page.data).map(diagnosis => ({
          value: diagnosis.id,
          label: diagnosis.name,
          group: diagnosis.type,
        })) || []
      : options.filter(option =>
          option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
          option.group?.toLowerCase().includes(inputValue.toLowerCase())
        );

    // Ensure the selected option is included
    if (selectedOptionState && !optionsList.find(option => option.value === selectedOptionState.value)) {
      optionsList = [selectedOptionState, ...optionsList];
    }

    return optionsList;
  }, [data, isDiagnosis, options, inputValue, selectedOptionState]);

  const selectedOption = useMemo(() => {
    if (selectedOptionState) {
      return selectedOptionState;
    }
    if (isDiagnosis) {
      return filteredOptions.find(option => option.value === value);
    }
    return options.find(option => option.value === value);
  }, [selectedOptionState, filteredOptions, options, value, isDiagnosis]);

  const handleSelect = useCallback((option: Option) => {
    onChange(option.value);
    setSelectedOptionState(option); // Set the selected option
    setInputValue('');
    setIsOpen(false);
  }, [onChange]);

  const clearSelection = useCallback(() => {
    onChange('');
    setSelectedOptionState(null); // Clear the selected option state
    setInputValue('');
  }, [onChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const handleScroll = useCallback(() => {
    if (dropdownRef.current && hasNextPage && !isFetching) {
      const { scrollTop, scrollHeight, clientHeight } = dropdownRef.current;
      if (scrollHeight - scrollTop <= clientHeight * 2) {
        fetchNextPage();
      }
    }
  }, [fetchNextPage, hasNextPage, isFetching]);

  useEffect(() => {
    const dropdown = dropdownRef.current;
    if (dropdown) {
      dropdown.addEventListener('scroll', handleScroll);
      return () => dropdown.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        // Implement logic to focus the next option
        break;
      case 'ArrowUp':
        // Implement logic to focus the previous option
        break;
      case 'Enter':
        // Implement logic to select the focused option
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      default:
        break;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!value) {
      setSelectedOptionState(null);
    }
  }, [value]);

  return (
    <div ref={wrapperRef} className="relative">
      <div
        className={`flex items-center border rounded-md ${className}`}
        onClick={() => setIsOpen(true)}
      >
        <input
          type="text"
          id={id}
          name={name}
          value={isOpen ? inputValue : selectedOption?.label || ''}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-md focus:outline-none"
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={`${id}-dropdown`}
        />
        {selectedOption && !isOpen && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              clearSelection();
            }}
            className="p-2 hover:text-gray-700"
            aria-label="Clear selection"
          >
            <X size={16} />
          </button>
        )}
        <div className="px-3 py-2 text-gray-400">
          {isLoading || isFetching ? <Loader className="animate-spin" size={16} aria-label="Loading" /> : <Search size={16} aria-label="Search" />}
        </div>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
          role="listbox"
          id={`${id}-dropdown`}
        >
          {error ? (
            <div className="px-4 py-2 text-red-500">
              An error occurred while fetching data.
            </div>
          ) : isLoading && isDiagnosis ? (
            <div className="px-4 py-2 text-gray-500">
              Loading...
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="px-4 py-2 text-gray-500">
              No results found
            </div>
          ) : (
            filteredOptions.map(option => (
              <div
                key={option.value}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                  option.value === value ? 'bg-blue-50 text-blue-700' : ''
                }`}
                onClick={() => handleSelect(option)}
                role="option"
                aria-selected={option.value === value}
              >
                {option.label} {option.group && <span className="text-gray-500">({option.group})</span>}
              </div>
            ))
          )}
          {isFetching && (
            <div className="px-4 py-2 text-center text-gray-500">
              Loading more...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;

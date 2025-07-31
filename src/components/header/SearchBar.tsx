// SearchBar component - handles search functionality

import React from 'react';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export function SearchBar({ placeholder = "Search...", onSearch }: SearchBarProps) {
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <div className="relative">
      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        onChange={handleSearch}
        className="pl-8 bg-muted/50 text-foreground placeholder:text-muted-foreground border-border/50 focus:border-primary/50"
      />
    </div>
  );
}
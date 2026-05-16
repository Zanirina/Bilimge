import { FiSearch } from "react-icons/fi";

export interface SearchInputProps {
  placeholder?: string;
  onSearch: (query: string) => void;
}

export default function SearchInput({ 
  placeholder = "Search universities or programs...",
  onSearch 
}: SearchInputProps) {
  return (
    <div className="flex-1 min-w-[200px] max-w-[450px]">
      <div className="relative flex items-center">
        <input
          type="text"
          placeholder={placeholder}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-[#DFE4EA] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3356AA]/30 focus:border-[#3356AA] text-secondary_text placeholder-gray-400"
        />
        <FiSearch className="absolute right-3 text-[#6B7280] pointer-events-none" size={20} />
      </div>
    </div>
  );
}

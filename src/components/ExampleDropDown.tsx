import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import type { PromptConfig } from "../constants/word.constants";

interface ExampleDropdownProps {
  items: PromptConfig[];
  value?: string;
  placeholder?: string;
  onChange: (item: PromptConfig) => void;
  className?: string;
}

export default function ExampleDropdown({
  items,
  value = "",
  placeholder = "Select an example...",
  onChange,
  className = "",
}: ExampleDropdownProps) {
  return (
    <div className={`relative w-full ${className}`}>
      <Select
        value={value || undefined} // important: undefined lets placeholder show
        onValueChange={(val: string) => {
          const found = items.find((it) => it.name === val);
          if (found) onChange(found);
        }}
      >
        <SelectTrigger className="w-full p-2 bg-black/30 text-gray-200 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition flex items-center justify-between">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent className="mt-2 rounded-lg border border-white/10 bg-black/90 backdrop-blur-xl shadow-2xl max-h-60 overflow-y-auto">
          {items.map((it) => (
            <SelectItem
              key={it.name}
              value={it.name} // must match `value`
              className="cursor-pointer px-3 py-2 text-sm text-gray-200 hover:bg-blue-600/40"
            >
              {it.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

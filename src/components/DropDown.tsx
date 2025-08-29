import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface DropdownProps<T> {
  items: T[];
  value?: string;
  placeholder?: string;
  getValue: (item: T) => string;
  getLabel: (item: T) => string;
  onChange: (item: T) => void;
  className?: string;
}

export default function Dropdown<T>({
  items,
  value = "",
  placeholder = "",
  getValue,
  getLabel,
  onChange,
  className = "",
}: DropdownProps<T>) {
  return (
    <div className={`relative w-full ${className}`}>
      <Select
        value={value || undefined}
        onValueChange={(val: string) => {
          const found = items.find((it) => getValue(it) === val);
          if (found) onChange(found);
        }}
      >
        <SelectTrigger className="w-full p-2 bg-black/30 text-gray-200 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition flex items-center justify-between">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent className="mt-2 rounded-lg border border-white/10 bg-black/90 backdrop-blur-xl shadow-2xl max-h-60 overflow-y-auto">
          {items.map((it, idx) => (
            <SelectItem
              key={idx}
              value={getValue(it)}
              className="cursor-pointer px-3 py-2 text-sm text-gray-200 hover:bg-blue-600/40"
            >
              {getLabel(it)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

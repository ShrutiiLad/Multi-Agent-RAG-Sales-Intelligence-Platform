import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { FaCircleXmark } from 'react-icons/fa6';

interface ChatSearchProps {
  onChangeValue: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ChatSearch: React.FC<ChatSearchProps> = ({ onChangeValue }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    onChangeValue(event);
  };

  const handleClear = () => {
    setSearchTerm(''); // Clear the search term
    onChangeValue({
      target: { value: '' },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="relative w-full nav">
      <Search className="absolute top-0 bottom-0 w-4 h-4 my-auto text-supportCol left-3" />
      <Input
        type="text"
        placeholder="Search conversations"
        className="pl-10 pr-4 w-[248px] bg-lightBackground text-sm font-normal placeholder:text-supportCol rounded-[10px]"
        value={searchTerm}
        onChange={handleChange}
      />
      {searchTerm && (
        <FaCircleXmark
          className="absolute right-3 top-3 text-supportCol cursor-pointer"
          onClick={handleClear}
        />
      )}
    </div>
  );
};

export default ChatSearch;

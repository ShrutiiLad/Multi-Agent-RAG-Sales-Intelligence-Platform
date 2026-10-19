import { Button } from '@/components/ui/button';
import {
  DialogClose,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import React from 'react';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import ComboboxPopoverAddItem from '@/components/helpers/form/content-library-add-item';
import {
  roleStatuses,
  strengthStatuses,
} from '@/components/constants/content-library-form';

interface documentDataType {
  title: string;
  description: string;
  location: string;
  date: Date | undefined;
  project: unknown;
  role: string;
  importedby: string;
  aiagent: string;
  strength: string;
  link: string;
}
export function ContentLibraryFormGeneral({
  closeBothDialogs,
  documentLoadedData,
}: {
  displayLibraryForm?: boolean;
  setDisplayLibraryForm: (display: boolean) => void;
  closeBothDialogs: () => void;
  documentLoadedData: { title: string };
}) {
  const [documentDate, setDocumentDate] = React.useState<Date | undefined>(
    new Date()
  );
  const [documentData, setDocumentData] = React.useState<documentDataType>({
    title: '',
    description: '',
    location: '',
    date: undefined,
    project: undefined,
    role: '',
    importedby: '',
    aiagent: '',
    strength: '',
    link: '',
  });

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setDocumentData((prevState) => ({ ...prevState, [name]: value }));
  };
  const handleChangeDate = (selectedDate: Date | undefined) => {
    setDocumentData((prevState) => ({ ...prevState, date: selectedDate }));
    setDocumentDate(selectedDate);
  };
  // const handleChangeAddedItem = (itemName: string, itemValue: string) => {
  //   setDocumentData((prevState) => ({ ...prevState, [itemName]: itemValue }));
  // };

  // Function to check if Save button should be disabled
  const isSaveDisabled = () => {
    return (
      !documentData.date || !documentData.project || !documentData.location
    );
  };

  return (
    <div>
      <DialogHeader className="pt-4 px-4 text-selected">
        {documentLoadedData?.title || 'New document'}
      </DialogHeader>
      <div className="flex border-t border-gray-200 border-solid">
        <div className="basis-4/5 bg-selectedBg py-6 px-10 h-[82vh] overflow-y-auto">
          <div className="bg-white rounded-md">
            <Input
              type="text"
              id="title"
              name="title"
              className="text-2xl pt-14 pb-10 px-10 font-semibold"
              placeholder="Untitled"
              onChange={handleChange}
            />
            <Textarea
              className="bg-white px-10 h-[85vh] text-md resize-none"
              style={{ maxHeight: '85vh', scrollbarWidth: 'none' }}
              placeholder="Write something to describe your document"
              name="description"
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="basis-2/5 p-4 m-4">
          <div className="flex items-center justify-between">
            <p className="text-inactive font-semibold">Date *</p>
            <Popover>
              <PopoverTrigger asChild className="bg-selectedBg">
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-[200px] justify-start text-left font-normal',
                    !documentDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {documentDate ? (
                    format(documentDate, 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={documentDate}
                  onSelect={handleChangeDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="h-[64vh] overflow-auto">
            {/* Todo : Use Buttons for adding multiple values */}
            <ComboboxPopoverAddItem
              name="Project *"
              initialText="Add project"
              updateState={(state) => console.log(state)}
              statuses={roleStatuses}
              statusesPlaceholder="Search project..."
              comboboxStyle="space-x-6"
            />
            <ComboboxPopoverAddItem
              name="Location *"
              initialText="Add location"
              updateState={(state) => console.log(state)}
              statuses={roleStatuses}
              statusesPlaceholder="Search location..."
            />
            <ComboboxPopoverAddItem
              name="Role"
              initialText="Add roles"
              updateState={(data) => console.log(data)}
              statuses={roleStatuses}
              statusesPlaceholder="Search role..."
              comboboxStyle="space-x-[60px]"
            />
            <ComboboxPopoverAddItem
              name="Strength"
              initialText="Add strength"
              updateState={(data) => console.log(data)}
              statuses={strengthStatuses}
              comboboxStyle="space-x-[34px]"
            />
            <ComboboxPopoverAddItem
              name="Original link"
              initialText="Add link"
              updateState={(data) => console.log(data)}
              statuses={strengthStatuses}
              comboboxStyle="space-x-[12px]"
            />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 flex justify-end pr-4 pb-4">
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              // onClick={() => setDisplayLibraryForm(false)}
              onClick={closeBothDialogs}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            className="px-4 bg-inactive"
            disabled={isSaveDisabled()}
            onClick={() => console.log(documentData)}
          >
            Save
          </Button>
        </DialogFooter>
      </div>
    </div>
  );
}

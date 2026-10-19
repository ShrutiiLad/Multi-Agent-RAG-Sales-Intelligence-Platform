import React, { useState } from "react";
import {
  DialogClose,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { createQuestions } from "@/services/questions/questions";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "@/components/ui/use-toast";

export interface ConversationStarterStepProps {
  assistantId: string;
  closeDialog: () => void;
  type: "edit" | "detail" | "create"
}

const ConversationStarterStep: React.FC<ConversationStarterStepProps> = ({
  assistantId,
  closeDialog,
  
}) => {
  const [inputs, setInputs] = useState([""]);

  const token = useSelector((state: RootState) => state.auth.token) || "";

  const handleInputChange = (index: number, value: string) => {
    // const newInputs = [...inputs];
    // newInputs[index] = value;
    // setInputs(newInputs);
    // // Add a new input if the current input is not empty and it's the last input
    // if (value.trim() !== "" && index === newInputs.length - 1) {
    //   setInputs([...newInputs, ""]);
    // }
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
    if (value.trim() !== "" && index === newInputs.length - 1 && newInputs.length < 4) {
      setInputs([...newInputs, ""]);
    }
  };

  const handleDeleteInput = (index: number) => {
    const newInputs = [...inputs];
    newInputs.length > 1 && newInputs.splice(index, 1); // Remove the input at the specified index
    setInputs(newInputs);
  };

  const submitQuestions = async () => {
    const validInputs = inputs.filter(Boolean);
    const response = await createQuestions(token, assistantId, validInputs);
    if (response.success) {
      toast({
        description: "Conversation Starters created successfully",
      });
      closeDialog();
    } else {
      console.error("Failed to create conversation starters:", response.error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Failed to Conversation Starters!",
      });
    }
  };

  const isFormValid = inputs.filter(Boolean).length;

  return (
    <>
      <DialogHeader className="text-selected text-lg font-medium leading-[18px] flex justify-center h-[52px] py-[17px] px-4 border-b">
        Conversation Starters
      </DialogHeader>
      <div className="px-4 py-3">
        <Label
          htmlFor="questions"
          className="text-lightText font-normal text-sm inline-block leading-tight"
        >
          Add preset questions to kickstart conversations
        </Label>
        <div className="flex flex-col gap-1">
          {inputs.map((input, index) => (
            <div className="flex" key={index}>
              <Input
                type="text"
                value={input}
                onChange={e => handleInputChange(index, e.target.value)}
                placeholder="Enter a conversation starter"
                className="border-1 placeholder:text-lightText text-selected rounded-r-none h-9"
              />
              <Button
                type="submit"
                variant="secondary"
                className="rounded-l-none border-1 border-l-0 h-9"
                onClick={() => handleDeleteInput(index)}
              >
                <Trash2 style={{ height: '16px', width: '16px', color: 'rgba(34, 34, 68, 0.5)' }} />
              </Button>
            </div>
          ))}
        </div>
      </div>
      <DialogFooter className="px-4 py-3">
        <DialogClose asChild>
          <Button
            type="button"
            variant="outline"
            className="text-sm rounded-[10px]"
            onClick={closeDialog}
          >
            Cancel
          </Button>
        </DialogClose>
        {isFormValid ? <Button
          type="submit"
          className="text-sm rounded-[10px] bg-selected"
          onClick={submitQuestions}
        >
          Save Starters
        </Button> : <Button
          type="submit"
          className="text-sm rounded-[10px] bg-selected"
          onClick={closeDialog}
        >
          Skip
        </Button>}
      </DialogFooter>
    </>
  );
};

export default ConversationStarterStep;

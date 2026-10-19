import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  createMessageFeedback,
  updateMessageFeedback,
} from "@/services/chat/feedback";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const ChatFeedbackModal = ({
  displayFeedbackModal,
  onDisplayFeedbackModal,
  handleClose,
  setReloadMessages,
  messageId,
  feedbackId,
  typeOfFeedback,
}: {
  displayFeedbackModal: boolean;
  onDisplayFeedbackModal: () => void;
  handleClose: () => void;
  setReloadMessages: React.Dispatch<React.SetStateAction<boolean | null>>;
  messageId: string;
  feedbackId: string;
  typeOfFeedback: boolean | null;
}) => {
  const [feedbackData, setFeedbackData] = React.useState<string>("");
  const token = useSelector((state: RootState) => state.auth.token);
  const { toast } = useToast();
  const checkboxes = [
    { id: "relevant-answer", label: "Relevant answer" },
    { id: "exactly-what-i-looked", label: "Exactly what I was looking for" },
    { id: "creative-answer", label: "Creative answer" },
    { id: "not-correct", label: "Not factually correct" },
    {
      id: "harmful-content",
      label: "Contains potentially harmful or sensitive content",
    },
    { id: "source-not-liked", label: "Don't like the source it cited" },
  ];

  const handleCheckboxChange = (id: string) => {
    console.log(id);
  };

  const handleFeedback = async () => {
    const updateFeedbackPayload = {
      feedback: feedbackData || undefined,
      positive: typeOfFeedback ?? null,
    };
    const createFeedbackPayload = {
      message_id: messageId,
      feedback: feedbackData || undefined,
      positive: typeOfFeedback ?? null,
    };
    try {
      if (!token) throw new Error("Token not found");
      const response = await (feedbackId
        ? updateMessageFeedback(updateFeedbackPayload, feedbackId, token)
        : createMessageFeedback(createFeedbackPayload, token ?? ""));
      if (response) {
        // setShowConfirmationModal(false);
        toast({ description: "Your feedback has been sent." });
        setReloadMessages(reload => !reload);
        onDisplayFeedbackModal();
      } else {
        console.error("Error");
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  return (
    <>
      <Dialog open={displayFeedbackModal} onOpenChange={onDisplayFeedbackModal}>
        <DialogTrigger asChild>Provide Additional Feedback</DialogTrigger>
        <DialogContent
          className="w-full md:w-2/4 lg:w-[480px] h-[374px] max-w-full gap-0"
          onInteractOutside={e => {
            e.preventDefault();
          }}
          closeDialog={handleClose}
        >
          <DialogHeader className=" h-[52px] py-4 px-4 text-[18px] leading-[18px] font-medium border-b">
            Provide Additional Feedback
          </DialogHeader>
          <div className="flex flex-col rounded-lg py-3 px-4 justify-center items-center">
            <div className="flex flex-col w-full mb-6 gap-2">
              {checkboxes
                .filter((_, index) => (typeOfFeedback ? index < 3 : index >= 3))
                .map(({ id, label }) => (
                  <div className="flex items-center" key={id}>
                    <Checkbox
                      id={id}
                      className="border-overlay hover:border-lightText"
                      onChange={() => {
                        handleCheckboxChange(id);
                      }}
                    />
                    <label
                      htmlFor={id}
                      className="text-[13px] ml-3 font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {label}
                    </label>
                  </div>
                ))}
            </div>
            <div className="flex flex-row items-center w-full mb-2 text-[13px]">
              <Label className="mr-1 text-inactive">Comment</Label>
              <p className="text-supportCol">{`(Optional)`}</p>
            </div>
            <Textarea
              className="border-1 border-inputFieldBg backdrop-blur-[50px] px-3 py-2 w-[448px] h-[96px] text-[13px] resize-none focus:border-selected"
              style={{ scrollbarWidth: "none" }}
              placeholder="Is there an issue with the answer? Which aspects don't meet your expectations?"
              name="description"
              onChange={e => {
                setFeedbackData(e.target.value);
              }}
            />
          </div>
          <DialogFooter className="px-4 py-3">
            <Button
              type="button"
              variant={"outline"}
              className="rounded-[10px]"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-[10px]"
              variant={"default"}
              onClick={handleFeedback}
            >
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default ChatFeedbackModal;

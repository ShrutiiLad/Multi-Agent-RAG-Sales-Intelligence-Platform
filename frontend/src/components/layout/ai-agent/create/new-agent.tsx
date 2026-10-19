// file_path: /src/components/layout/ai-agent/test/new-agent.tsx
import React, { useEffect, useState } from "react";
import { Bot } from "@/config/models"; // Assuming this is your Document type
import { AgentDetailsForm } from "@/components/layout/ai-agent/create/agent-details-form";
import {
  useCreateAgentMutation,
  useFetchModelsQuery,
  useUpdateAgentMutation,
} from "@/redux/store";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import DocumentSelectionStep, {
  DocumentSelectionStepProps,
} from "@/components/layout/ai-agent/create/agent-doc";
import ConversationStarterStep from "@/components/layout/ai-agent/create/conversation-starters-step";
import { Spinner } from "@/components/ui/spinner";

export interface AgentFormData {
  id?: string;
  assistant_id?: string | null; // CharField, nullable
  project?: string | null; // ForeignKey, nullable
  model: string; // ForeignKey, default=1
  name: string; // CharField
  instructions: string; // TextField
  description: string | null; // TextField, nullable
  rules: string | null; // TextField, nullable
  created_at?: string; // DateTimeField, optional
  updated_at?: string; // DateTimeField, optional
  documents: string[]; // ManyToManyField, related_name="bots", blank=True
  rag?: boolean; // BooleanField, default=True
  type?: string | null; // CharField, default="bot"
  disabled?: boolean; // BooleanField, default=False
  avatar?: File | string;
  partial: boolean;
}

const initialFormData: AgentFormData = {
  model: "",
  name: "",
  type: "",
  description: "",
  instructions: "",
  rules: "",
  documents: [],
  partial: true,
};

export interface MultiStepFormProps {
  agent?: Bot | null;
  closeDialog: () => void;
  setDialogClasses: React.Dispatch<React.SetStateAction<string>>;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  type: "edit" | "detail" | "create";
}

export const MultiStepForm: React.FC<MultiStepFormProps> = ({
  agent,
  closeDialog,
  setDialogClasses,
  currentStep,
  setCurrentStep,
  type,
}) => {
  // const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<AgentFormData>(initialFormData);
  const { toast } = useToast();
  const [assistantId, setAssistantId] = useState("");
  const [
    addAgent,
    {
      isLoading: isAddAgentLoading,
      isError,
      isSuccess,
      data: agentDetails,
      error: addAgentError,
    },
  ] = useCreateAgentMutation();
  const [
    updateAgent,
    {
      isLoading: isUpdateLoading,
      data: updatedData,
      isError: isUpdateError,
      error: updateAgentError,
      reset,
    },
  ] = useUpdateAgentMutation({
    fixedCacheKey: "updateAgent",
  });
  const {
    data: models,
    isFetching: isModelsLoading,
    isError: isModelsError,
    error: modelsError,
  } = useFetchModelsQuery();

  const updateFormData: DocumentSelectionStepProps["updateFormData"] = (
    data: Partial<AgentFormData>
  ) => {
    setFormData(prevState => ({ ...prevState, ...data }));
  };

  useEffect(() => {
    setDialogClasses(
      `flex flex-col gap-0 ${currentStep === 0
        ? "h-[740px] max-w-[472px]"
        : currentStep === 1
          ? "max-w-[800px] h-[460px]"
          : "min-w-[640px] max-h-[320px]"
      }`
    );
  }, [currentStep]);

  useEffect(() => {
    if (isSuccess) {
      toast({
        description: "Bot created successfully",
      });
      setAssistantId(agentDetails?.id || "");
      setCurrentStep(2);
    }
    if (isError) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Failed to update bot!",
      });
      console.error("An error occurred while creating the bot:", addAgentError);
    }
  }, [isSuccess, isError]);

  useEffect(() => {
    if (updatedData?.id && !isUpdateLoading) {
      toast({
        description: "Bot updated successfully",
      });
      closeDialog();
      reset();
    }
    if (isUpdateError) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Failed to update bot!",
      });
      console.error(
        "An error occurred while creating the bot:",
        updateAgentError
      );
    }
  }, [JSON.stringify(updatedData), isUpdateError]);

  const submit = async () => {
    addAgent(formData);
  };

  const update = async () => {
    updateAgent({ ...formData, id: agent?.id });
  };

  useEffect(() => {
    if (agent?.id) {
      const formData = {
        name: agent.name,
        type: agent.category,
        model: agent.model,
        description: agent.description,
        rules: agent.rules,
        documents: agent.documents,
        avatar: agent.avatar,
      };
      updateFormData(formData);
    }
  }, [JSON.stringify(agent)]);

  const isEditOrDetail = type === "edit" || type === "detail";

  const steps =
    (isEditOrDetail && formData?.name) || !isEditOrDetail
      ? [
        <AgentDetailsForm
          key="details"
          setCurrentStep={setCurrentStep}
          updateFormData={updateFormData}
          nextStep={type === "edit" ? update : submit}
          closeDialog={closeDialog}
          formData={formData}
          models={models || []}
          type={type}
        />,
        <DocumentSelectionStep
          key="documents"
          updateFormData={updateFormData}
          previousStep={() => setCurrentStep(0)}
          formData={formData}
          type={type}
        />,
        <ConversationStarterStep
          key="conversationStarters"
          closeDialog={closeDialog}
          assistantId={assistantId}
          type={type}
        />,
      ]
      : [];

  useEffect(() => {
    if (isModelsError) {
      toast({
        description: "Failed to fetch models, setting temporary models",
      });
      console.error("Failed to fetch models:", modelsError);
    }
  }, [isModelsError]);

  return (
    <div className="relative flex w-full h-full">
      {isAddAgentLoading || isUpdateLoading || isModelsLoading ? (
        <Spinner className="absolute left-1/2 top-1/2 z-50" />
      ) : (
        <ScrollArea className="w-full">{steps[currentStep]}</ScrollArea>
      )}
    </div>
  );
};

import React, { useState, useEffect, ChangeEvent } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AgentFormData } from "@/components/layout/ai-agent/create/new-agent";
import {
  DialogClose,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import DashedPlus from "@/assets/DashedPlus.svg";
import selectedSources from "@/assets/selectedSources.svg";
import { Model } from "@/config/models";
import { MEDIA_URL } from "@/services/global_config";
import _2 from "@/assets/avatar/avatar-48/2.png";
import _3 from "@/assets/avatar/avatar-48/3.png";
import _4 from "@/assets/avatar/avatar-48/4.png";
import _5 from "@/assets/avatar/avatar-48/5.png";
import _6 from "@/assets/avatar/avatar-48/6.png";
import _7 from "@/assets/avatar/avatar-48/7.png";
import _8 from "@/assets/avatar/avatar-48/8.png";
import { useToast } from "@/components/ui/use-toast";

function getAvatarImage(number: number) {
  let imageSrc;
  switch (number) {
    case 2:
      imageSrc = _2;
      break;
    case 3:
      imageSrc = _3;
      break;
    case 4:
      imageSrc = _4;
      break;
    case 5:
      imageSrc = _5;
      break;
    case 6:
      imageSrc = _6;
      break;
    case 7:
      imageSrc = _7;
      break;
    case 8:
      imageSrc = _8;
      break;
    default:
      imageSrc = _2;
      break;
  }
  return imageSrc;
}

export const AgentDetailsForm = ({
  updateFormData,
  nextStep,
  closeDialog,
  setCurrentStep,
  formData,
  models,
  type,
}: {
  updateFormData: (data: Partial<AgentFormData>) => void;
  nextStep: () => void;
  closeDialog: () => void;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  formData: AgentFormData;
  models: Model[];
  type: "edit" | "detail" | "create";
}) => {
  const [localFormData, setLocalFormData] =
    useState<Partial<AgentFormData>>(formData);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    formData?.avatar ? "custom" : "avatar-2.png"
  ); // To store the selected avatar
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    validateForm();
  }, [localFormData]);

  const validateForm = () => {
    const requiredFields: (keyof AgentFormData)[] = ["name", "type", "model"];
    const isValid = requiredFields.every(field => {
      const value = localFormData[field];
      return typeof value === "string" && value.trim() !== ""; // Check if the trimmed value is not empty
    });
    setIsFormValid(isValid);
  };
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageURL, setImageURL] = useState(
    formData?.avatar instanceof File
      ? URL.createObjectURL(formData?.avatar)
      : formData?.avatar && formData?.avatar !== ""
      ? MEDIA_URL + formData?.avatar
      : ""
  );

  const updateAvatar = async (avatar: string, custom?: boolean) => {
    const convertToBlob = async () => {
      try {
        // Load the PNG image
        const localImageUrl = custom
          ? avatar
          : getAvatarImage(Number(avatar.slice(7)[0]));
        const response = await fetch(localImageUrl);
        const blob = await response.blob();

        // Create a File object from the Blob
        const convertedFile = new File(
          [blob],
          custom ? "Custom_Avatar.png" : avatar,
          {
            type: "image/png",
          }
        );
        console.log(
          "Chosen Image: ",
          localImageUrl,
          response,
          blob,
          convertedFile
        );
        // Set the File object in state
        return convertedFile;
      } catch (error) {
        console.error("Error:", error);
      }
    };

    // Call the conversion function

    if (avatar !== "custom" || custom) {
      const chosenAvatar = await convertToBlob();

      setLocalFormData((prev: any) => ({ ...prev, avatar: chosenAvatar }));
      updateFormData({ avatar: chosenAvatar });
      console.log("chosenAvatar: ", chosenAvatar);
    }
  };

  const handleAvatarChange = async (avatar: string) => {
    if (selectedAvatar === avatar) {
      setSelectedAvatar("");
      setLocalFormData((prev: any) => ({ ...prev, avatar: "" }));
      updateFormData({ avatar: "" });

      return;
    }
    setSelectedAvatar(avatar);
    updateAvatar(avatar);
    // setLocalFormData(prev => ({ ...prev, avatar: avatar }));
  };

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { name: string; value: string }
  ) => {
    const { name, value } = "target" in e ? e.target : e;
    setLocalFormData((prev: any) => ({ ...prev, [name]: value }));
    if (value.trim() !== "") {
      updateFormData({ [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newData = { ...localFormData };
    if (newData.description === "") newData.description = null;
    if (newData.rules === "") newData.rules = "No Rules";
    // if (newData.avatar === "") newData.avatar = "avatar-2.png";
    updateFormData(newData as AgentFormData);
    nextStep();
  };

  useEffect(() => {
    setLocalFormData(formData);
    if (type === "create" || !formData?.avatar) updateAvatar(selectedAvatar);
    else if (typeof formData.avatar === "string") {
      const customImageUrl = MEDIA_URL + formData.avatar;
      // setImageURL(customImageUrl);
      updateAvatar(customImageUrl, true);
    }
  }, []);

  const handleSelectedAvatar = () => {
    setSelectedAvatar("custom");
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const fileType = file.type;

      if (
        fileType === "image/png" ||
        fileType === "image/jpeg" ||
        fileType === "image/jpg"
      ) {
        setImageURL(URL.createObjectURL(files[0]));
        setSelectedFile(file);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid Image",
          description: "The provided file is not a valid image.",
        });
        handleAvatarChange(`avatar-2.png`);
      }
    }
  };

  useEffect(() => {
    if (!selectedFile) return;
    setLocalFormData((prev: any) => ({ ...prev, avatar: selectedFile }));
    updateFormData({ avatar: selectedFile });
    console.log("File is this: ", selectedFile);
  }, [selectedFile]);

  const isDetail = type === "detail";

  return (
    <>
      <DialogHeader className="text-selected text-lg font-medium leading-[18px] border-b px-4 py-[17px] h-[52px] justify-center">
        {type === "edit"
          ? "Edit"
          : type === "create"
          ? "New"
          : localFormData.name}{" "}
        AI Agent
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="px-4 py-3 space-y-6 w-[472px]">
          <div className="space-y-2 leading-[14px]">
            <Label>Avatar</Label>
            <div className="flex items-center">
              {/* {localFormData.avatar && (
                <div className="w-12 h-12 border-2 border-selected rounded-xl flex items-center justify-center  cursor-pointer">
                  <img
                    src={`${MEDIA_URL}${localFormData.avatar as string}`}
                    alt=""
                    className={`cursor-pointer border-2 w-full h-full p-[0.5px] rounded-[10px] object-cover`}
                  />
                </div>
              )} */}
              {Array.from(Array(7).keys()).map(index => (
                <div
                  key={index}
                  className={`w-12 h-12 bg-selectedBg flex mr-2 items-center justify-between cursor-pointer ${
                    selectedAvatar === `avatar-${index + 2}.png`
                      ? "outline outline-selected rounded-[10px]"
                      : "rounded-[10px]"
                  }`}
                  onClick={() =>
                    isDetail ? 0 : handleAvatarChange(`avatar-${index + 2}.png`)
                  }
                >
                  <img
                    src={getAvatarImage(index + 2)}
                    alt={`${index + 2}`}
                    className={`h-12 w-12  ${
                      selectedAvatar === `avatar-${index + 2}.png`
                        ? "rounded-[10px]"
                        : " opacity-40"
                    }`}
                  />
                </div>
              ))}
              {/* Option to add custom avatar */}
              {!isDetail ? (
                <div className="relative w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer">
                  <label htmlFor="avatar">
                    <img
                      src={imageURL || DashedPlus}
                      alt=""
                      className={` cursor-pointer w-12 h-12 rounded-[10px] ${
                        selectedAvatar === `custom`
                          ? "outline outline-selected p-[0.5px] "
                          : ""
                      }`}
                    />
                  </label>
                  <input
                    id="avatar"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleFileChange}
                    onClick={handleSelectedAvatar}
                    className=" w-12 h-12 p-1 top-0 left-0 opacity-10 cursor-pointer hidden"
                  />
                </div>
              ) : (
                imageURL && (
                  <div className="relative w-12 h-12 rounded-xl flex items-center justify-center  cursor-pointer">
                    <img
                      src={imageURL}
                      alt=""
                      className={` cursor-pointer w-12 h-12  ${
                        selectedAvatar === `custom`
                          ? "border-2 border-selected p-[0.5px] rounded-[10px]"
                          : ""
                      }`}
                    />
                  </div>
                )
              )}
              <div></div>
            </div>
          </div>
          <div className="space-y-2  leading-[14px]">
            <Label>Name</Label>
            <Input
              required={true}
              type="text"
              id="name"
              name="name"
              className="border h-9 rounded-[10px]"
              placeholder="Name your AI Agent"
              onChange={handleInputChange}
              value={localFormData.name || ""}
              disabled={isDetail}
            />
          </div>

          <div className="space-y-2 leading-[14px]">
            <Label>Category</Label>
            <Select
              required={true}
              name="type"
              defaultValue={localFormData.type || undefined}
              onValueChange={value =>
                handleInputChange({ name: "type", value })
              }
              disabled={isDetail}
            >
              <SelectTrigger className="border h-9 pl-3 rounded-[10px]">
                <SelectValue placeholder="Select Bot Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem className="pl-2" value="general">
                    General
                  </SelectItem>
                  <SelectItem className="pl-2" value="interview" disabled>
                    Interview
                  </SelectItem>
                  <SelectItem className="pl-2" value="hybrid" disabled>
                    Hybrid
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 leading-[14px]">
            <Label>Model</Label>
            <Select
              required={true}
              name="model"
              defaultValue={localFormData.model}
              onValueChange={value =>
                handleInputChange({ name: "model", value })
              }
              disabled={isDetail}
            >
              <SelectTrigger className="border h-9 pl-3 rounded-[10px]">
                <SelectValue placeholder="Select Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {models.map(model => (
                    <SelectItem
                      key={model.id}
                      className="pl-2"
                      value={model.id}
                    >
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 leading-[14px]">
            <div className="flex items-center w-full">
              <Label className="mr-1">Description</Label>
              <p className="text-supportCol text-[13px]">{`(optional)`}</p>
            </div>
            <Input
              type="text"
              id="description"
              name="description"
              className="border h-9 text-sm rounded-[10px]"
              placeholder="Add a short description about what this agent does"
              onChange={handleInputChange}
              value={localFormData.description || ""}
              disabled={isDetail}
            />
          </div>

          <div className="space-y-2 leading-[14px]">
            <div className="flex items-center w-full">
              <Label className="mr-1">Rules and Instructions</Label>
              <p className="text-supportCol text-[13px]">{`(optional)`}</p>
            </div>
            <Textarea
              className="border text-sm h-[76px] resize-none rounded-[10px]"
              placeholder="What does it do? What does it avoid doing?"
              name="rules"
              onChange={handleInputChange}
              value={localFormData.rules || ""}
              disabled={isDetail}
            />
          </div>
          <div className="space-y-2 leading-[14px]">
            <div className="flex items-center w-full">
              <Label className="mr-1">Knowledge</Label>
              <p className="text-supportCol text-[13px]">{`(optional)`}</p>
            </div>
            {formData.documents.length || isDetail ? (
              <Button
                type="button"
                variant="outline"
                className={`rounded-[10px] h-9 w-full flex justify-between items-center p-0 text-sm font-normal ${
                  isDetail ? "cursor-none opacity-50" : ""
                }`}
                onClick={() => (isDetail ? 0 : setCurrentStep(1))}
              >
                <div className="pl-3 flex gap-2 leading-tight">
                  <img src={selectedSources} alt="" className="" />
                  {formData.documents.length
                    ? formData.documents.length
                    : "No"}{" "}
                  {formData.documents.length == 1 ? "source" : "sources"}{" "}
                  selected
                </div>
                <div className="bg-veryLightBackground self-stretch flex items-center px-2 border-l-1 rounded-r-[10px]">
                  <p>Edit sources</p>
                </div>
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="rounded-[10px] h-9 flex gap-2 px-3"
                onClick={() => setCurrentStep(1)}
              >
                <img src={selectedSources} alt="" className="" />
                Select Sources
              </Button>
            )}
          </div>
        </div>
        <DialogFooter className="px-4 mt-1">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="text-sm rounded-[10px]"
              onClick={closeDialog}
            >
              {isDetail ? "Close" : "Cancel"}
            </Button>
          </DialogClose>
          {!isDetail && (
            <Button
              type="submit"
              className="text-sm rounded-[10px] bg-selected"
              disabled={!isFormValid || isDetail}
            >
              Continue
            </Button>
          )}
        </DialogFooter>
      </form>
    </>
  );
};

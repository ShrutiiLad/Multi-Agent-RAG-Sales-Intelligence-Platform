import {create} from 'zustand';

interface DialogueState {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    data: any;
    setData: (data: any) => void;
}

export const useDialogue = create<DialogueState>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
    data: {},
    setData: (data) => set({ data: data }),
}));

// TODO: CHECK THIS OUT
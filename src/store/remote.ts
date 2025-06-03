import { create } from "zustand";

interface ISocial {
  id: string;
  name: string;
  icon: string;
  url: string;
}
interface IRemote {
  social?: ISocial[];
  fetch: () => Promise<void>;
}

export const useRemote = create<IRemote>((set) => ({
  social: [
    {
      id: "github",
      name: "GitHub",
      icon: "mdi:github",
      url: "https://github.com/cubidron",
    },
  ],
  fetch: async () => {
    try {
      const response = await fetch("/api/social");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      set({ social: data });
    } catch (error) {
      console.error("Failed to fetch social data:", error);
    }
  },
}));

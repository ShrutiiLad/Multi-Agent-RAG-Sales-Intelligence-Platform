import { Thread } from "@/config/models";

interface FilteredConversations {
  today: Thread[];
  yesterday: Thread[];
  restOfDays: Thread[];
}

export function getFilteredConversations(
  data: Thread[]
): FilteredConversations {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const todayObjects: Thread[] = [];
  const yesterdayObjects: Thread[] = [];
  const restOfObjects: Thread[] = [];
  data.map(item => {
    const itemDate = new Date(item.updated_at);
    if (
      itemDate.getFullYear() === today.getFullYear() &&
      itemDate.getMonth() === today.getMonth() &&
      itemDate.getDate() === new Date().getDate()
    ) {
      todayObjects.push(item);
    } else if (
      itemDate.getFullYear() === yesterday.getFullYear() &&
      itemDate.getMonth() === yesterday.getMonth() &&
      itemDate.getDate() === yesterday.getDate()
    ) {
      yesterdayObjects.push(item);
    } else {
      restOfObjects.push(item);
    }
  });
  return {
    today: todayObjects,
    yesterday: yesterdayObjects,
    restOfDays: restOfObjects,
  };
}

/// THREAD MODEL

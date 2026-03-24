
export const base44 = {
  entity: () => ({
    list: async () => [
      {
        id: 1,
        title: "Imagine",
        difficulty: "easy",
        instrument: "piano",
        tempo: 75
      },
      {
        id: 2,
        title: "Fur Elise",
        difficulty: "medium",
        instrument: "piano",
        tempo: 95
      },
      {
        id: 3,
        title: "Canon in D",
        difficulty: "hard",
        instrument: "violin",
        tempo: 60
      }
    ],
    create: async (data) => data,
    update: async (id, data) => ({ id, ...data }),
    delete: async (id) => ({ success: true })
  })
};

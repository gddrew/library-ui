// campaignsData.ts

export interface Campaign {
    name: string;
    active: boolean;
  }
  
  export const campaigns: Campaign[] = [
    { name: 'Friends of the Library', active: true },
    { name: 'Annual Book Sale 2024', active: true },
    { name: 'Autumn Book Sale 2022', active: false },
    { name: 'Autumn Book Sale 2023', active: false },
    { name: 'Spring Book Sale 2022', active: false },
    { name: 'Spring Book Sale 2023', active: false },
  ];
  
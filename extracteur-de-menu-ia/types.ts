
export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: string;
}

export interface MenuCategory {
  id: string;
  categoryName: string;
  items: MenuItem[];
}

export interface MenuData {
  restaurantName: string;
  categories: MenuCategory[];
}

export interface ExtractedColors {
  dominant: string;
  palette: string[];
}

// Global declaration for ColorThief loaded from CDN
declare global {
  interface Window {
    ColorThief: any;
  }
}

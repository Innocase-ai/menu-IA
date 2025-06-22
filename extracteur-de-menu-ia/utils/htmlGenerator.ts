
import type { MenuData, ExtractedColors, MenuCategory, MenuItem } from '../types';

// Helper to sanitize text to prevent basic XSS if data is directly used, though Gemini should provide clean data.
const escapeHtml = (unsafe: string | undefined): string => {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const generateMenuHtml = (data: MenuData, colors: ExtractedColors): string => {
  const primaryColor = colors.dominant || '#3B82F6'; // Tailwind's blue-500 as fallback
  const secondaryColor = colors.palette?.[1] || '#1D4ED8'; // Tailwind's blue-700 as fallback
  const textColor = colors.palette?.[2] || '#1F2937'; // Tailwind's gray-800
  const itemDescriptionColor = colors.palette?.[3] || '#4B5563'; // Tailwind's gray-600
  const backgroundColor = '#FFFFFF'; // Standard white background for content

  // It's important to use inline styles for dynamic colors as Tailwind classes are fixed.
  // Use Tailwind for layout and general styling within the generated HTML.
  
  let html = `<div class="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 rounded-xl shadow-2xl" style="background-color: ${backgroundColor};">`;
  html += `<header class="text-center mb-10 border-b-2 pb-6" style="border-color: ${primaryColor};">`;
  html += `<h1 class="text-4xl font-bold tracking-tight sm:text-5xl" style="color: ${primaryColor};">${escapeHtml(data.restaurantName) || 'Menu du Restaurant'}</h1>`;
  html += `</header>`;

  data.categories.forEach((category: MenuCategory) => {
    if (category.categoryName && category.items && category.items.length > 0) {
      html += `<section class="mb-10">`;
      html += `<h2 class="text-3xl font-semibold mb-6 border-l-4 pl-3" style="color: ${secondaryColor}; border-color: ${secondaryColor};">${escapeHtml(category.categoryName)}</h2>`;
      html += `<div class="space-y-6">`;
      category.items.forEach((item: MenuItem) => {
        html += `<article class="flex justify-between items-start py-3 border-b border-gray-200 last:border-b-0">`;
        html += `<div class="mr-4 flex-grow">`;
        html += `<h3 class="text-xl font-medium" style="color: ${textColor};">${escapeHtml(item.name) || 'Plat sans nom'}</h3>`;
        if (item.description) {
          html += `<p class="text-sm mt-1" style="color: ${itemDescriptionColor};">${escapeHtml(item.description)}</p>`;
        }
        html += `</div>`;
        html += `<p class="text-xl font-semibold whitespace-nowrap" style="color: ${primaryColor};">${escapeHtml(item.price) || ''}</p>`;
        html += `</article>`;
      });
      html += `</div></section>`;
    }
  });

  html += `<footer class="mt-12 pt-6 border-t text-center text-xs" style="border-color: ${primaryColor}; color: ${itemDescriptionColor};">`;
  html += `<p>Menu généré par IA.</p>`;
  html += `</footer>`;
  html += `</div>`;
  return html;
};

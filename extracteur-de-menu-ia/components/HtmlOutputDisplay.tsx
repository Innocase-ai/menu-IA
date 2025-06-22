
import React from 'react';
import { Loader } from './Loader';
import { MenuCategoryComponent } from './MenuCategoryComponent';
import { EditableText } from './EditableText';
import type { MenuData, ExtractedColors, MenuCategory, MenuItem } from '../types';

interface HtmlOutputDisplayProps {
  menuData: MenuData | null;
  extractedColors: ExtractedColors;
  isLoading: boolean;
  hasImage: boolean;
  onRestaurantNameChange: (newName: string) => void;
  onCategoryChange: (categoryId: string, data: Partial<Omit<MenuCategory, 'id' | 'items'>>) => void;
  onItemChange: (categoryId: string, itemId: string, data: Partial<Omit<MenuItem, 'id'>>) => void;
  onAddCategory: () => void;
  onDeleteCategory: (categoryId: string) => void;
  onAddItem: (categoryId: string) => void;
  onDeleteItem: (categoryId: string, itemId: string) => void;
}

const PlusCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);


export const HtmlOutputDisplay: React.FC<HtmlOutputDisplayProps> = ({
  menuData,
  extractedColors,
  isLoading,
  hasImage,
  onRestaurantNameChange,
  onCategoryChange,
  onItemChange,
  onAddCategory,
  onDeleteCategory,
  onAddItem,
  onDeleteItem,
}) => {
  const getPlaceholder = () => {
    if (!hasImage && !menuData) {
      return "Téléversez une image et cliquez sur 'Analyser et Générer le Menu' pour voir le menu ici.";
    }
    if (isLoading) {
      return "Génération du menu en cours...";
    }
    if (!menuData && hasImage && !isLoading) {
       return "Analyse terminée. Cliquez sur 'Analyser et Générer le Menu' ou vérifiez les erreurs si l'image a déjà été traitée.";
    }
    if (!menuData && !hasImage && !isLoading){
       return "Le menu éditable apparaîtra ici après l'analyse.";
    }
    return ""; 
  };
  
  const primaryColor = extractedColors.dominant || '#3B82F6';
  const backgroundColor = '#FFFFFF'; // Keep content background consistent for readability

  if (!menuData && !isLoading) {
    return (
      <div className="text-slate-400 flex flex-col items-center justify-center h-96 lg:min-h-[calc(100vh-300px)] max-h-[80vh] bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-inner text-center">
        <p>{getPlaceholder()}</p>
      </div>
    );
  }
  
  if (isLoading && !menuData) {
     return (
      <div className="text-slate-400 flex flex-col items-center justify-center h-96 lg:min-h-[calc(100vh-300px)] max-h-[80vh] bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-inner">
        <Loader className="mb-4" />
        <p>{getPlaceholder()}</p>
      </div>
    );
  }


  return (
    <div
      id="html-output-interactive"
      className="w-full h-auto lg:min-h-[calc(100vh-350px)] max-h-[80vh] bg-slate-50 border border-slate-200 rounded-lg p-1 sm:p-2 overflow-auto shadow-inner"
    >
      {menuData ? (
        <div className="max-w-3xl mx-auto p-3 sm:p-4 lg:p-6 rounded-lg" style={{ backgroundColor }}>
          <header className="text-center mb-8 border-b-2 pb-5" style={{ borderColor: primaryColor }}>
            <EditableText
              value={menuData.restaurantName || 'Menu du Restaurant'}
              onChange={(value) => onRestaurantNameChange(value)}
              className="text-3xl font-bold tracking-tight sm:text-4xl hover:bg-slate-100 p-1 rounded transition-colors"
              inputClassName="text-3xl font-bold tracking-tight sm:text-4xl w-full text-center"
              style={{ color: primaryColor }}
              ariaLabel="Nom du restaurant"
            />
          </header>

          {menuData.categories.map((category, index) => (
            <MenuCategoryComponent
              key={category.id}
              category={category}
              extractedColors={extractedColors}
              onCategoryChange={onCategoryChange}
              onItemChange={onItemChange}
              onAddItem={onAddItem}
              onDeleteItem={onDeleteItem}
              onDeleteCategory={onDeleteCategory}
              isFirst={index === 0}
              isLast={index === menuData.categories.length - 1}
            />
          ))}
          <div className="mt-8 text-center">
            <button
              onClick={onAddCategory}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-150 flex items-center justify-center mx-auto"
              aria-label="Ajouter une nouvelle catégorie"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Ajouter une Catégorie
            </button>
          </div>
           <footer className="mt-10 pt-5 border-t text-center text-xs" style={{ borderColor: primaryColor, color: extractedColors.palette?.[3] || '#4B5563' }}>
            <p>Menu généré par IA. Cliquez sur les textes pour les éditer.</p>
          </footer>
        </div>
      ) : (
         <div className="text-slate-400 flex flex-col items-center justify-center h-full text-center p-4">
          {isLoading && <Loader className="mb-4" />}
          <p>{getPlaceholder()}</p>
        </div>
      )}
    </div>
  );
};

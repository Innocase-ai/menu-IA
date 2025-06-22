
import React from 'react';
import { EditableText } from './EditableText';
import { MenuItemComponent } from './MenuItemComponent';
import type { MenuCategory, MenuItem, ExtractedColors } from '../types';

interface MenuCategoryComponentProps {
  category: MenuCategory;
  extractedColors: ExtractedColors;
  onCategoryChange: (categoryId: string, data: Partial<Omit<MenuCategory, 'id' | 'items'>>) => void;
  onItemChange: (categoryId: string, itemId: string, data: Partial<Omit<MenuItem, 'id'>>) => void;
  onAddItem: (categoryId: string) => void;
  onDeleteItem: (categoryId: string, itemId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  isFirst?: boolean;
  isLast?: boolean;
}

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.243.096 3.222.261m3.222.261L12 5.291M11.255 5.291L3.777 5.79m7.478 0c-.229-.061-.455-.119-.679-.17M5.256 5.79A48.068 48.068 0 0112 4.5c4.236 0 8.083.986 11.416 2.768m-11.416-2.768v.001c0 .001 0 .001 0 .002M7.5 7.5h9M7.5 10.5h9M7.5 13.5h9m-4.5-4.5v4.5" />
  </svg>
);

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);


export const MenuCategoryComponent: React.FC<MenuCategoryComponentProps> = ({
  category,
  extractedColors,
  onCategoryChange,
  onItemChange,
  onAddItem,
  onDeleteItem,
  onDeleteCategory,
}) => {
  const secondaryColor = extractedColors.palette?.[1] || '#1D4ED8';

  return (
    <section className="mb-8 p-3 rounded-md hover:shadow-lg transition-shadow duration-200 ease-in-out group border border-transparent hover:border-slate-200">
      <div className="flex justify-between items-center mb-5">
        <EditableText
          value={category.categoryName}
          onChange={(newName) => onCategoryChange(category.id, { categoryName: newName })}
          className="text-2xl font-semibold border-l-4 pl-3 hover:bg-slate-100 p-1 rounded transition-colors"
          inputClassName="text-2xl font-semibold w-full"
          style={{ color: secondaryColor, borderColor: secondaryColor }}
          ariaLabel={`Nom de la catégorie ${category.categoryName}`}
        />
        <button
          onClick={() => onDeleteCategory(category.id)}
          className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-100"
          title={`Supprimer la catégorie ${category.categoryName}`}
          aria-label={`Supprimer la catégorie ${category.categoryName}`}
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-5">
        {category.items.map((item, index) => (
          <MenuItemComponent
            key={item.id}
            item={item}
            categoryId={category.id}
            extractedColors={extractedColors}
            onItemChange={onItemChange}
            onDeleteItem={onDeleteItem}
            isLast={index === category.items.length -1}
          />
        ))}
         {category.items.length === 0 && (
            <p className="text-sm text-slate-500 italic py-3 px-2">Cette catégorie est vide. Cliquez sur "Ajouter un Plat" pour commencer.</p>
        )}
      </div>
      <button
        onClick={() => onAddItem(category.id)}
        className="mt-4 text-sm bg-green-500 hover:bg-green-600 text-white font-medium py-1.5 px-3 rounded-md shadow-sm transition-colors duration-150 flex items-center"
        aria-label={`Ajouter un plat à la catégorie ${category.categoryName}`}
      >
        <PlusIcon className="h-4 w-4 mr-1.5" />
        Ajouter un Plat
      </button>
    </section>
  );
};

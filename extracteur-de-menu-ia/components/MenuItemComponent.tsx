
import React from 'react';
import { EditableText } from './EditableText';
import type { MenuItem, ExtractedColors } from '../types';

interface MenuItemComponentProps {
  item: MenuItem;
  categoryId: string;
  extractedColors: ExtractedColors;
  onItemChange: (categoryId: string, itemId: string, data: Partial<Omit<MenuItem, 'id'>>) => void;
  onDeleteItem: (categoryId: string, itemId: string) => void;
  isLast?: boolean;
}

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.243.096 3.222.261m3.222.261L12 5.291M11.255 5.291L3.777 5.79m7.478 0c-.229-.061-.455-.119-.679-.17M5.256 5.79A48.068 48.068 0 0112 4.5c4.236 0 8.083.986 11.416 2.768m-11.416-2.768v.001c0 .001 0 .001 0 .002M7.5 7.5h9M7.5 10.5h9M7.5 13.5h9m-4.5-4.5v4.5" />
  </svg>
);

export const MenuItemComponent: React.FC<MenuItemComponentProps> = ({
  item,
  categoryId,
  extractedColors,
  onItemChange,
  onDeleteItem,
  isLast
}) => {
  const primaryColor = extractedColors.dominant || '#3B82F6';
  const textColor = extractedColors.palette?.[2] || '#1F2937';
  const itemDescriptionColor = extractedColors.palette?.[3] || '#4B5563';

  return (
    <article className={`flex justify-between items-start py-2.5 group hover:bg-slate-50 rounded-md p-2 transition-colors ${!isLast ? 'border-b border-slate-200' : ''}`}>
      <div className="mr-3 flex-grow">
        <EditableText
          value={item.name}
          onChange={(newName) => onItemChange(categoryId, item.id, { name: newName })}
          className="text-lg font-medium hover:bg-slate-100 p-0.5 rounded transition-colors"
          inputClassName="text-lg font-medium w-full"
          style={{ color: textColor }}
          ariaLabel={`Nom du plat ${item.name}`}
        />
        <EditableText
          value={item.description || ""}
          onChange={(newDesc) => onItemChange(categoryId, item.id, { description: newDesc })}
          className="text-xs mt-0.5 hover:bg-slate-100 p-0.5 rounded transition-colors"
          inputClassName="text-xs w-full"
          inputElementType="textarea"
          style={{ color: itemDescriptionColor }}
          ariaLabel={`Description du plat ${item.name}`}
        />
      </div>
      <div className="flex items-center">
        <EditableText
          value={item.price}
          onChange={(newPrice) => onItemChange(categoryId, item.id, { price: newPrice })}
          className="text-lg font-semibold whitespace-nowrap mr-2 hover:bg-slate-100 p-0.5 rounded transition-colors"
          inputClassName="text-lg font-semibold w-20 text-right"
          style={{ color: primaryColor }}
          ariaLabel={`Prix du plat ${item.name}`}
        />
        <button
          onClick={() => onDeleteItem(categoryId, item.id)}
          className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-100"
          title={`Supprimer ${item.name}`}
          aria-label={`Supprimer le plat ${item.name}`}
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
};

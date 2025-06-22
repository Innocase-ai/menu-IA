
import React, { useState, useEffect, useRef, KeyboardEvent, FocusEvent } from 'react';

interface EditableTextProps {
  value: string;
  onChange: (newValue: string) => void;
  className?: string;
  inputClassName?: string;
  style?: React.CSSProperties;
  inputElementType?: 'input' | 'textarea';
  ariaLabel?: string;
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  className = '',
  inputClassName = '',
  style,
  inputElementType = 'input',
  ariaLabel
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputElementType === 'input') {
        (inputRef.current as HTMLInputElement).select();
      } else {
         // For textarea, move cursor to end
        const el = inputRef.current as HTMLTextAreaElement;
        el.setSelectionRange(el.value.length, el.value.length);
      }
    }
  }, [isEditing, inputElementType]);

  const handleSave = () => {
    if (currentValue.trim() !== value.trim() || currentValue !== value) { // Check if there's an actual change
        onChange(currentValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (inputElementType === 'input' || (inputElementType === 'textarea' && !e.shiftKey))) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setCurrentValue(value); // Revert to original value
      setIsEditing(false);
    }
  };
  
  const handleBlur = (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Timeout to allow click on potential save button if we add one
    // setTimeout(handleSave, 0); 
    handleSave();
  };


  if (isEditing) {
    const commonProps = {
      ref: inputRef as any,
      value: currentValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setCurrentValue(e.target.value),
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      className: `bg-white p-1 border border-blue-400 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${inputClassName}`,
      style: style,
      'aria-label': ariaLabel || 'Champ modifiable',
    };
    if (inputElementType === 'textarea') {
      return <textarea {...commonProps} rows={3} />;
    }
    return <input type="text" {...commonProps} />;
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer min-h-[1.5em] ${className}`}
      style={style}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') setIsEditing(true);}}
      aria-label={`Modifier ${ariaLabel || 'texte'}`}
    >
      {value || <span className="italic text-slate-400">(vide)</span>}
    </div>
  );
};


import React, { useState, useCallback, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { HtmlOutputDisplay } from './components/HtmlOutputDisplay';
import { Loader } from './components/Loader';
import { ErrorModal } from './components/ErrorModal';
import { extractMenuData } from './services/geminiService';
import { extractColorsFromImage } from './utils/colorExtractor';
import { generateMenuHtml } from './utils/htmlGenerator';
import type { MenuData, ExtractedColors, MenuCategory, MenuItem }  from './types';

// Simple UUID v4 generator
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const App: React.FC = () => {
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [base64ImageData, setBase64ImageData] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] = useState<ExtractedColors | null>(null);
  
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [generatedHtmlContent, setGeneratedHtmlContent] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingColors, setIsLoadingColors] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);


  const fallbackColors: ExtractedColors = { dominant: '#3B82F6', palette: ['#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'] };

  useEffect(() => {
    if (imagePreviewUrl && selectedImageFile) {
      setIsLoadingColors(true);
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = async () => {
        try {
          const colors = await extractColorsFromImage(img);
          setExtractedColors(colors);
        } catch (err) {
          console.error("Erreur lors de l'extraction des couleurs:", err);
          setError("Impossible d'extraire les couleurs de l'image. Utilisation des couleurs par défaut.");
          setExtractedColors(fallbackColors);
        } finally {
          setIsLoadingColors(false);
        }
      };
      img.onerror = () => {
        setError("Erreur de chargement de l'image pour l'extraction des couleurs. Utilisation des couleurs par défaut.");
        setExtractedColors(fallbackColors);
        setIsLoadingColors(false);
      }
      img.src = imagePreviewUrl;
    } else {
      setExtractedColors(null);
      setIsLoadingColors(false);
    }
  }, [imagePreviewUrl, selectedImageFile]);

  useEffect(() => {
    if (menuData && extractedColors) {
      const html = generateMenuHtml(menuData, extractedColors);
      setGeneratedHtmlContent(html);
    } else if (menuData && !extractedColors && !isLoadingColors) {
      // If colors haven't been extracted yet but menu data exists (e.g. colors failed), use fallback.
      const html = generateMenuHtml(menuData, fallbackColors);
      setGeneratedHtmlContent(html);
    } else {
      setGeneratedHtmlContent(null);
    }
  }, [menuData, extractedColors, isLoadingColors]);

  const handleImageUpload = useCallback((file: File | null) => {
    setSelectedImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreviewUrl(result);
        setBase64ImageData(result.split(',')[1]);
      };
      reader.onerror = () => {
        setError("Erreur lors de la lecture du fichier image.");
        resetImageState();
      };
      reader.readAsDataURL(file);
      setMenuData(null); 
      setGeneratedHtmlContent(null);
    } else {
      resetImageState();
    }
  }, []);

  const resetImageState = () => {
    setSelectedImageFile(null);
    setBase64ImageData(null);
    setImagePreviewUrl(null);
    setExtractedColors(null);
    setMenuData(null);
    setGeneratedHtmlContent(null);
    setIsLoadingColors(false);
  };

  const handleConvert = async () => {
    if (!base64ImageData) {
      setError("Veuillez d'abord téléverser une image.");
      return;
    }
    if (!process.env.API_KEY) {
      setError("La clé API Gemini n'est pas configurée. Veuillez vérifier les variables d'environnement.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setMenuData(null); // Clear previous data before fetching new
    setGeneratedHtmlContent(null);

    try {
      const data = await extractMenuData(base64ImageData);
      setMenuData(data);
      // Colors will be handled by useEffect
    } catch (err: any) {
      console.error('Erreur lors de la conversion:', err);
      setError(err.message || "Une erreur est survenue lors de la conversion du menu.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const showSuccessBriefly = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  const handleDownload = () => {
    if (!generatedHtmlContent) {
      setError("Il n'y a pas de contenu à télécharger.");
      return;
    }
    const restaurantName = menuData?.restaurantName || 'menu';
    const filename = `${restaurantName.toLowerCase().replace(/\s+/g, '_')}_menu.html`;
    
    const fullHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(menuData?.restaurantName) || 'Menu'}</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>body { font-family: 'Inter', sans-serif; }</style>
</head>
<body class="bg-slate-100 p-4 sm:p-8">
    ${generatedHtmlContent}
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccessBriefly("Menu téléchargé !");
  };

  const handleCopyHtml = async () => {
    if (!generatedHtmlContent) {
      setError("Rien à copier.");
      return;
    }
     const fullHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(menuData?.restaurantName) || 'Menu'}</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>body { font-family: 'Inter', sans-serif; }</style>
</head>
<body class="bg-slate-100 p-4 sm:p-8">
    ${generatedHtmlContent}
</body>
</html>`;
    try {
      await navigator.clipboard.writeText(fullHtml);
      showSuccessBriefly("HTML copié dans le presse-papiers !");
    } catch (err) {
      setError("Impossible de copier le HTML. Votre navigateur ne supporte peut-être pas cette fonctionnalité ou les permissions sont refusées.");
      console.error("Copy failed", err);
    }
  };

  // --- Edit Handlers ---
  const handleRestaurantNameChange = (newName: string) => {
    setMenuData(prev => prev ? { ...prev, restaurantName: newName } : null);
  };

  const handleCategoryChange = (categoryId: string, updatedCategoryData: Partial<Omit<MenuCategory, 'id' | 'items'>>) => {
    setMenuData(prev => prev ? {
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === categoryId ? { ...cat, ...updatedCategoryData } : cat
      )
    } : null);
  };

  const handleItemChange = (categoryId: string, itemId: string, updatedItemData: Partial<Omit<MenuItem, 'id'>>) => {
    setMenuData(prev => prev ? {
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === categoryId ? {
          ...cat,
          items: cat.items.map(item =>
            item.id === itemId ? { ...item, ...updatedItemData } : item
          )
        } : cat
      )
    } : null);
  };

  const handleAddCategory = () => {
    const newCategory: MenuCategory = {
      id: uuidv4(),
      categoryName: "Nouvelle Catégorie",
      items: []
    };
    setMenuData(prev => prev ? {
      ...prev,
      categories: [...prev.categories, newCategory]
    } : { restaurantName: "Nouveau Menu", categories: [newCategory] });
  };

  const handleDeleteCategory = (categoryId: string) => {
    setMenuData(prev => prev ? {
      ...prev,
      categories: prev.categories.filter(cat => cat.id !== categoryId)
    } : null);
  };

  const handleAddItem = (categoryId: string) => {
    const newItem: MenuItem = {
      id: uuidv4(),
      name: "Nouvel Article",
      description: "",
      price: "0.00"
    };
    setMenuData(prev => prev ? {
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === categoryId ? { ...cat, items: [...cat.items, newItem] } : cat
      )
    } : null);
  };

  const handleDeleteItem = (categoryId: string, itemId: string) => {
    setMenuData(prev => prev ? {
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === categoryId ? {
          ...cat,
          items: cat.items.filter(item => item.id !== itemId)
        } : cat
      )
    } : null);
  };
  
  const escapeHtml = (unsafe: string | undefined): string => {
    if (typeof unsafe !== 'string') return '';
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 min-h-screen flex flex-col">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900">
          Extracteur de Menu <span className="text-blue-600">IA</span> Pro
        </h1>
        <p className="mt-2 text-lg text-slate-600 max-w-2xl mx-auto">
          Téléversez, analysez, éditez et exportez vos menus avec aisance.
        </p>
      </header>

      <main className="bg-white rounded-xl shadow-2xl p-6 md:p-8 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-6 text-slate-700 text-center">
              1. Téléversez votre menu
            </h2>
            <ImageUploader
              imagePreviewUrl={imagePreviewUrl}
              onImageUpload={handleImageUpload}
              onReset={resetImageState}
              disabled={isLoading || isLoadingColors}
            />
             {isLoadingColors && <div className="mt-4 text-sm text-blue-600 flex items-center"><Loader size="sm" className="mr-2"/> Extraction des couleurs...</div>}
            <button
              id="convert-btn"
              onClick={handleConvert}
              disabled={!base64ImageData || isLoading || isLoadingColors}
              className="mt-8 w-full max-w-md bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-150 ease-in-out flex items-center justify-center"
              aria-label={isLoading ? "Analyse en cours" : "Convertir en HTML"}
            >
              {isLoading ? (
                <>
                  <Loader size="sm" />
                  <span className="ml-2">Analyse en cours...</span>
                </>
              ) : (
                "Analyser et Générer le Menu"
              )}
            </button>
          </div>

          <div className="flex flex-col">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-2">
              <h2 className="text-2xl font-semibold text-slate-700">2. Éditez & Exportez</h2>
              <div className="flex gap-2 flex-wrap justify-center sm:justify-end">
                <button
                  onClick={handleCopyHtml}
                  disabled={!generatedHtmlContent || isLoading}
                  className="w-full sm:w-auto bg-sky-500 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-150 ease-in-out flex items-center justify-center"
                  aria-label="Copier le code HTML"
                >
                  <ClipboardIcon className="h-5 w-5 mr-2" />
                  Copier HTML
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!generatedHtmlContent || isLoading}
                  className="w-full sm:w-auto bg-green-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-150 ease-in-out flex items-center justify-center"
                  aria-label="Télécharger le fichier HTML"
                >
                  <DownloadIcon className="h-5 w-5 mr-2" />
                  Télécharger
                </button>
              </div>
            </div>
            <HtmlOutputDisplay
              menuData={menuData}
              extractedColors={extractedColors || fallbackColors}
              isLoading={isLoading}
              hasImage={!!selectedImageFile}
              onRestaurantNameChange={handleRestaurantNameChange}
              onCategoryChange={handleCategoryChange}
              onItemChange={handleItemChange}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
              onAddItem={handleAddItem}
              onDeleteItem={handleDeleteItem}
            />
          </div>
        </div>
      </main>
      
      {error && (
        <ErrorModal message={error} onClose={() => setError(null)} />
      )}
      {successMessage && (
         <div className="fixed bottom-5 right-5 bg-green-500 text-white py-3 px-5 rounded-lg shadow-xl animate-pulse">
            {successMessage}
        </div>
      )}

      <footer className="text-center mt-12 py-6 border-t border-slate-200">
        <p className="text-sm text-slate-500">
          Propulsé par Gemini API & React. Conçu avec Tailwind CSS.
        </p>
      </footer>
    </div>
  );
};

// --- SVG Icons ---
const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const ClipboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
  </svg>
);

export default App;

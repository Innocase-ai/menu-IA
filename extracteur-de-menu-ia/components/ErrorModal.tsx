
import React from 'react';

interface ErrorModalProps {
  message: string;
  onClose: () => void;
}

const AlertTriangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);


export const ErrorModal: React.FC<ErrorModalProps> = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
      <div className="relative p-6 border w-full max-w-md shadow-xl rounded-xl bg-white">
        <div className="mt-3 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <AlertTriangleIcon className="h-10 w-10 text-red-600" />
          </div>
          <h3 className="text-xl leading-6 font-medium text-slate-900">Erreur</h3>
          <div className="mt-3 px-2 py-3">
            <p className="text-sm text-slate-600 break-words">{message}</p>
          </div>
          <div className="mt-4 px-4 py-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-red-600 text-white text-base font-medium rounded-lg w-full shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

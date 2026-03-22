import React from 'react';

export const SnackCard = ({
  name, price, imageUrl, quantity, onAdd, onRemove
}) => {
  return (
    <div className="md:col-span-4 bg-surface-container-low rounded-xl p-6 flex flex-col cinematic-glow transition-all duration-300">
      <div className="h-40 rounded-lg overflow-hidden mb-4">
        <img
          alt={name}
          className="w-full h-full object-cover"
          src={imageUrl}
        />
      </div>
      <div className="flex-1">
        <h4 className="text-xl font-headline font-bold mb-1">{name}</h4>
      </div>
      <div className="flex items-center justify-between mt-auto">
        <span className="font-bold text-lg">${price.toFixed(2)}</span>
        <div className="flex items-center bg-surface-container-high rounded-lg p-1">
          <button
            onClick={onRemove}
            className="w-6 h-6 flex items-center justify-center hover:bg-surface-bright rounded transition-colors"
          >
            <span className="material-symbols-outlined text-xs">remove</span>
          </button>
          <span className="px-3 text-sm font-bold">{quantity}</span>
          <button
            onClick={onAdd}
            className="w-6 h-6 flex items-center justify-center hover:bg-surface-bright rounded transition-colors"
          >
            <span className="material-symbols-outlined text-xs">add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
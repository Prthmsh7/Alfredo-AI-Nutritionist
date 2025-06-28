import React, { useState } from 'react';
import { Package, AlertTriangle, ShoppingCart, Plus, Minus, Search, Calendar } from 'lucide-react';
import { usePantry } from '../hooks/usePantry';
import { useShoppingList } from '../hooks/useShoppingList';

interface PantryManagerProps {
  userId: string;
}

const PantryManager: React.FC<PantryManagerProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'alerts' | 'shopping'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);

  const { 
    pantryItems, 
    ingredients, 
    addPantryItem, 
    updatePantryQuantity, 
    removePantryItem,
    getLowStockItems,
    getExpiringItems 
  } = usePantry(userId);

  const { 
    currentList, 
    createGroceryList, 
    addItemToList, 
    toggleItemCompletion,
    removeItemFromList 
  } = useShoppingList(userId);

  const lowStockItems = getLowStockItems();
  const expiringItems = getExpiringItems();

  const filteredPantryItems = pantryItems.filter(item =>
    item.ingredient?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !pantryItems.some(pantryItem => pantryItem.ingredient_id === ingredient.id)
  );

  const handleAddToPantry = async (ingredientId: string, quantity: number, unit: string) => {
    await addPantryItem(ingredientId, quantity, unit);
    setShowAddItem(false);
    setSearchTerm('');
  };

  const handleAddToShoppingList = async (itemName: string) => {
    if (!currentList) {
      const { data: newList } = await createGroceryList(`Shopping List - ${new Date().toLocaleDateString()}`);
      if (newList) {
        await addItemToList(newList.id, itemName, 1, 'piece');
      }
    } else {
      await addItemToList(currentList.id, itemName, 1, 'piece');
    }
  };

  const tabs = [
    { id: 'inventory', label: 'Inventory', icon: Package, count: pantryItems.length },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, count: lowStockItems.length + expiringItems.length },
    { id: 'shopping', label: 'Shopping', icon: ShoppingCart, count: currentList?.items.filter(item => !item.is_completed).length || 0 },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border-2 border-black shadow-solid-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-black">Pantry Manager</h1>
          <button
            onClick={() => setShowAddItem(true)}
            className="bg-primary-500 text-white px-4 py-2 rounded-xl border-2 border-black shadow-solid-sm hover:shadow-solid transition-all duration-200 hover:-translate-y-0.5 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Item</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl border-2 shadow-solid-sm transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-solid'
                    : 'bg-gray-100 border-gray-300 hover:shadow-solid'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    isActive ? 'bg-white text-primary-500' : 'bg-primary-500 text-white'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border-2 border-black shadow-solid-lg p-6">
        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search pantry items..."
                className="w-full pl-11 pr-4 py-3 border-2 border-black rounded-xl shadow-solid-sm focus:shadow-solid focus:outline-none"
              />
            </div>

            {/* Pantry Items */}
            <div className="space-y-3">
              {filteredPantryItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-300">
                  <div className="flex-1">
                    <h3 className="font-semibold text-black">{item.ingredient?.name}</h3>
                    <p className="text-sm text-gray-600">
                      {item.quantity} {item.unit}
                      {item.expiry_date && (
                        <span className="ml-2">
                          • Expires: {new Date(item.expiry_date).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                    {item.is_low_stock && (
                      <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-lg border border-red-300">
                        Low Stock
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updatePantryQuantity(item.id, Math.max(0, item.quantity - 1))}
                      className="w-8 h-8 bg-white border-2 border-black rounded-lg shadow-solid-sm hover:shadow-solid transition-all duration-200 flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updatePantryQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 bg-white border-2 border-black rounded-lg shadow-solid-sm hover:shadow-solid transition-all duration-200 flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            {/* Low Stock Items */}
            {lowStockItems.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-black mb-3 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                  Low Stock Items
                </h3>
                <div className="space-y-3">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-red-50 rounded-xl border-2 border-red-300">
                      <div>
                        <h4 className="font-semibold text-black">{item.ingredient?.name}</h4>
                        <p className="text-sm text-gray-600">Only {item.quantity} {item.unit} left</p>
                      </div>
                      <button
                        onClick={() => handleAddToShoppingList(item.ingredient?.name || '')}
                        className="bg-primary-500 text-white px-3 py-2 rounded-lg border-2 border-black shadow-solid-sm hover:shadow-solid transition-all duration-200 text-sm"
                      >
                        Add to List
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expiring Items */}
            {expiringItems.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-black mb-3 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-yellow-500" />
                  Expiring Soon
                </h3>
                <div className="space-y-3">
                  {expiringItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border-2 border-yellow-300">
                      <div>
                        <h4 className="font-semibold text-black">{item.ingredient?.name}</h4>
                        <p className="text-sm text-gray-600">
                          Expires: {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-yellow-700">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {lowStockItems.length === 0 && expiringItems.length === 0 && (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No alerts at this time</p>
                <p className="text-sm text-gray-400">Your pantry is well stocked!</p>
              </div>
            )}
          </div>
        )}

        {/* Shopping Tab */}
        {activeTab === 'shopping' && (
          <div className="space-y-4">
            {currentList ? (
              <div>
                <h3 className="text-lg font-semibold text-black mb-4">{currentList.name}</h3>
                <div className="space-y-3">
                  {currentList.items.map((item) => (
                    <div key={item.id} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                      item.is_completed 
                        ? 'bg-green-50 border-green-300' 
                        : 'bg-gray-50 border-gray-300'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleItemCompletion(currentList.id, item.id)}
                          className={`w-6 h-6 rounded-lg border-2 border-black shadow-solid-sm transition-all duration-200 ${
                            item.is_completed 
                              ? 'bg-green-500 text-white' 
                              : 'bg-white hover:bg-gray-100'
                          }`}
                        >
                          {item.is_completed && '✓'}
                        </button>
                        <div className={item.is_completed ? 'line-through text-gray-500' : ''}>
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-gray-600">{item.quantity} {item.unit}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItemFromList(currentList.id, item.id)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No active shopping list</p>
                <button
                  onClick={() => createGroceryList(`Shopping List - ${new Date().toLocaleDateString()}`)}
                  className="mt-3 bg-primary-500 text-white px-4 py-2 rounded-xl border-2 border-black shadow-solid-sm hover:shadow-solid transition-all duration-200"
                >
                  Create Shopping List
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border-2 border-black shadow-solid-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b-2 border-black">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-black">Add to Pantry</h2>
                <button
                  onClick={() => setShowAddItem(false)}
                  className="p-2 rounded-lg border-2 border-black bg-gray-100 shadow-solid-sm hover:shadow-solid transition-all duration-200"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search ingredients..."
                  className="w-full pl-11 pr-4 py-3 border-2 border-black rounded-xl shadow-solid-sm focus:shadow-solid focus:outline-none"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredIngredients.slice(0, 10).map((ingredient) => (
                  <button
                    key={ingredient.id}
                    onClick={() => handleAddToPantry(ingredient.id, 1, 'piece')}
                    className="w-full text-left p-3 bg-gray-50 rounded-xl border-2 border-gray-300 hover:bg-gray-100 transition-all duration-200"
                  >
                    <p className="font-medium text-black">{ingredient.name}</p>
                    <p className="text-sm text-gray-600">
                      {ingredient.calories_per_100g} cal/100g
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PantryManager;
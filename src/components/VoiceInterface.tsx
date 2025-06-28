import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Loader2, Volume2 } from 'lucide-react';
import { useAI } from '../hooks/useAI';
import { usePantry } from '../hooks/usePantry';
import { useNutrition } from '../hooks/useNutrition';
import { useShoppingList } from '../hooks/useShoppingList';
import { Recipe, VoiceCommand } from '../types';

interface VoiceInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ isOpen, onClose, userId }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [conversation, setConversation] = useState<VoiceCommand[]>([]);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [status, setStatus] = useState('Tap to start speaking...');

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechEndTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);

  const { generateRecipe, processConsumption, generateSmartResponse, isProcessing } = useAI();
  const { pantryItems, consumeIngredient } = usePantry(userId);
  const { addMeal } = useNutrition(userId);
  const { generateSmartShoppingList } = useShoppingList(userId);

  useEffect(() => {
    if (isOpen) {
      initializeSpeechRecognition();
    } else {
      cleanup();
    }

    return cleanup;
  }, [isOpen]);

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setStatus('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setStatus('Listening... speak now');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscriptUpdate = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptUpdate += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(interimTranscript);
      
      if (finalTranscriptUpdate) {
        setFinalTranscript(prev => prev + finalTranscriptUpdate);
        
        // Clear previous timeout
        if (speechEndTimeoutRef.current) {
          clearTimeout(speechEndTimeoutRef.current);
        }
        
        // Set new timeout for speech end detection
        speechEndTimeoutRef.current = setTimeout(() => {
          const fullTranscript = (finalTranscript + finalTranscriptUpdate).trim();
          if (fullTranscript && !isProcessingRef.current) {
            processVoiceCommand(fullTranscript);
          }
        }, 1500); // 1.5 seconds of silence
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setStatus('Speech recognition error. Try again.');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (!isProcessingRef.current) {
        setStatus('Tap to start speaking...');
      }
    };

    recognitionRef.current = recognition;
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setFinalTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const processVoiceCommand = async (command: string) => {
    isProcessingRef.current = true;
    setStatus('Processing your request...');
    
    try {
      // Determine command type
      const commandType = classifyCommand(command);
      
      const newCommand: VoiceCommand = {
        command,
        type: commandType,
        processed: false,
        timestamp: new Date().toISOString(),
      };

      setConversation(prev => [...prev, newCommand]);

      let response = '';
      
      switch (commandType) {
        case 'recipe':
          response = await handleRecipeCommand(command);
          break;
        case 'consumption':
          response = await handleConsumptionCommand(command);
          break;
        case 'pantry':
          response = await handlePantryCommand(command);
          break;
        case 'shopping':
          response = await handleShoppingCommand(command);
          break;
        default:
          response = await generateSmartResponse(command);
          break;
      }

      // Update conversation with response
      setConversation(prev => prev.map(cmd => 
        cmd.timestamp === newCommand.timestamp 
          ? { ...cmd, processed: true, response }
          : cmd
      ));

      // Speak the response
      speakResponse(response);
      
    } catch (error) {
      console.error('Error processing voice command:', error);
      const errorResponse = "I'm sorry, I couldn't process that request. Please try again.";
      speakResponse(errorResponse);
    } finally {
      isProcessingRef.current = false;
      setStatus('Tap to start speaking...');
      setTranscript('');
      setFinalTranscript('');
    }
  };

  const classifyCommand = (command: string): VoiceCommand['type'] => {
    const lower = command.toLowerCase();
    
    if (lower.includes('recipe') || lower.includes('cook') || lower.includes('make')) {
      return 'recipe';
    }
    if (lower.includes('ate') || lower.includes('eat') || lower.includes('drank') || lower.includes('consumed')) {
      return 'consumption';
    }
    if (lower.includes('pantry') || lower.includes('inventory') || lower.includes('check')) {
      return 'pantry';
    }
    if (lower.includes('shopping') || lower.includes('grocery') || lower.includes('buy')) {
      return 'shopping';
    }
    
    return 'general';
  };

  const handleRecipeCommand = async (command: string): Promise<string> => {
    // Extract dish name from command
    const dishMatch = command.match(/(?:recipe for|make|cook|how to make)\s+(.+?)(?:\s|$)/i);
    const dishName = dishMatch ? dishMatch[1].trim() : 'a dish';
    
    const recipe = await generateRecipe(dishName, pantryItems);
    
    if (recipe) {
      setCurrentRecipe(recipe);
      const missingIngredients = recipe.ingredients.filter(ing => !ing.available);
      
      if (missingIngredients.length > 0) {
        await generateSmartShoppingList(missingIngredients.map(ing => ing.name));
        return `Here's a recipe for ${recipe.name}! I've found ${recipe.ingredients.filter(ing => ing.available).length} ingredients in your pantry and added ${missingIngredients.length} missing items to your shopping list.`;
      } else {
        return `Perfect! Here's a recipe for ${recipe.name} using ingredients from your pantry.`;
      }
    }
    
    return `I couldn't generate a recipe for ${dishName} right now. Please try again.`;
  };

  const handleConsumptionCommand = async (command: string): Promise<string> => {
    const consumption = await processConsumption(command);
    
    if (consumption) {
      // Log the meal
      await addMeal(
        `${consumption.ingredient} (voice logged)`,
        'snack',
        [{
          ingredient_id: '', // We'd need to match this properly
          quantity: consumption.quantity,
          unit: consumption.unit,
          calories: consumption.calories,
          protein: consumption.protein,
          carbs: consumption.carbs,
          fat: consumption.fat,
        }]
      );

      // Update pantry if ingredient exists
      await consumeIngredient(consumption.ingredient, consumption.quantity, consumption.unit);
      
      return `I've logged ${consumption.quantity} ${consumption.unit} of ${consumption.ingredient} (${consumption.calories} calories) to your daily intake.`;
    }
    
    return "I couldn't process that food item. Please try again with a clearer description.";
  };

  const handlePantryCommand = async (command: string): Promise<string> => {
    const lowStockItems = pantryItems.filter(item => item.is_low_stock || item.quantity <= item.low_stock_threshold);
    const totalItems = pantryItems.length;
    
    if (command.toLowerCase().includes('low stock') || command.toLowerCase().includes('running out')) {
      if (lowStockItems.length > 0) {
        const itemNames = lowStockItems.map(item => item.ingredient?.name).join(', ');
        return `You're running low on: ${itemNames}. Consider adding these to your shopping list.`;
      } else {
        return "All your pantry items are well stocked!";
      }
    }
    
    return `You have ${totalItems} items in your pantry. ${lowStockItems.length > 0 ? `${lowStockItems.length} items are running low.` : 'Everything looks well stocked!'}`;
  };

  const handleShoppingCommand = async (command: string): Promise<string> => {
    // This would integrate with shopping list functionality
    return "I can help you manage your shopping list. What would you like to add?";
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const cleanup = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (speechEndTimeoutRef.current) {
      clearTimeout(speechEndTimeoutRef.current);
    }
    setIsListening(false);
    setTranscript('');
    setFinalTranscript('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] sm:rounded-2xl border-t-2 sm:border-2 border-black shadow-solid-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-black">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-500 rounded-xl border-2 border-black shadow-solid-sm flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-black">Voice Assistant</h2>
              <p className="text-sm text-gray-600">{status}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg border-2 border-black bg-gray-100 shadow-solid-sm hover:shadow-solid transition-all duration-200"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Conversation history */}
          <div className="space-y-4 mb-6">
            {conversation.map((cmd, index) => (
              <div key={index} className="space-y-2">
                <div className="bg-gray-100 p-3 rounded-xl border-2 border-black shadow-solid-sm">
                  <p className="font-medium text-black">{cmd.command}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(cmd.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                {cmd.processed && cmd.response && (
                  <div className="bg-primary-500 text-white p-3 rounded-xl border-2 border-black shadow-solid-sm">
                    <p>{cmd.response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Current recipe display */}
          {currentRecipe && (
            <div className="bg-yellow-200 p-4 rounded-xl border-2 border-black shadow-solid-sm mb-6">
              <h3 className="font-bold text-lg mb-2">{currentRecipe.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Ingredients:</h4>
                  <ul className="text-sm space-y-1">
                    {currentRecipe.ingredients.map((ing, index) => (
                      <li key={index} className={`flex justify-between ${ing.available ? 'text-green-700' : 'text-red-700'}`}>
                        <span>{ing.quantity} {ing.unit} {ing.name}</span>
                        <span>{ing.available ? '✓' : '✗'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Instructions:</h4>
                  <ol className="text-sm space-y-1 list-decimal list-inside">
                    {currentRecipe.instructions.slice(0, 3).map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Live transcript */}
          {(transcript || finalTranscript) && (
            <div className="bg-gray-50 p-3 rounded-xl border-2 border-gray-300 mb-4">
              <p className="text-gray-800">
                <span className="font-medium">{finalTranscript}</span>
                <span className="text-gray-500">{transcript}</span>
              </p>
            </div>
          )}
        </div>

        {/* Voice control button */}
        <div className="p-6 border-t-2 border-black">
          <div className="flex items-center justify-center">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className={`w-20 h-20 rounded-full border-4 border-black shadow-solid-lg transition-all duration-200 flex items-center justify-center ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse-orange'
                  : 'bg-primary-500 hover:bg-orange-600 hover:-translate-y-1 hover:shadow-solid-xl'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isProcessing ? (
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              ) : isListening ? (
                <MicOff className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </button>
          </div>
          <p className="text-center text-sm text-gray-600 mt-3">
            {isProcessing ? 'Processing...' : isListening ? 'Tap to stop listening' : 'Tap to start speaking'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceInterface;
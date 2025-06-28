# Alfredo - AI Nutrition Assistant

A sophisticated voice-first Progressive Web App (PWA) for nutrition tracking, pantry management, and AI-powered recipe generation.

## 🎤 Key Features

- **Voice-First Interface**: Google Assistant-style voice interaction with automatic speech detection
- **AI-Powered Recipe Generation**: Smart recipes based on available pantry ingredients using Gemini AI
- **Smart Pantry Management**: Real-time inventory tracking with low stock alerts
- **Comprehensive Nutrition Tracking**: Daily goals, meal logging, and progress visualization
- **Intelligent Shopping Lists**: Auto-generated lists based on missing recipe ingredients
- **Progressive Web App**: Native app-like experience with offline capabilities
- **Beautiful Neomorphic Design**: Modern UI with soft shadows and premium aesthetics

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom neomorphic design system
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **AI**: Google Gemini API for natural language processing
- **Voice**: Web Speech API for recognition and synthesis
- **Icons**: Lucide React

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd alfredo-nutrition-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your:
   - Supabase project URL and anon key
   - Gemini AI API key (included for demo)

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Setup

The app uses Supabase with the following tables:
- `profiles` - User profile information
- `ingredients` - Master ingredient database (100+ pre-loaded items)
- `meals` - User meal logs with nutrition data
- `meal_ingredients` - Junction table for meal components
- `pantry_items` - User inventory tracking
- `nutrition_goals` - Daily nutrition targets
- `grocery_lists` - Shopping list management

All tables include Row Level Security (RLS) for data protection.

## 🎯 Voice Commands

### Recipe Generation
- "I want to make mango shake"
- "Recipe for chicken pasta"
- "Cook something with chicken"

### Consumption Tracking
- "I ate 2 apples"
- "I had a sandwich"
- "I drank a glass of milk"

### Pantry Management
- "Do I have tomatoes?"
- "Check my pantry"
- "What's in my inventory?"

### Shopping Lists
- "Add eggs to shopping list"
- "Generate shopping list"

## 🎨 Design System

### Colors
- **Primary**: Orange 500 (#FD6F24)
- **Accent**: Yellow 200 (#F1F3C2)
- **Neutral**: Gray 50-900 scale

### Typography
- **Font**: Inter (400, 500, 600, 700)
- **Scale**: 12px - 24px with consistent hierarchy

### Shadows (Neomorphic)
- `shadow-solid-sm`: 2px 2px 0px 0px rgba(0, 0, 0, 1)
- `shadow-solid`: 4px 4px 0px 0px rgba(0, 0, 0, 1)
- `shadow-solid-lg`: 6px 6px 0px 0px rgba(0, 0, 0, 1)

## 📱 PWA Features

- **Offline Support**: Service worker for caching
- **App-like Experience**: Full-screen mode, home screen installation
- **Responsive Design**: Mobile-first with desktop optimization
- **Push Notifications**: Meal reminders and low stock alerts

## 🔒 Security

- **Row Level Security**: Database-level access control
- **Environment Variables**: Secure API key management
- **Input Sanitization**: Protection against injection attacks
- **HTTPS Only**: Secure connections required

## 🚀 Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to your preferred platform**
   - Netlify: Connect GitHub repo for auto-deployment
   - Vercel: Import project and deploy
   - Static hosting: Upload `dist/` folder

## 🤖 AI Integration

The app uses Google Gemini AI for:
- Natural language processing of voice commands
- Recipe generation based on available ingredients
- Smart nutrition estimation from food descriptions
- Contextual responses and recommendations

## 📊 Analytics & Insights

- Daily nutrition progress tracking
- Meal history and patterns
- Pantry usage analytics
- Shopping list optimization

## 🔮 Future Enhancements

- Barcode scanning for easy ingredient addition
- Photo-based meal logging with computer vision
- Social features for sharing recipes
- Integration with fitness trackers
- Multi-language support
- Advanced meal planning

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Bolt.new](https://bolt.new) - AI-powered development platform
- Powered by Supabase for backend infrastructure
- Google Gemini AI for intelligent processing
- Lucide React for beautiful icons

---

**Made with ❤️ using Bolt.new**
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Category = require('./models/Category');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/heroai';

const data = [
  {
    name: "Finance",
    icon: "fas fa-coins",
    niches: ["Banking", "Investment", "Trading", "Economy", "Funding", "Personal Finance", "Retail banking", "Digital banking", "Loan education", "Credit card tips", "UPI/payment systems", "Stock market", "IPO analysis", "Mutual funds", "ETFs", "Dividend investing", "Intraday", "Swing trading", "Options trading", "Forex", "Crypto trading", "GDP", "Inflation", "Budget analysis", "Taxation", "Economic policies", "Startup funding", "Angel investing", "Venture capital", "Crowdfunding", "Grants", "Saving hacks", "Passive income", "Financial freedom", "Side hustles", "Insurance"],
    isMonetizable: true
  },
  {
    name: "Business",
    icon: "fas fa-briefcase",
    niches: ["Entrepreneurship", "Startups", "Franchises", "Leadership", "Management", "Sales", "Negotiation", "Branding", "Marketing", "Customer psychology", "Business automation", "SaaS business", "AI business", "Rural business", "MSME"],
    isMonetizable: true
  },
  {
    name: "Technology",
    icon: "fas fa-microchip",
    niches: ["Artificial Intelligence", "AI tools", "AI automation", "Prompt engineering", "AI coding", "Software Development", "Web development", "App development", "Backend systems", "APIs", "Cybersecurity", "Ethical hacking", "Data privacy", "Malware analysis", "Gadgets", "Smartphones", "Laptops", "Smart devices", "Future Tech", "Robotics", "AR/VR", "Quantum computing", "Space tech"],
    isMonetizable: true
  },
  {
    name: "Education",
    icon: "fas fa-graduation-cap",
    niches: ["School learning", "Competitive exams", "UPSC", "SSC", "IIT-JEE", "NEET", "Spoken English", "Coding education", "Career guidance", "Skill development", "Productivity learning", "Study motivation"],
    isMonetizable: true
  },
  {
    name: "Entertainment",
    icon: "fas fa-film",
    niches: ["Comedy", "Memes", "Movies", "Web series", "Celebrity news", "Music", "Dance", "Fan edits", "Roast content", "Reaction videos", "OTT reviews"],
    isViral: true
  },
  {
    name: "Gaming",
    icon: "fas fa-gamepad",
    niches: ["PC gaming", "Mobile gaming", "Esports", "Game streaming", "Walkthroughs", "Game reviews", "Minecraft", "GTA", "BGMI", "Free Fire", "Roblox"],
    isMonetizable: true
  },
  {
    name: "Health & Fitness",
    icon: "fas fa-heartbeat",
    niches: ["Gym", "Weight loss", "Yoga", "Meditation", "Mental health", "Home workouts", "Bodybuilding", "Diet planning", "Supplements", "Biohacking"],
    isMonetizable: true
  },
  {
    name: "Food",
    icon: "fas fa-utensils",
    niches: ["Cooking", "Street food", "Restaurant reviews", "Recipes", "Healthy food", "Fast food", "Village cooking", "Luxury dining", "Baking", "Tea/Coffee culture"],
    isViral: true
  },
  {
    name: "Travel",
    icon: "fas fa-plane",
    niches: ["Budget travel", "Luxury travel", "Solo travel", "Bike trips", "Trekking", "Hotel reviews", "Visa guidance", "Hidden places", "Travel vlogs", "Camping"],
    isViral: true
  },
  {
    name: "Lifestyle",
    icon: "fas fa-couch",
    niches: ["Daily routines", "Minimalism", "Luxury lifestyle", "Fashion", "Grooming", "Home decor", "Productivity", "Time management", "Relationship advice"],
    isViral: true
  },
  {
    name: "Fashion & Beauty",
    icon: "fas fa-tshirt",
    niches: ["Makeup", "Skincare", "Haircare", "Men’s fashion", "Women’s fashion", "Streetwear", "Luxury brands", "Traditional wear", "Beauty hacks", "Perfumes"],
    isMonetizable: true
  },
  {
    name: "Automotive",
    icon: "fas fa-car",
    niches: ["Cars", "Bikes", "EV vehicles", "Vehicle reviews", "Car modification", "Supercars", "Trucking", "Taxi industry", "Automobile news"],
    isMonetizable: true
  },
  {
    name: "Real Estate",
    icon: "fas fa-building",
    niches: ["Property investment", "Commercial property", "Smart homes", "Architecture", "Interior design", "Construction", "Rental income", "Land business"],
    isMonetizable: true
  },
  {
    name: "News & Media",
    icon: "fas fa-newspaper",
    niches: ["Political news", "World news", "Tech news", "Finance news", "Local news", "Investigative journalism", "Fact checking", "Debate shows"],
    isViral: true
  },
  {
    name: "Politics",
    icon: "fas fa-vote-yea",
    niches: ["Election analysis", "Public policy", "Political debates", "Government schemes", "Geopolitics", "International relations", "Political satire"],
    isViral: true
  },
  {
    name: "Science",
    icon: "fas fa-flask",
    niches: ["Space science", "Physics", "Biology", "Chemistry", "Astronomy", "Environmental science", "Medical science", "Innovations"],
    isMonetizable: true
  },
  {
    name: "Spirituality",
    icon: "fas fa-om",
    niches: ["Hinduism", "Islam", "Christianity", "Buddhism", "Meditation", "Astrology", "Motivation quotes", "Mythology", "Temple history"],
    isViral: true
  },
  {
    name: "Agriculture",
    icon: "fas fa-seedling",
    niches: ["Organic farming", "Modern farming", "Dairy farming", "Fish farming", "Poultry", "Tractor tech", "Agri business", "Government subsidies"],
    isMonetizable: true
  },
  {
    name: "Pets & Animals",
    icon: "fas fa-paw",
    niches: ["Dog care", "Cat care", "Exotic pets", "Animal rescue", "Pet training", "Aquarium", "Wildlife"],
    isViral: true
  },
  {
    name: "Kids & Parenting",
    icon: "fas fa-baby",
    niches: ["Parenting tips", "Baby care", "Child psychology", "Educational toys", "Kids learning", "Family activities"],
    isMonetizable: true
  },
  {
    name: "Self Improvement",
    icon: "fas fa-up-long",
    niches: ["Success mindset", "Discipline", "Confidence", "Public speaking", "Communication", "Goal setting", "Life coaching"],
    isMonetizable: true
  },
  {
    name: "Photography",
    icon: "fas fa-camera",
    niches: ["Mobile photography", "DSLR tutorials", "Cinematic editing", "Drone shots", "Color grading", "Filmmaking", "YouTube setup"],
    isMonetizable: true
  },
  {
    name: "Creator Economy",
    icon: "fas fa-users-gear",
    niches: ["Influencer growth", "Instagram growth", "YouTube automation", "Affiliate marketing", "Dropshipping", "Content monetization", "Viral strategy"],
    isMonetizable: true
  },
  {
    name: "AI & Automation",
    icon: "fas fa-robot",
    niches: ["AI SaaS", "AI agents", "Workflow automation", "No-code tools", "AI business models", "AI productivity", "AI customer support"],
    isMonetizable: true
  },
  {
    name: "Regional Content",
    icon: "fas fa-map-location-dot",
    niches: ["Village life", "Regional comedy", "Local news", "Bhojpuri content", "Haryanvi content", "Bengali culture", "Tribal culture"],
    isViral: true
  }
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to database for seeding categories...');
  
  await Category.deleteMany({});
  await Category.insertMany(data);
  
  console.log(`✅ Successfully seeded ${data.length} categories.`);
  process.exit();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});


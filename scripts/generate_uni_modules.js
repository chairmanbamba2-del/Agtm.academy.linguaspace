#!/usr/bin/env node

/**
 * Génère 100 modules UNI pour l'anglais (A1→C2)
 * Usage: node generate_uni_modules.js > uni_modules.json
 */

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const modulesPerLevel = {
  A1: 18,
  A2: 18,
  B1: 17,
  B2: 17,
  C1: 16,
  C2: 14
};

const topicsByLevel = {
  A1: [
    "Greetings & Introductions",
    "Numbers 1-100",
    "Family Members",
    "Food & Drinks",
    "Daily Routine",
    "Colors & Shapes",
    "Weather & Seasons",
    "Clothing",
    "Animals",
    "House & Home",
    "Basic Directions",
    "Time & Dates",
    "Hobbies",
    "Jobs & Occupations",
    "Shopping Basics",
    "Transportation",
    "Health & Body",
    "Countries & Nationalities"
  ],
  A2: [
    "Restaurant Conversations",
    "Travel Planning",
    "Making Appointments",
    "Describing People",
    "Past Simple Tense",
    "Future Plans",
    "Comparatives & Superlatives",
    "Giving Directions",
    "Shopping Dialogues",
    "Health & Symptoms",
    "Work & Routine",
    "Holidays & Celebrations",
    "Technology Basics",
    "Education & School",
    "Entertainment",
    "Social Media",
    "Environment",
    "Cultural Differences"
  ],
  B1: [
    "Workplace Communication",
    "Job Interviews",
    "Narrating Stories",
    "Expressing Opinions",
    "Hypothetical Situations",
    "News & Media",
    "Travel Experiences",
    "Health & Fitness",
    "Technology Trends",
    "Education Systems",
    "Environmental Issues",
    "Social Relationships",
    "Consumer Rights",
    "Cultural Events",
    "Personal Development",
    "Current Affairs",
    "Creative Writing"
  ],
  B2: [
    "Business Meetings",
    "Academic Writing",
    "Debating Skills",
    "Professional Emails",
    "Technical Presentations",
    "Legal Language",
    "Marketing & Advertising",
    "Scientific Concepts",
    "Literary Analysis",
    "Philosophical Discussions",
    "Economic Terms",
    "Political Systems",
    "Advanced Grammar",
    "Idioms & Expressions",
    "Negotiation Skills",
    "Project Management",
    "Leadership Language"
  ],
  C1: [
    "Advanced Negotiations",
    "Academic Research",
    "Legal Contracts",
    "Medical Terminology",
    "Engineering Concepts",
    "Literary Criticism",
    "Philosophical Arguments",
    "Economic Analysis",
    "Political Discourse",
    "Scientific Research",
    "Technical Documentation",
    "Creative Storytelling",
    "Media Analysis",
    "Ethical Dilemmas",
    "Cultural Commentary",
    "Advanced Presentations"
  ],
  C2: [
    "Mastery of Nuance",
    "Subtle Humor & Irony",
    "Advanced Idiomatic Usage",
    "Literary Masterpieces",
    "Academic Publishing",
    "Diplomatic Language",
    "Legal Precedents",
    "Medical Research",
    "Philosophical Treatises",
    "Economic Forecasting",
    "Political Strategy",
    "Scientific Breakthroughs",
    "Art Criticism",
    "Linguistic Analysis"
  ]
};

const descriptionsByLevel = {
  A1: "Learn basic vocabulary and simple phrases for everyday situations.",
  A2: "Build confidence with common expressions and routine conversations.",
  B1: "Develop fluency in discussing familiar topics and personal experiences.",
  B2: "Master complex language for professional and academic contexts.",
  C1: "Achieve advanced proficiency with nuanced expression and abstract ideas.",
  C2: "Attain near-native fluency with sophisticated language and cultural insight."
};

function generateContentText(level, topic) {
  const intro = `## ${topic}\n\nThis ${level}-level lesson focuses on practical language skills for real-world situations.\n\n`;
  
  const sections = [
    "### Key Vocabulary\n- Essential terms and phrases\n- Common expressions\n- Practical examples\n\n",
    "### Grammar Focus\n- Relevant structures\n- Usage examples\n- Practice exercises\n\n",
    "### Real-World Application\n- Dialogues and conversations\n- Listening comprehension\n- Speaking practice\n\n",
    "### Cultural Notes\n- Important context\n- Usage tips\n- Common mistakes to avoid\n\n"
  ];
  
  const conclusion = `> **Learning Tip:** Regular practice with authentic materials will help solidify your ${level}-level skills.`;
  
  return intro + sections.join('') + conclusion;
}

function generateTranscript(level, topic) {
  const words = [
    "Vocabulary", "Grammar", "Expression", "Communication", "Practice",
    "Fluency", "Accuracy", "Comprehension", "Pronunciation", "Interaction"
  ];
  
  let transcript = `LEXIQUE — ${topic}\n\n`;
  for (let i = 1; i <= 10; i++) {
    const word = words[(i - 1) % words.length];
    transcript += `${i}. ${word.toUpperCase()} (n.) — Important concept for ${level} level learners.\n\n`;
  }
  return transcript;
}

function generateModules() {
  const modules = [];
  let globalOrder = 1;
  
  for (const level of levels) {
    const topics = topicsByLevel[level];
    const count = modulesPerLevel[level];
    
    for (let i = 0; i < count && i < topics.length; i++) {
      const topic = topics[i];
      const orderInLevel = i + 1;
      
      modules.push({
        title: topic,
        level: level,
        description: `${descriptionsByLevel[level]} Focus on ${topic.toLowerCase()}.`,
        contentText: generateContentText(level, topic),
        transcript: generateTranscript(level, topic),
        durationMin: level === 'A1' ? 15 : level === 'A2' ? 20 : level === 'B1' ? 25 : level === 'B2' ? 30 : level === 'C1' ? 35 : 40,
        contentType: 'lesson',
        metadata: {
          language: 'en',
          order_num: globalOrder,
          is_published: true
        }
      });
      
      globalOrder++;
    }
  }
  
  return modules;
}

function main() {
  const modules = generateModules();
  
  console.log(JSON.stringify(modules, null, 2));
  
  // Log summary
  console.error('\n📊 Generated modules summary:');
  const byLevel = {};
  modules.forEach(m => {
    byLevel[m.level] = (byLevel[m.level] || 0) + 1;
  });
  
  Object.keys(byLevel).sort().forEach(level => {
    console.error(`   ${level}: ${byLevel[level]} modules`);
  });
  console.error(`   Total: ${modules.length} modules`);
}

// Sous Windows, import.meta.url peut être file:///C:/... tandis que process.argv[1] est C:\...
// Vérifions si ce fichier est le point d'entrée principal
const isMainModule = import.meta.url.startsWith('file://') && 
  (import.meta.url.includes(process.argv[1].replace(/\\/g, '/')) || 
   process.argv[1].includes('generate_uni_modules.js'));

if (isMainModule) {
  main();
}
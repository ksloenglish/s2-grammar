// ============================================================
// GRAMMAR DATA – S2 Grammar Challenge
// Structure: GRAMMAR_DATA[term][topicKey] = { label, icon, iconClass, desc, type, questions[] }
//
// type: "mc" = standard MC (students choose question count)
//       "passage" = passage-based (preset number of blanks, no count choice)
// ============================================================

const GRAMMAR_DATA = {
  "First Term": {
    // No exercises yet — term button will be greyed out
  },
  "Second Term": {
    "relative-clauses": {
      label: "Relative Clauses",
      icon: "\u{1F517}",
      iconClass: "c-blue",
      desc: "who, which, that, whose, where",
      type: "mc",
      questions: [
        {
          question: "The man ___ lives next door is a doctor.",
          options: ["who", "which", "whose", "where"],
          answer: "who"
        },
        {
          question: "This is the book ___ I told you about.",
          options: ["who", "which", "whose", "where"],
          answer: "which"
        },
        {
          question: "She is the teacher ___ class is always full.",
          options: ["who", "which", "whose", "where"],
          answer: "whose"
        },
        {
          question: "That is the park ___ we used to play.",
          options: ["who", "which", "that", "where"],
          answer: "where"
        },
        {
          question: "The film ___ we watched last night was exciting.",
          options: ["who", "which", "whose", "where"],
          answer: "which"
        },
        {
          question: "I know the girl ___ won the prize.",
          options: ["which", "who", "where", "whose"],
          answer: "who"
        },
        {
          question: "The house ___ roof is red belongs to my uncle.",
          options: ["who", "which", "whose", "where"],
          answer: "whose"
        },
        {
          question: "Is this the restaurant ___ you had dinner?",
          options: ["which", "who", "whose", "where"],
          answer: "where"
        },
        {
          question: "The dog ___ is barking belongs to our neighbour.",
          options: ["who", "that", "whose", "where"],
          answer: "that"
        },
        {
          question: "She showed me the letter ___ she had received.",
          options: ["who", "whose", "where", "that"],
          answer: "that"
        }
      ]
    },
    "passive-voice": {
      label: "Passive Voice",
      icon: "\u{1F504}",
      iconClass: "c-amber",
      desc: "Be + past participle",
      type: "mc",
      questions: [
        {
          question: "The cake ___ by my mother every Sunday.",
          options: ["is baked", "bakes", "is baking", "baked"],
          answer: "is baked"
        },
        {
          question: "The window ___ by the storm last night.",
          options: ["broke", "was broken", "is broken", "has broken"],
          answer: "was broken"
        },
        {
          question: "English ___ in many countries around the world.",
          options: ["speaks", "is speaking", "is spoken", "spoke"],
          answer: "is spoken"
        },
        {
          question: "The homework ___ before the deadline tomorrow.",
          options: ["must finish", "must be finished", "must finishing", "must be finishing"],
          answer: "must be finished"
        },
        {
          question: "The new bridge ___ next year.",
          options: ["will build", "will be built", "is building", "builds"],
          answer: "will be built"
        },
        {
          question: "These photos ___ during our trip to Japan.",
          options: ["took", "were taken", "are taking", "have took"],
          answer: "were taken"
        },
        {
          question: "The report ___ by the time you arrive.",
          options: ["will have been completed", "will complete", "is completing", "completes"],
          answer: "will have been completed"
        },
        {
          question: "Many trees ___ in the park every spring.",
          options: ["plant", "are planted", "is planted", "planting"],
          answer: "are planted"
        },
        {
          question: "The suspect ___ by the police yesterday.",
          options: ["arrested", "was arrested", "is arrested", "has arrested"],
          answer: "was arrested"
        },
        {
          question: "This song ___ by millions of people.",
          options: ["loves", "is loved", "loving", "was loving"],
          answer: "is loved"
        }
      ]
    },
    "reported-speech": {
      label: "Reported Speech",
      icon: "\u{1F4AC}",
      iconClass: "c-green",
      desc: "Direct to indirect speech",
      type: "mc",
      questions: [
        {
          question: "She said, \u2018I am tired.\u2019 \u2192 She said that she ___ tired.",
          options: ["is", "was", "has been", "will be"],
          answer: "was"
        },
        {
          question: "He said, \u2018I will help you.\u2019 \u2192 He said that he ___ help me.",
          options: ["will", "would", "can", "shall"],
          answer: "would"
        },
        {
          question: "They said, \u2018We are leaving tomorrow.\u2019 \u2192 They said they ___ leaving the next day.",
          options: ["are", "were", "will be", "have been"],
          answer: "were"
        },
        {
          question: "Tom said, \u2018I have finished my work.\u2019 \u2192 Tom said that he ___ finished his work.",
          options: ["has", "had", "have", "was"],
          answer: "had"
        },
        {
          question: "\u2018I can swim,\u2019 she said. \u2192 She said that she ___ swim.",
          options: ["can", "could", "may", "might"],
          answer: "could"
        },
        {
          question: "He asked, \u2018Where do you live?\u2019 \u2192 He asked me where I ___.",
          options: ["live", "lived", "am living", "have lived"],
          answer: "lived"
        },
        {
          question: "She said, \u2018I went to the cinema yesterday.\u2019 \u2192 She said she ___ to the cinema the day before.",
          options: ["went", "had gone", "has gone", "goes"],
          answer: "had gone"
        },
        {
          question: "Mum said, \u2018Don\u2019t be late!\u2019 \u2192 Mum told me ___ be late.",
          options: ["don\u2019t", "not to", "to not", "didn\u2019t"],
          answer: "not to"
        },
        {
          question: "He asked, \u2018Are you coming?\u2019 \u2192 He asked me ___ I was coming.",
          options: ["that", "if", "what", "do"],
          answer: "if"
        },
        {
          question: "\u2018I must leave now,\u2019 he said. \u2192 He said he ___ leave then.",
          options: ["must", "had to", "has to", "should"],
          answer: "had to"
        }
      ]
    },
    "articles": {
      label: "Nouns With and Without Articles",
      icon: "\u{1F4D6}",
      iconClass: "c-purple",
      desc: "a, an, the, or zero article",
      type: "passage",
      questions: [
        {
          question: "She plays ___ piano every evening.",
          options: ["a", "an", "the", "\u2014"],
          answer: "the"
        },
        {
          question: "He wants to be ___ engineer when he grows up.",
          options: ["a", "an", "the", "\u2014"],
          answer: "an"
        },
        {
          question: "I love ___ chocolate.",
          options: ["a", "an", "the", "\u2014"],
          answer: "\u2014"
        },
        {
          question: "___ sun rises in the east.",
          options: ["A", "An", "The", "\u2014"],
          answer: "The"
        },
        {
          question: "Can you pass me ___ salt, please?",
          options: ["a", "an", "the", "\u2014"],
          answer: "the"
        },
        {
          question: "She goes to ___ school by bus.",
          options: ["a", "an", "the", "\u2014"],
          answer: "\u2014"
        },
        {
          question: "We saw ___ elephant at the zoo.",
          options: ["a", "an", "the", "\u2014"],
          answer: "an"
        },
        {
          question: "___ water is essential for life.",
          options: ["A", "An", "The", "\u2014"],
          answer: "\u2014"
        },
        {
          question: "He is ___ tallest boy in the class.",
          options: ["a", "an", "the", "\u2014"],
          answer: "the"
        },
        {
          question: "I had ___ egg for breakfast.",
          options: ["a", "an", "the", "\u2014"],
          answer: "an"
        }
      ]
    }
  }
};

// Term-to-keys mapping for easy access
const TERM_KEYS = {
  "First Term": Object.keys(GRAMMAR_DATA["First Term"]),
  "Second Term": Object.keys(GRAMMAR_DATA["Second Term"])
};

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
      type: "passage",
      blankType: "input",
      instructions: "Complete the passage with the correct form of the verbs in brackets.",
      // blankType "input": each blank is a text field.
      // A blank object: { prompt: "(verb)", answer: "...", alternatives: [], explanation: "..." }
      // `alternatives` lets additional accepted answers be added per blank in future.
      // The system randomly assigns one exercise each time this topic is played.
      exercises: [
        {
          title: "Green Day Event",
          segments: [
            "Last month, our school held a Green Day event. Normally, the classrooms ",
            { prompt: "(clean)", answer: "are cleaned", alternatives: [], explanation: "Present simple passive: a routine action done to the classrooms every morning." },
            " every morning by the cleaning staff, but on that day, students ",
            { prompt: "(decorate)", answer: "decorated", alternatives: [], explanation: "Active voice (past simple): the students did the action themselves." },
            " them by themselves. A lot of posters ",
            { prompt: "(make)", answer: "were made", alternatives: [], explanation: "Past simple passive: a plural subject (posters) receives the action in the past." },
            " by the art club before the event started. Our teacher told us that plastic bottles should ",
            { prompt: "(not use)", answer: "not be used", alternatives: [], explanation: "Passive with a modal (should): use 'be' + past participle; 'not' goes after the modal." },
            " at school. Also, more trees ",
            { prompt: "(plant)", answer: "will be planted", alternatives: [], explanation: "Future passive: 'will be' + past participle for an action that will happen." },
            " in the future if we want a cleaner environment.\n\nDuring the event, some students picked up rubbish while others ",
            { prompt: "(plant)", answer: "planted", alternatives: [], explanation: "Active voice (past simple): the students performed the action of planting." },
            " flowers in the garden. Snacks ",
            { prompt: "(provide)", answer: "were provided", alternatives: [], explanation: "Past simple passive: a plural subject (snacks) receives the action in the past." },
            " by the canteen because the event lasted all day, but soft drinks ",
            { prompt: "(not allow)", answer: "were not allowed", alternatives: [], explanation: "Past simple passive (negative): a plural subject with 'were not' + past participle." },
            " because the school wanted everyone to be healthy. At noon, a short speech ",
            { prompt: "(give)", answer: "was given", alternatives: [], explanation: "Past simple passive: a singular subject (speech) receives the action in the past." },
            " by the principal, and all students ",
            { prompt: "(listen)", answer: "listened", alternatives: [], explanation: "Active voice (past simple): the students did the listening themselves." },
            " carefully.\n\nAfter the event, the playground was very clean. The rubbish ",
            { prompt: "(put)", answer: "was put", alternatives: [], explanation: "Past simple passive: a singular subject (rubbish) receives the action; 'put' is unchanged as a past participle." },
            " into large bags, and the bags ",
            { prompt: "(send)", answer: "were sent", alternatives: [], explanation: "Past simple passive: a plural subject (bags) receives the action in the past." },
            " to the recycling center later that afternoon. Our class teacher was proud because we ",
            { prompt: "(put)", answer: "put", alternatives: [], explanation: "Active voice (past simple): 'we' performed the action; 'put' is unchanged in the past simple." },
            " a lot of effort into the activity. She says that another Green Day ",
            { prompt: "(hold)", answer: "will be held", alternatives: [], explanation: "Future passive: 'will be' + past participle for a future event." },
            " next year, and even more parents ",
            { prompt: "(invite)", answer: "will be invited", alternatives: [], explanation: "Future passive: 'will be' + past participle; the parents receive the action." },
            " to join."
          ]
        },
        {
          title: "Class Video Channel",
          segments: [
            "Every Friday, short videos ",
            { prompt: "(upload)", answer: "are uploaded", alternatives: [], explanation: "Present simple passive: a routine action; a plural subject (videos) takes 'are' + past participle." },
            " to our class channel. Two weeks ago, Mina suggested a mini-documentary about interesting places in our town. The main idea ",
            { prompt: "(discuss)", answer: "was discussed", alternatives: [], explanation: "Past simple passive: a singular subject (idea) receives the action in the past." },
            " during lunch, and everyone ",
            { prompt: "(give)", answer: "gave", alternatives: [], explanation: "Active voice (past simple): 'everyone' performed the action of giving." },
            " one suggestion. We agreed that private messages should ",
            { prompt: "(not show)", answer: "not be shown", alternatives: [], explanation: "Passive with a modal (should): use 'be' + past participle; 'not' follows the modal." },
            " in the video. Also, students\u2019 faces ",
            { prompt: "(blur)", answer: "will be blurred", alternatives: [], explanation: "Future passive: 'will be' + past participle for an action that may happen later." },
            " in the future if they ask for privacy.\n\nOn Saturday morning, our group met near the old library. Some clips ",
            { prompt: "(film)", answer: "were filmed", alternatives: [], explanation: "Past simple passive: a plural subject (clips) receives the action in the past." },
            " by the river, while Leo ",
            { prompt: "(record)", answer: "recorded", alternatives: [], explanation: "Active voice (past simple): Leo performed the action of recording." },
            " background sounds on his phone. The drone ",
            { prompt: "(not use)", answer: "was not used", alternatives: [], explanation: "Past simple passive (negative): a singular subject with 'was not' + past participle." },
            " because the park was too crowded. Later, all the phones ",
            { prompt: "(charge)", answer: "were charged", alternatives: [], explanation: "Past simple passive: a plural subject (phones) receives the action in the past." },
            " at a caf\u00e9, and Sara ",
            { prompt: "(edit)", answer: "edited", alternatives: [], explanation: "Active voice (past simple): Sara performed the action of editing." },
            " the first part of the video there.\n\nBefore the final version went online, the captions ",
            { prompt: "(add)", answer: "were added", alternatives: [], explanation: "Past simple passive: a plural subject (captions) receives the action in the past." },
            " by Tom, and all the facts ",
            { prompt: "(check)", answer: "were checked", alternatives: [], explanation: "Past simple passive: a plural subject (facts) receives the action in the past." },
            " carefully. By Monday morning, the video ",
            { prompt: "(watch)", answer: "was watched", alternatives: [], explanation: "Past simple passive: a singular subject (video) receives the action in the past." },
            " by hundreds of students. Our teacher says that another episode ",
            { prompt: "(produce)", answer: "will be produced", alternatives: [], explanation: "Future passive: 'will be' + past participle for a future event." },
            " next month, and a behind-the-scenes clip ",
            { prompt: "(share)", answer: "will be shared", alternatives: [], explanation: "Future passive: 'will be' + past participle; the clip receives the action." },
            " on the school website."
          ]
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
      instructions: "Complete the passage with the correct articles. Select \u2018X\u2019 if no article is needed.",
      // Each exercise: title (internal), and `segments` array.
      // A segment is either a plain text string, or a blank object { answer: "..." }.
      // The system randomly assigns one exercise each time this topic is played.
      exercises: [
        {
          title: "A Day at the Beach",
          segments: [
            "Last Saturday, my family and I went to ",
            { answer: "the" },
            " only beach near our home. It was ",
            { answer: "a" },
            " sunny day, so many people were swimming in ",
            { answer: "the" },
            " sea. My sister wanted to build ",
            { answer: "a" },
            " sandcastle, while I looked for shells on ",
            { answer: "the" },
            " sand.\n\nAfter that, we had ",
            { answer: "X" },
            " lunch at ",
            { answer: "a" },
            " small restaurant near the beach. My father ordered ",
            { answer: "a" },
            " plate of fish and chips, and my mother had ",
            { answer: "a" },
            " bowl of salad. I chose ",
            { answer: "a" },
            " glass of orange juice and ",
            { answer: "a" },
            " hamburger. The waiter at the restaurant was very friendly, and he gave us ",
            { answer: "a" },
            " useful map of the area.\n\nIn the afternoon, we went for a walk in ",
            { answer: "the" },
            " only park beside the beach. We saw children flying kites and feeding ",
            { answer: "X" },
            " hungry birds. Before going home, we took ",
            { answer: "X" },
            " beautiful photos of the view. It was ",
            { answer: "an" },
            " enjoyable day for everyone."
          ]
        },
        {
          title: "A School Trip to Europe",
          segments: [
            "Last winter, my cousins and I went on ",
            { answer: "a" },
            " school trip to ",
            { answer: "the" },
            " Netherlands. Before we left, our teacher gave us ",
            { answer: "a" },
            " useful booklet about the places we would visit. On the first day, we stayed at ",
            { answer: "the" },
            " only Hilton Hotel near the city centre. After lunch, we visited ",
            { answer: "the" },
            " Rijksmuseum, where we saw ",
            { answer: "an" },
            " amazing painting by Rembrandt.\n\nThe next morning, our guide told us that ",
            { answer: "X" },
            " Europe has many famous rivers, and he showed us pictures of ",
            { answer: "the" },
            " Rhine. Later, we travelled south and learned about ",
            { answer: "the" },
            " Alps and ",
            { answer: "X" },
            " Mont Blanc. During the trip, we visited ",
            { answer: "a" },
            " university called Erasmus University Rotterdam. Some students thought Mont Blanc was in ",
            { answer: "the" },
            " United States, but of course it is not.\n\nOn the last day, we wrote ",
            { answer: "a" },
            " short report in our notebooks before leaving ",
            { answer: "the" },
            " hotel. At the airport, I bought ",
            { answer: "an" },
            " umbrella and ",
            { answer: "a" },
            " box of chocolates for my family."
          ]
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

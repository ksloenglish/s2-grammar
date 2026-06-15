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
      desc: "who, which, whose, when, where",
      type: "builder",
      // 3-step sentence builder. 3 marks per question:
      //   Step 1 (pronoun): pick the correct relative pronoun.
      //   Step 2 (clause):  tap word-tiles in order to build the relative clause.
      //                     The repeated word/phrase is added as a distractor that must NOT be used.
      //   Step 3 (place):   tap the gap in sentence 1 where the clause belongs.
      // No repeats within an exercise; the app draws unique questions at random.
      instructions: "Combine the two sentences into one using a relative clause. Choose the relative pronoun, build the clause, then place it correctly.",
      pronouns: ["who", "which", "whose", "when", "where"],
      questions: [
        { s1: "I like Ms Lo.", s2: "Her designs are casual but stylish.", pronoun: "whose", clause: ["designs", "are", "casual", "but", "stylish"], distractor: "Her", slots: ["I like Ms Lo"], correctGap: 0, combined: "I like Ms Lo, whose designs are casual but stylish." },
        { s1: "Yesterday, we visited a museum.", s2: "It has a collection of rare coins.", pronoun: "which", clause: ["has", "a", "collection", "of", "rare", "coins"], distractor: "It", slots: ["Yesterday, we visited a museum"], correctGap: 0, combined: "Yesterday, we visited a museum which has a collection of rare coins." },
        { s1: "The boy is my cousin.", s2: "He won the science competition.", pronoun: "who", clause: ["won", "the", "science", "competition"], distractor: "He", slots: ["The boy", "is my cousin."], correctGap: 0, combined: "The boy who won the science competition is my cousin." },
        { s1: "I know a girl.", s2: "Her father is a famous chef.", pronoun: "whose", clause: ["father", "is", "a", "famous", "chef"], distractor: "Her", slots: ["I know a girl"], correctGap: 0, combined: "I know a girl whose father is a famous chef." },
        { s1: "This is the park.", s2: "We first met there.", pronoun: "where", clause: ["we", "first", "met"], distractor: "there", slots: ["This is the park"], correctGap: 0, combined: "This is the park where we first met." },
        { s1: "The laptop is very expensive.", s2: "It was stolen from the office.", pronoun: "which", clause: ["was", "stolen", "from", "the", "office"], distractor: "It", slots: ["The laptop", "is very expensive."], correctGap: 0, combined: "The laptop which was stolen from the office is very expensive." },
        { s1: "My uncle lives in Bangkok.", s2: "He is a doctor.", pronoun: "who", clause: ["is", "a", "doctor"], distractor: "He", slots: ["My uncle", "lives in Bangkok."], correctGap: 0, combined: "My uncle, who is a doctor, lives in Bangkok." },
        { s1: "They stayed at a hotel.", s2: "The hotel was close to the beach.", pronoun: "which", clause: ["was", "close", "to", "the", "beach"], distractor: "The hotel", slots: ["They stayed at a hotel"], correctGap: 0, combined: "They stayed at a hotel which was close to the beach." },
        { s1: "The woman teaches us English.", s2: "Her daughter studies at my school.", pronoun: "whose", clause: ["daughter", "studies", "at", "my", "school"], distractor: "Her", slots: ["The woman", "teaches us English."], correctGap: 0, combined: "The woman whose daughter studies at my school teaches us English." },
        { s1: "Summer is the season.", s2: "Many people travel then.", pronoun: "when", clause: ["many", "people", "travel"], distractor: "then", slots: ["Summer is the season"], correctGap: 0, combined: "Summer is the season when many people travel." },
        { s1: "My dad took me to visit a village.", s2: "My grandfather grew up there.", pronoun: "where", clause: ["my", "grandfather", "grew", "up"], distractor: "there", slots: ["My dad took me to visit a village"], correctGap: 0, combined: "My dad took me to visit a village where my grandfather grew up." },
        { s1: "The girl is the captain of our basketball team.", s2: "She scored the final point.", pronoun: "who", clause: ["scored", "the", "final", "point"], distractor: "She", slots: ["The girl", "is the captain of our basketball team."], correctGap: 0, combined: "The girl who scored the final point is the captain of our basketball team." },
        { s1: "Last Friday, we joined a workshop.", s2: "It taught students how to make short videos.", pronoun: "which", clause: ["taught", "students", "how", "to", "make", "short", "videos"], distractor: "It", slots: ["Last Friday, we joined a workshop"], correctGap: 0, combined: "Last Friday, we joined a workshop which taught students how to make short videos." },
        { s1: "This is the café.", s2: "My friends and I often study there after school.", pronoun: "where", clause: ["my", "friends", "and", "I", "often", "study", "after", "school"], distractor: "there", slots: ["This is the café"], correctGap: 0, combined: "This is the café where my friends and I often study after school." },
        { s1: "I borrowed a comic book from Leo.", s2: "Its cover was designed by a local artist.", pronoun: "whose", clause: ["cover", "was", "designed", "by", "a", "local", "artist"], distractor: "Its", slots: ["I borrowed a comic book", "from Leo."], correctGap: 0, combined: "I borrowed a comic book whose cover was designed by a local artist from Leo." },
        { s1: "The teacher gave a prize to the student.", s2: "The student's robot cleaned the classroom floor.", pronoun: "whose", clause: ["robot", "cleaned", "the", "classroom", "floor"], distractor: "The student's", slots: ["The teacher gave a prize to the student"], correctGap: 0, combined: "The teacher gave a prize to the student whose robot cleaned the classroom floor." },
        { s1: "April is the month.", s2: "Our school usually holds its music festival then.", pronoun: "when", clause: ["our", "school", "usually", "holds", "its", "music", "festival"], distractor: "then", slots: ["April is the month"], correctGap: 0, combined: "April is the month when our school usually holds its music festival." },
        { s1: "My sister follows a blogger.", s2: "Her travel photos are very creative.", pronoun: "whose", clause: ["travel", "photos", "are", "very", "creative"], distractor: "Her", slots: ["My sister follows a blogger"], correctGap: 0, combined: "My sister follows a blogger whose travel photos are very creative." },
        { s1: "The headphones are mine.", s2: "They were left in the computer room.", pronoun: "which", clause: ["were", "left", "in", "the", "computer", "room"], distractor: "They", slots: ["The headphones", "are mine."], correctGap: 0, combined: "The headphones which were left in the computer room are mine." },
        { s1: "At the sports day, we met a photographer.", s2: "He works for a popular online magazine.", pronoun: "who", clause: ["works", "for", "a", "popular", "online", "magazine"], distractor: "He", slots: ["At the sports day, we met a photographer"], correctGap: 0, combined: "At the sports day, we met a photographer who works for a popular online magazine." },
        { s1: "They chose a quiet library.", s2: "The library had comfortable reading corners.", pronoun: "which", clause: ["had", "comfortable", "reading", "corners"], distractor: "The library", slots: ["They chose a quiet library"], correctGap: 0, combined: "They chose a quiet library which had comfortable reading corners." },
        { s1: "The coach introduced us to a new player.", s2: "The new player moved here from Canada.", pronoun: "who", clause: ["moved", "here", "from", "Canada"], distractor: "The new player", slots: ["The coach introduced us to a new player"], correctGap: 0, combined: "The coach introduced us to a new player who moved here from Canada." },
        { s1: "Yesterday, I downloaded a puzzle game.", s2: "It helps players practise problem-solving.", pronoun: "which", clause: ["helps", "players", "practise", "problem-solving"], distractor: "It", slots: ["Yesterday, I downloaded a puzzle game"], correctGap: 0, combined: "Yesterday, I downloaded a puzzle game which helps players practise problem-solving." },
        { s1: "The boy is in my coding club.", s2: "His app won first prize.", pronoun: "whose", clause: ["app", "won", "first", "prize"], distractor: "His", slots: ["The boy", "is in my coding club."], correctGap: 0, combined: "The boy whose app won first prize is in my coding club." },
        { s1: "We watched a livestream on Saturday.", s2: "A famous gamer answered questions then.", pronoun: "when", clause: ["a", "famous", "gamer", "answered", "questions"], distractor: "then", slots: ["We watched a livestream on Saturday"], correctGap: 0, combined: "We watched a livestream on Saturday, when a famous gamer answered questions." },
        { s1: "This is the room.", s2: "Our team practises e-sports there.", pronoun: "where", clause: ["our", "team", "practises", "e-sports"], distractor: "there", slots: ["This is the room"], correctGap: 0, combined: "This is the room where our team practises e-sports." },
        { s1: "Mia invited a friend to the tournament.", s2: "The friend had just moved to our school.", pronoun: "who", clause: ["had", "just", "moved", "to", "our", "school"], distractor: "The friend", slots: ["Mia invited a friend", "to the tournament."], correctGap: 0, combined: "Mia invited a friend who had just moved to our school to the tournament." },
        { s1: "The tablet belongs to my brother.", s2: "It was repaired last week.", pronoun: "which", clause: ["was", "repaired", "last", "week"], distractor: "It", slots: ["The tablet", "belongs to my brother."], correctGap: 0, combined: "The tablet which was repaired last week belongs to my brother." },
        { s1: "On social media, I follow an artist.", s2: "Her drawings are used in many mobile games.", pronoun: "whose", clause: ["drawings", "are", "used", "in", "many", "mobile", "games"], distractor: "Her", slots: ["On social media, I follow an artist"], correctGap: 0, combined: "On social media, I follow an artist whose drawings are used in many mobile games." },
        { s1: "The café has free Wi-Fi.", s2: "Many students meet there after lessons.", pronoun: "where", clause: ["many", "students", "meet", "after", "lessons"], distractor: "there", slots: ["The café", "has free Wi-Fi."], correctGap: 0, combined: "The café where many students meet after lessons has free Wi-Fi." },
        { s1: "The girl helped me fix my controller.", s2: "She sits next to me in maths class.", pronoun: "who", clause: ["sits", "next", "to", "me", "in", "maths", "class"], distractor: "She", slots: ["The girl", "helped me fix my controller."], correctGap: 0, combined: "The girl who helped me fix my controller sits next to me in maths class." },
        { s1: "December is the time of year.", s2: "Many gaming companies release new updates then.", pronoun: "when", clause: ["many", "gaming", "companies", "release", "new", "updates"], distractor: "then", slots: ["December is the time of year"], correctGap: 0, combined: "December is the time of year when many gaming companies release new updates." },
        { s1: "Our teacher showed us a website.", s2: "It explains how to stay safe online.", pronoun: "which", clause: ["explains", "how", "to", "stay", "safe", "online"], distractor: "It", slots: ["Our teacher showed us a website"], correctGap: 0, combined: "Our teacher showed us a website which explains how to stay safe online." },
        { s1: "After the race, the coach praised a runner.", s2: "The runner had trained every morning.", pronoun: "who", clause: ["had", "trained", "every", "morning"], distractor: "The runner", slots: ["After the race, the coach praised a runner"], correctGap: 0, combined: "After the race, the coach praised a runner who had trained every morning." },
        { s1: "Last month, we visited a stadium.", s2: "It can hold fifty thousand fans.", pronoun: "which", clause: ["can", "hold", "fifty", "thousand", "fans"], distractor: "It", slots: ["Last month, we visited a stadium"], correctGap: 0, combined: "Last month, we visited a stadium which can hold fifty thousand fans." },
        { s1: "This is the gym.", s2: "Our volleyball team practises there.", pronoun: "where", clause: ["our", "volleyball", "team", "practises"], distractor: "there", slots: ["This is the gym"], correctGap: 0, combined: "This is the gym where our volleyball team practises." },
        { s1: "At the competition, I met a swimmer.", s2: "Her brother is an Olympic athlete.", pronoun: "whose", clause: ["brother", "is", "an", "Olympic", "athlete"], distractor: "Her", slots: ["At the competition, I met a swimmer"], correctGap: 0, combined: "At the competition, I met a swimmer whose brother is an Olympic athlete." },
        { s1: "The bicycle is too small for me now.", s2: "It was a birthday present from my parents.", pronoun: "which", clause: ["was", "a", "birthday", "present", "from", "my", "parents"], distractor: "It", slots: ["The bicycle", "is too small for me now."], correctGap: 0, combined: "The bicycle which was a birthday present from my parents is too small for me now." },
        { s1: "Saturday is the day.", s2: "Our school usually has football practice then.", pronoun: "when", clause: ["our", "school", "usually", "has", "football", "practice"], distractor: "then", slots: ["Saturday is the day"], correctGap: 0, combined: "Saturday is the day when our school usually has football practice." },
        { s1: "The student helped me stretch properly.", s2: "He is also in my science class.", pronoun: "who", clause: ["is", "also", "in", "my", "science", "class"], distractor: "He", slots: ["The student", "helped me stretch properly."], correctGap: 0, combined: "The student who helped me stretch properly is also in my science class." },
        { s1: "They bought sports shoes from a shop.", s2: "The shop offers discounts to students.", pronoun: "which", clause: ["offers", "discounts", "to", "students"], distractor: "The shop", slots: ["They bought sports shoes from a shop"], correctGap: 0, combined: "They bought sports shoes from a shop which offers discounts to students." },
        { s1: "My cousin joined a fitness club.", s2: "Its trainers are very friendly.", pronoun: "whose", clause: ["trainers", "are", "very", "friendly"], distractor: "Its", slots: ["My cousin joined a fitness club"], correctGap: 0, combined: "My cousin joined a fitness club whose trainers are very friendly." },
        { s1: "The field was closed for repairs.", s2: "We played our first match there.", pronoun: "where", clause: ["we", "played", "our", "first", "match"], distractor: "there", slots: ["The field", "was closed for repairs."], correctGap: 0, combined: "The field where we played our first match was closed for repairs." },
        { s1: "The girl won a gold medal.", s2: "Her team practised in the rain for weeks.", pronoun: "whose", clause: ["team", "practised", "in", "the", "rain", "for", "weeks"], distractor: "Her", slots: ["The girl", "won a gold medal."], correctGap: 0, combined: "The girl whose team practised in the rain for weeks won a gold medal." },
        { s1: "Last night, I watched a school band.", s2: "It played three original songs.", pronoun: "which", clause: ["played", "three", "original", "songs"], distractor: "It", slots: ["Last night, I watched a school band"], correctGap: 0, combined: "Last night, I watched a school band which played three original songs." },
        { s1: "The singer is in my art class.", s2: "Her voice won the audience's attention.", pronoun: "whose", clause: ["voice", "won", "the", "audience's", "attention"], distractor: "Her", slots: ["The singer", "is in my art class."], correctGap: 0, combined: "The singer whose voice won the audience's attention is in my art class." },
        { s1: "This is the hall.", s2: "We had our drama rehearsal there.", pronoun: "where", clause: ["we", "had", "our", "drama", "rehearsal"], distractor: "there", slots: ["This is the hall"], correctGap: 0, combined: "This is the hall where we had our drama rehearsal." },
        { s1: "The student forgot his guitar at school.", s2: "He performed first in the concert.", pronoun: "who", clause: ["performed", "first", "in", "the", "concert"], distractor: "He", slots: ["The student", "forgot his guitar at school."], correctGap: 0, combined: "The student who performed first in the concert forgot his guitar at school." },
        { s1: "June is the month.", s2: "Our class usually prepares for the talent show then.", pronoun: "when", clause: ["our", "class", "usually", "prepares", "for", "the", "talent", "show"], distractor: "then", slots: ["June is the month"], correctGap: 0, combined: "June is the month when our class usually prepares for the talent show." },
        { s1: "My brother bought a keyboard.", s2: "It connects easily to a laptop.", pronoun: "which", clause: ["connects", "easily", "to", "a", "laptop"], distractor: "It", slots: ["My brother bought a keyboard"], correctGap: 0, combined: "My brother bought a keyboard which connects easily to a laptop." },
        { s1: "We met a dancer after the show.", s2: "Her costume was made from recycled materials.", pronoun: "whose", clause: ["costume", "was", "made", "from", "recycled", "materials"], distractor: "Her", slots: ["We met a dancer", "after the show."], correctGap: 0, combined: "After the show, we met a dancer whose costume was made from recycled materials." },
        { s1: "The teacher introduced us to a composer.", s2: "The composer writes music for films.", pronoun: "who", clause: ["writes", "music", "for", "films"], distractor: "The composer", slots: ["The teacher introduced us to a composer"], correctGap: 0, combined: "The teacher introduced us to a composer who writes music for films." },
        { s1: "They practised in a small studio.", s2: "The studio was near the bus stop.", pronoun: "which", clause: ["was", "near", "the", "bus", "stop"], distractor: "The studio", slots: ["They practised in a small studio"], correctGap: 0, combined: "They practised in a small studio which was near the bus stop." },
        { s1: "The microphone stopped working during the song.", s2: "It had been borrowed from the music room.", pronoun: "which", clause: ["had", "been", "borrowed", "from", "the", "music", "room"], distractor: "It", slots: ["The microphone", "stopped working during the song."], correctGap: 0, combined: "The microphone which had been borrowed from the music room stopped working during the song." },
        { s1: "I thanked the classmate.", s2: "The classmate's playlist helped us choose the final song.", pronoun: "whose", clause: ["playlist", "helped", "us", "choose", "the", "final", "song"], distractor: "The classmate's", slots: ["I thanked the classmate"], correctGap: 0, combined: "I thanked the classmate whose playlist helped us choose the final song." }
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

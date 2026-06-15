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
        {"s1":"I like Ms Lo.","s2":"Her designs are casual but stylish.","pronoun":"whose","clause":["designs","are","casual","but","stylish"],"distractor":"Her","segs":["I","like Ms Lo."],"correctGap":1,"combined":"I like Ms Lo, whose designs are casual but stylish."},
        {"s1":"Yesterday, we visited a museum.","s2":"It has a collection of rare coins.","pronoun":"which","clause":["has","a","collection","of","rare","coins"],"distractor":"It","segs":["Yesterday, we","visited a museum."],"correctGap":1,"combined":"Yesterday, we visited a museum which has a collection of rare coins."},
        {"s1":"The boy is my cousin.","s2":"He won the science competition.","pronoun":"who","clause":["won","the","science","competition"],"distractor":"He","segs":["The boy","is my cousin."],"correctGap":0,"combined":"The boy who won the science competition is my cousin."},
        {"s1":"I know a girl.","s2":"Her father is a famous chef.","pronoun":"whose","clause":["father","is","a","famous","chef"],"distractor":"Her","segs":["I","know a girl."],"correctGap":1,"combined":"I know a girl whose father is a famous chef."},
        {"s1":"This is the park.","s2":"We first met there.","pronoun":"where","clause":["we","first","met"],"distractor":"there","segs":["This","is the park."],"correctGap":1,"combined":"This is the park where we first met."},
        {"s1":"The laptop is very expensive.","s2":"It was stolen from the office.","pronoun":"which","clause":["was","stolen","from","the","office"],"distractor":"It","segs":["The laptop","is very expensive."],"correctGap":0,"combined":"The laptop which was stolen from the office is very expensive."},
        {"s1":"My uncle lives in Bangkok.","s2":"He is a doctor.","pronoun":"who","clause":["is","a","doctor"],"distractor":"He","segs":["My uncle","lives in Bangkok."],"correctGap":0,"combined":"My uncle, who is a doctor, lives in Bangkok."},
        {"s1":"They stayed at a hotel.","s2":"The hotel was close to the beach.","pronoun":"which","clause":["was","close","to","the","beach"],"distractor":"The hotel","segs":["They","stayed at a hotel."],"correctGap":1,"combined":"They stayed at a hotel which was close to the beach."},
        {"s1":"The woman teaches us English.","s2":"Her daughter studies at my school.","pronoun":"whose","clause":["daughter","studies","at","my","school"],"distractor":"Her","segs":["The woman","teaches us English."],"correctGap":0,"combined":"The woman whose daughter studies at my school teaches us English."},
        {"s1":"Summer is the season.","s2":"Many people travel then.","pronoun":"when","clause":["many","people","travel"],"distractor":"then","segs":["Summer","is the season."],"correctGap":1,"combined":"Summer is the season when many people travel."},
        {"s1":"My dad took me to visit a village.","s2":"My grandfather grew up there.","pronoun":"where","clause":["my","grandfather","grew","up"],"distractor":"there","segs":["My dad","took me to visit a village."],"correctGap":1,"combined":"My dad took me to visit a village where my grandfather grew up."},
        {"s1":"The girl is the captain of our basketball team.","s2":"She scored the final point.","pronoun":"who","clause":["scored","the","final","point"],"distractor":"She","segs":["The girl","is the captain of our basketball team."],"correctGap":0,"combined":"The girl who scored the final point is the captain of our basketball team."},
        {"s1":"Last Friday, we joined a workshop.","s2":"It taught students how to make short videos.","pronoun":"which","clause":["taught","students","how","to","make","short","videos"],"distractor":"It","segs":["Last Friday, we","joined a workshop."],"correctGap":1,"combined":"Last Friday, we joined a workshop which taught students how to make short videos."},
        {"s1":"This is the café.","s2":"My friends and I often study there after school.","pronoun":"where","clause":["my","friends","and","I","often","study","after","school"],"distractor":"there","segs":["This","is the café."],"correctGap":1,"combined":"This is the café where my friends and I often study after school."},
        {"s1":"I borrowed a comic book from Leo.","s2":"Its cover was designed by a local artist.","pronoun":"whose","clause":["cover","was","designed","by","a","local","artist"],"distractor":"Its","segs":["I borrowed a comic book","from Leo."],"correctGap":0,"combined":"I borrowed a comic book whose cover was designed by a local artist from Leo."},
        {"s1":"The teacher gave a prize to the student.","s2":"The student's robot cleaned the classroom floor.","pronoun":"whose","clause":["robot","cleaned","the","classroom","floor"],"distractor":"The student's","segs":["The teacher gave a prize","to the student."],"correctGap":1,"combined":"The teacher gave a prize to the student whose robot cleaned the classroom floor."},
        {"s1":"April is the month.","s2":"Our school usually holds its music festival then.","pronoun":"when","clause":["our","school","usually","holds","its","music","festival"],"distractor":"then","segs":["April","is the month."],"correctGap":1,"combined":"April is the month when our school usually holds its music festival."},
        {"s1":"My sister follows a blogger.","s2":"Her travel photos are very creative.","pronoun":"whose","clause":["travel","photos","are","very","creative"],"distractor":"Her","segs":["My sister","follows a blogger."],"correctGap":1,"combined":"My sister follows a blogger whose travel photos are very creative."},
        {"s1":"The headphones are mine.","s2":"They were left in the computer room.","pronoun":"which","clause":["were","left","in","the","computer","room"],"distractor":"They","segs":["The headphones","are mine."],"correctGap":0,"combined":"The headphones which were left in the computer room are mine."},
        {"s1":"At the sports day, we met a photographer.","s2":"He works for a popular online magazine.","pronoun":"who","clause":["works","for","a","popular","online","magazine"],"distractor":"He","segs":["At the sports day, we","met a photographer."],"correctGap":1,"combined":"At the sports day, we met a photographer who works for a popular online magazine."},
        {"s1":"They chose a quiet library.","s2":"The library had comfortable reading corners.","pronoun":"which","clause":["had","comfortable","reading","corners"],"distractor":"The library","segs":["They","chose a quiet library."],"correctGap":1,"combined":"They chose a quiet library which had comfortable reading corners."},
        {"s1":"The coach introduced us to a new player.","s2":"The new player moved here from Canada.","pronoun":"who","clause":["moved","here","from","Canada"],"distractor":"The new player","segs":["The coach","introduced us to a new player."],"correctGap":1,"combined":"The coach introduced us to a new player who moved here from Canada."},
        {"s1":"Yesterday, I downloaded a puzzle game.","s2":"It helps players practise problem-solving.","pronoun":"which","clause":["helps","players","practise","problem-solving"],"distractor":"It","segs":["Yesterday, I","downloaded a puzzle game."],"correctGap":1,"combined":"Yesterday, I downloaded a puzzle game which helps players practise problem-solving."},
        {"s1":"The boy is in my coding club.","s2":"His app won first prize.","pronoun":"whose","clause":["app","won","first","prize"],"distractor":"His","segs":["The boy","is in my coding club."],"correctGap":0,"combined":"The boy whose app won first prize is in my coding club."},
        {"s1":"We watched a livestream on Saturday.","s2":"A famous gamer answered questions then.","pronoun":"when","clause":["a","famous","gamer","answered","questions"],"distractor":"then","segs":["We watched a livestream","on Saturday."],"correctGap":1,"combined":"We watched a livestream on Saturday, when a famous gamer answered questions."},
        {"s1":"This is the room.","s2":"Our team practises e-sports there.","pronoun":"where","clause":["our","team","practises","e-sports"],"distractor":"there","segs":["This","is the room."],"correctGap":1,"combined":"This is the room where our team practises e-sports."},
        {"s1":"Mia invited a friend to the tournament.","s2":"The friend had just moved to our school.","pronoun":"who","clause":["had","just","moved","to","our","school"],"distractor":"The friend","segs":["Mia invited a friend","to the tournament."],"correctGap":0,"combined":"Mia invited a friend who had just moved to our school to the tournament."},
        {"s1":"The tablet belongs to my brother.","s2":"It was repaired last week.","pronoun":"which","clause":["was","repaired","last","week"],"distractor":"It","segs":["The tablet","belongs to my brother."],"correctGap":0,"combined":"The tablet which was repaired last week belongs to my brother."},
        {"s1":"On social media, I follow an artist.","s2":"Her drawings are used in many mobile games.","pronoun":"whose","clause":["drawings","are","used","in","many","mobile","games"],"distractor":"Her","segs":["On social media, I","follow an artist."],"correctGap":1,"combined":"On social media, I follow an artist whose drawings are used in many mobile games."},
        {"s1":"The café has free Wi-Fi.","s2":"Many students meet there after lessons.","pronoun":"where","clause":["many","students","meet","after","lessons"],"distractor":"there","segs":["The café","has free Wi-Fi."],"correctGap":0,"combined":"The café where many students meet after lessons has free Wi-Fi."},
        {"s1":"The girl helped me fix my controller.","s2":"She sits next to me in maths class.","pronoun":"who","clause":["sits","next","to","me","in","maths","class"],"distractor":"She","segs":["The girl","helped me fix my controller."],"correctGap":0,"combined":"The girl who helped me fix my controller sits next to me in maths class."},
        {"s1":"December is the time of year.","s2":"Many gaming companies release new updates then.","pronoun":"when","clause":["many","gaming","companies","release","new","updates"],"distractor":"then","segs":["December","is the time of year."],"correctGap":1,"combined":"December is the time of year when many gaming companies release new updates."},
        {"s1":"Our teacher showed us a website.","s2":"It explains how to stay safe online.","pronoun":"which","clause":["explains","how","to","stay","safe","online"],"distractor":"It","segs":["Our teacher","showed us a website."],"correctGap":1,"combined":"Our teacher showed us a website which explains how to stay safe online."},
        {"s1":"After the race, the coach praised a runner.","s2":"The runner had trained every morning.","pronoun":"who","clause":["had","trained","every","morning"],"distractor":"The runner","segs":["After the race, the coach","praised a runner."],"correctGap":1,"combined":"After the race, the coach praised a runner who had trained every morning."},
        {"s1":"Last month, we visited a stadium.","s2":"It can hold fifty thousand fans.","pronoun":"which","clause":["can","hold","fifty","thousand","fans"],"distractor":"It","segs":["Last month, we","visited a stadium."],"correctGap":1,"combined":"Last month, we visited a stadium which can hold fifty thousand fans."},
        {"s1":"This is the gym.","s2":"Our volleyball team practises there.","pronoun":"where","clause":["our","volleyball","team","practises"],"distractor":"there","segs":["This","is the gym."],"correctGap":1,"combined":"This is the gym where our volleyball team practises."},
        {"s1":"At the competition, I met a swimmer.","s2":"Her brother is an Olympic athlete.","pronoun":"whose","clause":["brother","is","an","Olympic","athlete"],"distractor":"Her","segs":["At the competition, I","met a swimmer."],"correctGap":1,"combined":"At the competition, I met a swimmer whose brother is an Olympic athlete."},
        {"s1":"The bicycle is too small for me now.","s2":"It was a birthday present from my parents.","pronoun":"which","clause":["was","a","birthday","present","from","my","parents"],"distractor":"It","segs":["The bicycle","is too small for me now."],"correctGap":0,"combined":"The bicycle which was a birthday present from my parents is too small for me now."},
        {"s1":"Saturday is the day.","s2":"Our school usually has football practice then.","pronoun":"when","clause":["our","school","usually","has","football","practice"],"distractor":"then","segs":["Saturday","is the day."],"correctGap":1,"combined":"Saturday is the day when our school usually has football practice."},
        {"s1":"The student helped me stretch properly.","s2":"He is also in my science class.","pronoun":"who","clause":["is","also","in","my","science","class"],"distractor":"He","segs":["The student","helped me stretch properly."],"correctGap":0,"combined":"The student who helped me stretch properly is also in my science class."},
        {"s1":"They bought sports shoes from a shop.","s2":"The shop offers discounts to students.","pronoun":"which","clause":["offers","discounts","to","students"],"distractor":"The shop","segs":["They bought sports shoes","from a shop."],"correctGap":1,"combined":"They bought sports shoes from a shop which offers discounts to students."},
        {"s1":"My cousin joined a fitness club.","s2":"Its trainers are very friendly.","pronoun":"whose","clause":["trainers","are","very","friendly"],"distractor":"Its","segs":["My cousin","joined a fitness club."],"correctGap":1,"combined":"My cousin joined a fitness club whose trainers are very friendly."},
        {"s1":"The field was closed for repairs.","s2":"We played our first match there.","pronoun":"where","clause":["we","played","our","first","match"],"distractor":"there","segs":["The field","was closed for repairs."],"correctGap":0,"combined":"The field where we played our first match was closed for repairs."},
        {"s1":"The girl won a gold medal.","s2":"Her team practised in the rain for weeks.","pronoun":"whose","clause":["team","practised","in","the","rain","for","weeks"],"distractor":"Her","segs":["The girl","won a gold medal."],"correctGap":0,"combined":"The girl whose team practised in the rain for weeks won a gold medal."},
        {"s1":"Last night, I watched a school band.","s2":"It played three original songs.","pronoun":"which","clause":["played","three","original","songs"],"distractor":"It","segs":["Last night, I","watched a school band."],"correctGap":1,"combined":"Last night, I watched a school band which played three original songs."},
        {"s1":"The singer is in my art class.","s2":"Her voice won the audience's attention.","pronoun":"whose","clause":["voice","won","the","audience's","attention"],"distractor":"Her","segs":["The singer","is in my art class."],"correctGap":0,"combined":"The singer whose voice won the audience's attention is in my art class."},
        {"s1":"This is the hall.","s2":"We had our drama rehearsal there.","pronoun":"where","clause":["we","had","our","drama","rehearsal"],"distractor":"there","segs":["This","is the hall."],"correctGap":1,"combined":"This is the hall where we had our drama rehearsal."},
        {"s1":"The student forgot his guitar at school.","s2":"He performed first in the concert.","pronoun":"who","clause":["performed","first","in","the","concert"],"distractor":"He","segs":["The student","forgot his guitar at school."],"correctGap":0,"combined":"The student who performed first in the concert forgot his guitar at school."},
        {"s1":"June is the month.","s2":"Our class usually prepares for the talent show then.","pronoun":"when","clause":["our","class","usually","prepares","for","the","talent","show"],"distractor":"then","segs":["June","is the month."],"correctGap":1,"combined":"June is the month when our class usually prepares for the talent show."},
        {"s1":"My brother bought a keyboard.","s2":"It connects easily to a laptop.","pronoun":"which","clause":["connects","easily","to","a","laptop"],"distractor":"It","segs":["My brother","bought a keyboard."],"correctGap":1,"combined":"My brother bought a keyboard which connects easily to a laptop."},
        {"s1":"We met a dancer after the show.","s2":"Her costume was made from recycled materials.","pronoun":"whose","clause":["costume","was","made","from","recycled","materials"],"distractor":"Her","segs":["We met a dancer","after the show."],"correctGap":0,"combined":"After the show, we met a dancer whose costume was made from recycled materials."},
        {"s1":"The teacher introduced us to a composer.","s2":"The composer writes music for films.","pronoun":"who","clause":["writes","music","for","films"],"distractor":"The composer","segs":["The teacher","introduced us to a composer."],"correctGap":1,"combined":"The teacher introduced us to a composer who writes music for films."},
        {"s1":"They practised in a small studio.","s2":"The studio was near the bus stop.","pronoun":"which","clause":["was","near","the","bus","stop"],"distractor":"The studio","segs":["They","practised in a small studio."],"correctGap":1,"combined":"They practised in a small studio which was near the bus stop."},
        {"s1":"The microphone stopped working during the song.","s2":"It had been borrowed from the music room.","pronoun":"which","clause":["had","been","borrowed","from","the","music","room"],"distractor":"It","segs":["The microphone","stopped working during the song."],"correctGap":0,"combined":"The microphone which had been borrowed from the music room stopped working during the song."},
        {"s1":"I thanked the classmate.","s2":"The classmate's playlist helped us choose the final song.","pronoun":"whose","clause":["playlist","helped","us","choose","the","final","song"],"distractor":"The classmate's","segs":["I","thanked the classmate."],"correctGap":1,"combined":"I thanked the classmate whose playlist helped us choose the final song."}
      ]
    },
    "passive-voice": {
      label: "Passive Voice",
      icon: "\u{1F504}",
      iconClass: "c-amber",
      desc: "be + past participle",
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
    },
    "reported-speech": {
      label: "Reported Speech",
      icon: "\u{1F4AC}",
      iconClass: "c-rose",
      desc: "said, told, asked; tense, pronoun & time shifts",
      type: "builder-rs",
      // 3-step reported-speech builder. Up to 3 marks per question:
      //   Step 1 (frame):  pick the correct reporting frame (3 options, 1 correct).
      //   Step 2 (clause): tap word-tiles in order to build the reported clause.
      //                    Some slots accept more than one verb form (e.g. saw / had seen).
      //                    `that` is an optional leading tile (accepted with or without).
      //   Step 3 (time):   pick the correct reported time expression (3 options;
      //                    more than one may be accepted). Omitted when no time word changes.
      // No repeats within an exercise; the app draws unique questions at random.
      instructions: "Rewrite the sentence in reported speech. Choose the reporting frame, build the reported clause, then choose the time expression.",
      questions: [
        {"prompt": "Tom said, ‘I am doing my homework now.’", "frameCorrect": "Tom said", "frameWrong": ["Tom said me", "Tom told"], "clauseCorrect": ["he", ["was doing", "had been doing"], "his", "homework"], "clauseWrong": ["I", "is doing"], "timeCorrect": ["then", "at that moment"], "timeWrong": ["now", "today"], "type": "statement", "combined": "Tom said that he [was doing / had been doing] his homework [then / at that moment]."},
        {"prompt": "Susan said, ‘We may visit our grandparents tomorrow.’", "frameCorrect": "Susan said", "frameWrong": ["Susan said us", "Susan told"], "clauseCorrect": ["they", "might visit", "their", "grandparents"], "clauseWrong": ["we", "may visit"], "timeCorrect": ["the next day", "the following day"], "timeWrong": ["tomorrow", "yesterday"], "type": "statement", "combined": "Susan said that they might visit their grandparents the [next / following] day."},
        {"prompt": "Jenny told me, ‘I will help you with your project next week.’", "frameCorrect": "Jenny told me", "frameWrong": ["Jenny said me", "Jenny told"], "clauseCorrect": ["she", "would help", "me", "with my project"], "clauseWrong": ["I", "will help"], "timeCorrect": ["the next week", "the following week"], "timeWrong": ["next week", "last week"], "type": "statement", "combined": "Jenny told me that she would help me with my project the [next / following] week."},
        {"prompt": "‘Stop walking on the grass, children!’ ordered the guard.", "frameCorrect": "The guard ordered the children", "frameWrong": ["The guard ordered", "The guard said the children"], "clauseCorrect": ["to stop", "walking on the grass"], "clauseWrong": ["stop", "stopping"], "timeCorrect": [], "timeWrong": [], "type": "command", "combined": "The guard ordered the children to stop walking on the grass."},
        {"prompt": "Kevin said, ‘My sister has already finished her project.’", "frameCorrect": "Kevin said", "frameWrong": ["Kevin said me", "Kevin told"], "clauseCorrect": ["his", "sister", "had already finished", "her project"], "clauseWrong": ["my", "has already finished"], "timeCorrect": [], "timeWrong": [], "type": "statement", "combined": "Kevin said that his sister had already finished her project."},
        {"prompt": "The policeman warned the driver, ‘Do not park the car here tonight.’", "frameCorrect": "The policeman warned the driver", "frameWrong": ["The policeman warned", "The policeman said the driver"], "clauseCorrect": ["not to park", "the car", "there"], "clauseWrong": ["do not park", "here"], "timeCorrect": ["that night"], "timeWrong": ["tonight", "last night"], "type": "command", "combined": "The policeman warned the driver not to park the car there that night."},
        {"prompt": "Mr Lee reminded the students, ‘Hand in your homework next Monday.’", "frameCorrect": "Mr Lee reminded the students", "frameWrong": ["Mr Lee reminded", "Mr Lee said the students"], "clauseCorrect": ["to hand in", "their", "homework"], "clauseWrong": ["hand in", "your"], "timeCorrect": ["the next Monday", "the following Monday"], "timeWrong": ["next Monday", "last Monday"], "type": "command", "combined": "Mr Lee reminded the students to hand in their homework the [next / following] Monday."},
        {"prompt": "Karen told me, ‘I can meet you here today.’", "frameCorrect": "Karen told me", "frameWrong": ["Karen said me", "Karen told"], "clauseCorrect": ["she", "could meet", "me", "there"], "clauseWrong": ["I", "can meet"], "timeCorrect": ["that day"], "timeWrong": ["today", "yesterday"], "type": "statement", "combined": "Karen told me that she could meet me there that day."},
        {"prompt": "Paul said to his sister, ‘I saw your teacher at the supermarket yesterday.’", "frameCorrect": "Paul said to his sister", "frameWrong": ["Paul said", "Paul said his sister"], "clauseCorrect": ["he", ["saw", "had seen"], "her", "teacher at the supermarket"], "clauseWrong": ["I", "see"], "timeCorrect": ["the day before", "the previous day"], "timeWrong": ["yesterday", "tomorrow"], "type": "statement", "combined": "Paul said to his sister that he [saw / had seen] her teacher at the supermarket the [day before / previous day]."},
        {"prompt": "‘Please buy me a newspaper on your way home,’ my father asked me.", "frameCorrect": "My father asked me", "frameWrong": ["My father asked", "My father said me"], "clauseCorrect": ["to buy", "him", "a newspaper on", "my", "way home"], "clauseWrong": ["buy", "me"], "timeCorrect": [], "timeWrong": [], "type": "command", "combined": "My father asked me to buy him a newspaper on my way home."},
        {"prompt": "‘I’ll come home late tonight,’ Cathy said.", "frameCorrect": "Cathy said", "frameWrong": ["Cathy said me", "Cathy told"], "clauseCorrect": ["she", "would go", "home late"], "clauseWrong": ["I", "will come"], "timeCorrect": ["that night"], "timeWrong": ["tonight", "last night"], "type": "statement", "combined": "Cathy said that she would go home late that night."},
        {"prompt": "‘These books are expensive to me,’ said Tom.", "frameCorrect": "Tom said", "frameWrong": ["Tom said me", "Tom told"], "clauseCorrect": ["those", "books", ["were", "had been"], "expensive to", "him"], "clauseWrong": ["these", "are"], "timeCorrect": [], "timeWrong": [], "type": "statement", "combined": "Tom said that those books [were / had been] expensive to him."},
        {"prompt": "‘I’m not going to buy this dress,’ said Lily.", "frameCorrect": "Lily said", "frameWrong": ["Lily said me", "Lily told"], "clauseCorrect": ["she", ["was not going", "had not been going"], "to buy", "that", "dress"], "clauseWrong": ["I", "am not going"], "timeCorrect": [], "timeWrong": [], "type": "statement", "combined": "Lily said that she [was not going / had not been going] to buy that dress."},
        {"prompt": "Mike said, ‘I handed in my homework two days ago.’", "frameCorrect": "Mike said", "frameWrong": ["Mike said me", "Mike told"], "clauseCorrect": ["he", ["handed", "had handed"], "in", "his", "homework"], "clauseWrong": ["I", "hand"], "timeCorrect": ["two days before", "two days previously"], "timeWrong": ["two days ago", "in two days"], "type": "statement", "combined": "Mike said that he [handed / had handed] in his homework two days before."},
        {"prompt": "‘You should not go out tomorrow,’ Mum said.", "frameCorrect": "Mum said", "frameWrong": ["Mum said me", "Mum told"], "clauseCorrect": ["I", "should not go", "out"], "clauseWrong": ["you", "shall not go"], "timeCorrect": ["the next day", "the following day"], "timeWrong": ["tomorrow", "yesterday"], "type": "statement", "combined": "Mum said that I should not go out the [next / following] day."},
        {"prompt": "Emma said, ‘I have uploaded the poster for the talent show already.’", "frameCorrect": "Emma said", "frameWrong": ["Emma said me", "Emma told"], "clauseCorrect": ["she", "had uploaded", "the poster for the talent show already"], "clauseWrong": ["I", "have uploaded"], "timeCorrect": [], "timeWrong": [], "type": "statement", "combined": "Emma said that she had uploaded the poster for the talent show already."},
        {"prompt": "‘Please bring your guitar to school tomorrow,’ Ryan asked Ben.", "frameCorrect": "Ryan asked Ben", "frameWrong": ["Ryan asked", "Ryan said Ben"], "clauseCorrect": ["to bring", "his", "guitar to school"], "clauseWrong": ["bring", "your"], "timeCorrect": ["the next day", "the following day"], "timeWrong": ["tomorrow", "yesterday"], "type": "command", "combined": "Ryan asked Ben to bring his guitar to school the [next / following] day."},
        {"prompt": "The coach warned the players, ‘Do not leave your water bottles here after practice.’", "frameCorrect": "The coach warned the players", "frameWrong": ["The coach warned", "The coach said the players"], "clauseCorrect": ["not to leave", "their", "water bottles", "there", "after practice"], "clauseWrong": ["do not leave", "here"], "timeCorrect": [], "timeWrong": [], "type": "command", "combined": "The coach warned the players not to leave their water bottles there after practice."},
        {"prompt": "Mia told me, ‘I can design the stage background today.’", "frameCorrect": "Mia told me", "frameWrong": ["Mia said me", "Mia told"], "clauseCorrect": ["she", "could design", "the stage background"], "clauseWrong": ["I", "can design"], "timeCorrect": ["that day"], "timeWrong": ["today", "yesterday"], "type": "statement", "combined": "Mia told me that she could design the stage background that day."},
        {"prompt": "‘Meet me outside the music room at five o’clock,’ Jason told his brother.", "frameCorrect": "Jason told his brother", "frameWrong": ["Jason told", "Jason said his brother"], "clauseCorrect": ["to meet", "him", "outside the music room at five o’clock"], "clauseWrong": ["meet", "me"], "timeCorrect": [], "timeWrong": [], "type": "command", "combined": "Jason told his brother to meet him outside the music room at five o’clock."},
        {"prompt": "Olivia said, ‘We are practising our dance routine now.’", "frameCorrect": "Olivia said", "frameWrong": ["Olivia said me", "Olivia told"], "clauseCorrect": ["they", ["were practising", "had been practising"], "their", "dance routine"], "clauseWrong": ["we", "are practising"], "timeCorrect": ["then", "at that moment"], "timeWrong": ["now", "today"], "type": "statement", "combined": "Olivia said that they [were practising / had been practising] their dance routine [then / at that moment]."},
        {"prompt": "Mr Chan reminded the class, ‘Send your video clips by next Friday.’", "frameCorrect": "Mr Chan reminded the class", "frameWrong": ["Mr Chan reminded", "Mr Chan said the class"], "clauseCorrect": ["to send", "their", "video clips by"], "clauseWrong": ["send", "your"], "timeCorrect": ["the next Friday", "the following Friday"], "timeWrong": ["next Friday", "last Friday"], "type": "command", "combined": "Mr Chan reminded the class to send their video clips by the [next / following] Friday."},
        {"prompt": "Noah said to Lily, ‘I found your notebook in the library yesterday.’", "frameCorrect": "Noah said to Lily", "frameWrong": ["Noah said", "Noah said Lily"], "clauseCorrect": ["he", ["found", "had found"], "her", "notebook in the library"], "clauseWrong": ["I", "find"], "timeCorrect": ["the day before", "the previous day"], "timeWrong": ["yesterday", "tomorrow"], "type": "statement", "combined": "Noah said to Lily that he [found / had found] her notebook in the library the [day before / previous day]."},
        {"prompt": "‘Don’t share this photo online tonight,’ Grace warned her friend.", "frameCorrect": "Grace warned her friend", "frameWrong": ["Grace warned", "Grace said her friend"], "clauseCorrect": ["not to share", "that", "photo online"], "clauseWrong": ["don’t share", "this"], "timeCorrect": ["that night"], "timeWrong": ["tonight", "last night"], "type": "command", "combined": "Grace warned her friend not to share that photo online that night."},
        {"prompt": "Daniel said, ‘My team will perform first next week.’", "frameCorrect": "Daniel said", "frameWrong": ["Daniel said me", "Daniel told"], "clauseCorrect": ["his", "team", "would perform", "first"], "clauseWrong": ["my", "will perform"], "timeCorrect": ["the next week", "the following week"], "timeWrong": ["next week", "last week"], "type": "statement", "combined": "Daniel said that his team would perform first the [next / following] week."},
        {"prompt": "‘These costumes are too small for us,’ said the dancers.", "frameCorrect": "The dancers said", "frameWrong": ["The dancers said me", "The dancers told"], "clauseCorrect": ["those", "costumes", ["were", "had been"], "too small for", "them"], "clauseWrong": ["these", "are"], "timeCorrect": [], "timeWrong": [], "type": "statement", "combined": "The dancers said that those costumes [were / had been] too small for them."},
        {"prompt": "Sophie told me, ‘I may join the drama club tomorrow.’", "frameCorrect": "Sophie told me", "frameWrong": ["Sophie said me", "Sophie told"], "clauseCorrect": ["she", "might join", "the drama club"], "clauseWrong": ["I", "may join"], "timeCorrect": ["the next day", "the following day"], "timeWrong": ["tomorrow", "yesterday"], "type": "statement", "combined": "Sophie told me that she might join the drama club the [next / following] day."},
        {"prompt": "‘Please check the microphone before the show,’ the teacher asked the student helper.", "frameCorrect": "The teacher asked the student helper", "frameWrong": ["The teacher asked", "The teacher said the student helper"], "clauseCorrect": ["to check", "the microphone before the show"], "clauseWrong": ["check", "checking"], "timeCorrect": [], "timeWrong": [], "type": "command", "combined": "The teacher asked the student helper to check the microphone before the show."},
        {"prompt": "Ethan said, ‘I am not going to sing this song.’", "frameCorrect": "Ethan said", "frameWrong": ["Ethan said me", "Ethan told"], "clauseCorrect": ["he", ["was not going", "had not been going"], "to sing", "that", "song"], "clauseWrong": ["I", "am not going"], "timeCorrect": [], "timeWrong": [], "type": "statement", "combined": "Ethan said that he [was not going / had not been going] to sing that song."},
        {"prompt": "Mum said, ‘You should finish your revision before the concert tomorrow.’", "frameCorrect": "Mum said", "frameWrong": ["Mum said me", "Mum told"], "clauseCorrect": ["I", "should finish", "my", "revision before the concert"], "clauseWrong": ["you", "shall finish"], "timeCorrect": ["the next day", "the following day"], "timeWrong": ["tomorrow", "yesterday"], "type": "statement", "combined": "Mum said that I should finish my revision before the concert the [next / following] day."},
        {"prompt": "Leo said, ‘Our team is joining the online tournament now.’", "frameCorrect": "Leo said", "frameWrong": ["Leo said me", "Leo told"], "clauseCorrect": ["their", "team", ["was joining", "had been joining"], "the online tournament"], "clauseWrong": ["our", "is joining"], "timeCorrect": ["then", "at that moment"], "timeWrong": ["now", "today"], "type": "statement", "combined": "Leo said that their team [was joining / had been joining] the online tournament [then / at that moment]."},
        {"prompt": "‘Please send me the game code tonight,’ Alex asked Mia.", "frameCorrect": "Alex asked Mia", "frameWrong": ["Alex asked", "Alex said Mia"], "clauseCorrect": ["to send", "him", "the game code"], "clauseWrong": ["send", "me"], "timeCorrect": ["that night"], "timeWrong": ["tonight", "last night"], "type": "command", "combined": "Alex asked Mia to send him the game code that night."},
        {"prompt": "The organiser reminded the players, ‘Check your internet connection before the match tomorrow.’", "frameCorrect": "The organiser reminded the players", "frameWrong": ["The organiser reminded", "The organiser said the players"], "clauseCorrect": ["to check", "their", "internet connection before the match"], "clauseWrong": ["check", "your"], "timeCorrect": ["the next day", "the following day"], "timeWrong": ["tomorrow", "yesterday"], "type": "command", "combined": "The organiser reminded the players to check their internet connection before the match the [next / following] day."},
        {"prompt": "Nina told me, ‘I will stream the final round next week.’", "frameCorrect": "Nina told me", "frameWrong": ["Nina said me", "Nina told"], "clauseCorrect": ["she", "would stream", "the final round"], "clauseWrong": ["I", "will stream"], "timeCorrect": ["the next week", "the following week"], "timeWrong": ["next week", "last week"], "type": "statement", "combined": "Nina told me that she would stream the final round the [next / following] week."},
        {"prompt": "‘Do not shout into the microphone, boys!’ warned Dad.", "frameCorrect": "Dad warned the boys", "frameWrong": ["Dad warned", "Dad said the boys"], "clauseCorrect": ["not to shout", "into the microphone"], "clauseWrong": ["do not shout", "shout"], "timeCorrect": [], "timeWrong": [], "type": "command", "combined": "Dad warned the boys not to shout into the microphone."},
        {"prompt": "Ben said, ‘I have already chosen my character.’", "frameCorrect": "Ben said", "frameWrong": ["Ben said me", "Ben told"], "clauseCorrect": ["he", "had already chosen", "his", "character"], "clauseWrong": ["I", "have already chosen"], "timeCorrect": [], "timeWrong": [], "type": "statement", "combined": "Ben said that he had already chosen his character."},
        {"prompt": "Chloe said to Ryan, ‘I watched your practice match yesterday.’", "frameCorrect": "Chloe said to Ryan", "frameWrong": ["Chloe said", "Chloe said Ryan"], "clauseCorrect": ["she", ["watched", "had watched"], "his", "practice match"], "clauseWrong": ["I", "watch"], "timeCorrect": ["the day before", "the previous day"], "timeWrong": ["yesterday", "tomorrow"], "type": "statement", "combined": "Chloe said to Ryan that she [watched / had watched] his practice match the [day before / previous day]."},
        {"prompt": "‘Take a short break after this round,’ the coach told the team.", "frameCorrect": "The coach told the team", "frameWrong": ["The coach told", "The coach said the team"], "clauseCorrect": ["to take", "a short break after", "that", "round"], "clauseWrong": ["take", "this"], "timeCorrect": [], "timeWrong": [], "type": "command", "combined": "The coach told the team to take a short break after that round."},
        {"prompt": "Max said, ‘These headphones are uncomfortable for me.’", "frameCorrect": "Max said", "frameWrong": ["Max said me", "Max told"], "clauseCorrect": ["those", "headphones", ["were", "had been"], "uncomfortable for", "him"], "clauseWrong": ["these", "are"], "timeCorrect": [], "timeWrong": [], "type": "statement", "combined": "Max said that those headphones [were / had been] uncomfortable for him."},
        {"prompt": "Sara told me, ‘I may invite my cousin to play tomorrow.’", "frameCorrect": "Sara told me", "frameWrong": ["Sara said me", "Sara told"], "clauseCorrect": ["she", "might invite", "her", "cousin to play"], "clauseWrong": ["I", "may invite"], "timeCorrect": ["the next day", "the following day"], "timeWrong": ["tomorrow", "yesterday"], "type": "statement", "combined": "Sara told me that she might invite her cousin to play the [next / following] day."},
        {"prompt": "‘Don’t download that file here,’ the teacher warned the students.", "frameCorrect": "The teacher warned the students", "frameWrong": ["The teacher warned", "The teacher said the students"], "clauseCorrect": ["not to download", "that file", "there"], "clauseWrong": ["don’t download", "here"], "timeCorrect": [], "timeWrong": [], "type": "command", "combined": "The teacher warned the students not to download that file there."},
        {"prompt": "Jake said, ‘I cannot join the voice chat today.’", "frameCorrect": "Jake said", "frameWrong": ["Jake said me", "Jake told"], "clauseCorrect": ["he", "could not join", "the voice chat"], "clauseWrong": ["I", "cannot join"], "timeCorrect": ["that day"], "timeWrong": ["today", "yesterday"], "type": "statement", "combined": "Jake said that he could not join the voice chat that day."},
        {"prompt": "‘Please help your sister set up the computer,’ Mum asked Jake.", "frameCorrect": "Mum asked Jake", "frameWrong": ["Mum asked", "Mum said Jake"], "clauseCorrect": ["to help", "his", "sister set up the computer"], "clauseWrong": ["help", "your"], "timeCorrect": [], "timeWrong": [], "type": "command", "combined": "Mum asked Jake to help his sister set up the computer."},
        {"prompt": "Ella said, ‘I am not going to play this level again.’", "frameCorrect": "Ella said", "frameWrong": ["Ella said me", "Ella told"], "clauseCorrect": ["she", ["was not going", "had not been going"], "to play", "that", "level again"], "clauseWrong": ["I", "am not going"], "timeCorrect": [], "timeWrong": [], "type": "statement", "combined": "Ella said that she [was not going / had not been going] to play that level again."},
        {"prompt": "Tom said, ‘We should practise our strategy tomorrow.’", "frameCorrect": "Tom said", "frameWrong": ["Tom said me", "Tom told"], "clauseCorrect": ["they", "should practise", "their", "strategy"], "clauseWrong": ["we", "shall practise"], "timeCorrect": ["the next day", "the following day"], "timeWrong": ["tomorrow", "yesterday"], "type": "statement", "combined": "Tom said that they should practise their strategy the [next / following] day."},
        {"prompt": "Ava said, ‘I will make a poster about recycling next week.’", "frameCorrect": "Ava said", "frameWrong": ["Ava said me", "Ava told"], "clauseCorrect": ["she", "would make", "a poster about recycling"], "clauseWrong": ["I", "will make"], "timeCorrect": ["the next week", "the following week"], "timeWrong": ["next week", "last week"], "type": "statement", "combined": "Ava said that she would make a poster about recycling the [next / following] week."},
        {"prompt": "‘Please collect the empty bottles after lunch today,’ Ms Wong asked the helpers.", "frameCorrect": "Ms Wong asked the helpers", "frameWrong": ["Ms Wong asked", "Ms Wong said the helpers"], "clauseCorrect": ["to collect", "the empty bottles after lunch"], "clauseWrong": ["collect", "collecting"], "timeCorrect": ["that day"], "timeWrong": ["today", "yesterday"], "type": "command", "combined": "Ms Wong asked the helpers to collect the empty bottles after lunch that day."},
        {"prompt": "Liam told me, ‘We are building a small garden here now.’", "frameCorrect": "Liam told me", "frameWrong": ["Liam said me", "Liam told"], "clauseCorrect": ["they", ["were building", "had been building"], "a small garden", "there"], "clauseWrong": ["we", "are building"], "timeCorrect": ["then", "at that moment"], "timeWrong": ["now", "today"], "type": "statement", "combined": "Liam told me that they [were building / had been building] a small garden there [then / at that moment]."},
        {"prompt": "The teacher warned the students, ‘Do not throw paper on the floor.’", "frameCorrect": "The teacher warned the students", "frameWrong": ["The teacher warned", "The teacher said the students"], "clauseCorrect": ["not to throw", "paper on the floor"], "clauseWrong": ["do not throw", "throw"], "timeCorrect": [], "timeWrong": [], "type": "command", "combined": "The teacher warned the students not to throw paper on the floor."},
        {"prompt": "Zoe said, ‘My brother has already donated some old books.’", "frameCorrect": "Zoe said", "frameWrong": ["Zoe said me", "Zoe told"], "clauseCorrect": ["her", "brother", "had already donated", "some old books"], "clauseWrong": ["my", "has already donated"], "timeCorrect": [], "timeWrong": [], "type": "statement", "combined": "Zoe said that her brother had already donated some old books."},
        {"prompt": "‘Bring your reusable cups tomorrow,’ the club leader reminded the members.", "frameCorrect": "The club leader reminded the members", "frameWrong": ["The club leader reminded", "The club leader said the members"], "clauseCorrect": ["to bring", "their", "reusable cups"], "clauseWrong": ["bring", "your"], "timeCorrect": ["the next day", "the following day"], "timeWrong": ["tomorrow", "yesterday"], "type": "command", "combined": "The club leader reminded the members to bring their reusable cups the [next / following] day."},
        {"prompt": "Ethan said to Grace, ‘I saw your plant display in the hall yesterday.’", "frameCorrect": "Ethan said to Grace", "frameWrong": ["Ethan said", "Ethan said Grace"], "clauseCorrect": ["he", ["saw", "had seen"], "her", "plant display in the hall"], "clauseWrong": ["I", "see"], "timeCorrect": ["the day before", "the previous day"], "timeWrong": ["yesterday", "tomorrow"], "type": "statement", "combined": "Ethan said to Grace that he [saw / had seen] her plant display in the hall the [day before / previous day]."},
        {"prompt": "‘Turn off the lights before you leave this room,’ ordered the caretaker.", "frameCorrect": "The caretaker ordered us", "frameWrong": ["The caretaker ordered", "The caretaker said us"], "clauseCorrect": ["to turn off", "the lights before", "we", "left", "that", "room"], "clauseWrong": ["turn off", "you", "leave", "this"], "timeCorrect": [], "timeWrong": [], "type": "command", "combined": "The caretaker ordered us to turn off the lights before we left that room."},
        {"prompt": "Lily told me, ‘I can help at the food stall today.’", "frameCorrect": "Lily told me", "frameWrong": ["Lily said me", "Lily told"], "clauseCorrect": ["she", "could help", "at the food stall"], "clauseWrong": ["I", "can help"], "timeCorrect": ["that day"], "timeWrong": ["today", "yesterday"], "type": "statement", "combined": "Lily told me that she could help at the food stall that day."},
        {"prompt": "Noah said, ‘These leaflets are useful to us.’", "frameCorrect": "Noah said", "frameWrong": ["Noah said me", "Noah told"], "clauseCorrect": ["those", "leaflets", ["were", "had been"], "useful to", "them"], "clauseWrong": ["these", "are"], "timeCorrect": [], "timeWrong": [], "type": "statement", "combined": "Noah said that those leaflets [were / had been] useful to them."},
        {"prompt": "‘Please lend me your scissors for the craft activity,’ Ruby asked Jack.", "frameCorrect": "Ruby asked Jack", "frameWrong": ["Ruby asked", "Ruby said Jack"], "clauseCorrect": ["to lend", "her", "his", "scissors for the craft activity"], "clauseWrong": ["lend", "me", "your"], "timeCorrect": [], "timeWrong": [], "type": "command", "combined": "Ruby asked Jack to lend her his scissors for the craft activity."},
        {"prompt": "Daniel said, ‘I may join the clean-up team tomorrow.’", "frameCorrect": "Daniel said", "frameWrong": ["Daniel said me", "Daniel told"], "clauseCorrect": ["he", "might join", "the clean-up team"], "clauseWrong": ["I", "may join"], "timeCorrect": ["the next day", "the following day"], "timeWrong": ["tomorrow", "yesterday"], "type": "statement", "combined": "Daniel said that he might join the clean-up team the [next / following] day."},
        {"prompt": "‘Don’t put plastic bags here tonight,’ the volunteer warned the visitors.", "frameCorrect": "The volunteer warned the visitors", "frameWrong": ["The volunteer warned", "The volunteer said the visitors"], "clauseCorrect": ["not to put", "plastic bags", "there"], "clauseWrong": ["don’t put", "here"], "timeCorrect": ["that night"], "timeWrong": ["tonight", "last night"], "type": "command", "combined": "The volunteer warned the visitors not to put plastic bags there that night."},
        {"prompt": "Mia said, ‘I am not going to buy this plastic bottle.’", "frameCorrect": "Mia said", "frameWrong": ["Mia said me", "Mia told"], "clauseCorrect": ["she", ["was not going", "had not been going"], "to buy", "that", "plastic bottle"], "clauseWrong": ["I", "am not going"], "timeCorrect": [], "timeWrong": [], "type": "statement", "combined": "Mia said that she [was not going / had not been going] to buy that plastic bottle."},
        {"prompt": "Mum said, ‘You should prepare your speech before the fair tomorrow.’", "frameCorrect": "Mum said", "frameWrong": ["Mum said me", "Mum told"], "clauseCorrect": ["I", "should prepare", "my", "speech before the fair"], "clauseWrong": ["you", "shall prepare"], "timeCorrect": ["the next day", "the following day"], "timeWrong": ["tomorrow", "yesterday"], "type": "statement", "combined": "Mum said that I should prepare my speech before the fair the [next / following] day."},
      ]
    }
  }
};

// Term-to-keys mapping for easy access
const TERM_KEYS = {
  "First Term": Object.keys(GRAMMAR_DATA["First Term"]),
  "Second Term": Object.keys(GRAMMAR_DATA["Second Term"])
};

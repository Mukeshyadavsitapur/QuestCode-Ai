export interface EnglishExercise {
  id: string;
  question: string;
  correctAnswer: string;
  userAnswer: string;
  isSubmitted: boolean;
  isCorrect?: boolean;
}

export const ENGLISH_EXERCISES: Record<string, EnglishExercise[]> = {
  "1.1": [
    // 1.1 Complete sentences (Present Simple)
    {
      id: "1.1-ex1",
      question: "### 1.1 Complete the sentences using these verbs: cause(s), connect(s), drink(s), live(s), open(s), speak(s), take(s).\n1. Tanya **__________** German very well.",
      correctAnswer: "speaks",
      userAnswer: "", isSubmitted: false
    },
    { id: "1.1-ex2", question: "2. I don't often **__________** coffee.", correctAnswer: "drink", userAnswer: "", isSubmitted: false },
    { id: "1.1-ex3", question: "3. The swimming pool **__________** at 7:30 every morning.", correctAnswer: "opens", userAnswer: "", isSubmitted: false },
    { id: "1.1-ex4", question: "4. Bad driving **__________** many accidents.", correctAnswer: "causes", userAnswer: "", isSubmitted: false },
    { id: "1.1-ex5", question: "5. My parents **__________** in a very small flat.", correctAnswer: "live", userAnswer: "", isSubmitted: false },
    { id: "1.1-ex6", question: "6. The Olympic Games **__________** place every four years.", correctAnswer: "take", userAnswer: "", isSubmitted: false },
    { id: "1.1-ex7", question: "7. The Panama Canal **__________** the Atlantic and Pacific oceans.", correctAnswer: "connects", userAnswer: "", isSubmitted: false },
    // 1.2 Correct form
    {
      id: "1.1-ex8",
      question: "### 1.2 Put the verb into the correct form.\n1. Julie **__________** (not / drink) tea very often.",
      correctAnswer: "doesn't drink",
      userAnswer: "", isSubmitted: false
    },
    { id: "1.1-ex9", question: "2. What time **__________** (the banks / close) here?", correctAnswer: "do the banks close", userAnswer: "", isSubmitted: false },
    { id: "1.1-ex10", question: "3. I've got a car, but I **__________** (not / use) it much.", correctAnswer: "don't use", userAnswer: "", isSubmitted: false },
    { id: "1.1-ex11", question: "4. 'Where **__________** (Ricardo / come) from?' 'From Cuba.'", correctAnswer: "does Ricardo come", userAnswer: "", isSubmitted: false },
    { id: "1.1-ex12", question: "5. 'What **__________** (you / do)?' 'I'm an electrician.'", correctAnswer: "do you do", userAnswer: "", isSubmitted: false },
    { id: "1.1-ex13", question: "6. It **__________** (take) me an hour to get to work.", correctAnswer: "takes", userAnswer: "", isSubmitted: false },
    { id: "1.1-ex14", question: "7. How long **__________** (it / take) you to get to work?", correctAnswer: "does it take", userAnswer: "", isSubmitted: false },
    { id: "1.1-ex15", question: "8. Look at this sentence. What **__________** (this word / mean)?", correctAnswer: "does this word mean", userAnswer: "", isSubmitted: false },
    { id: "1.1-ex16", question: "9. David isn't very fit. He **__________** (not / do) any sport.", correctAnswer: "doesn't do", userAnswer: "", isSubmitted: false },
    // 1.3 General Truths
    {
      id: "1.1-ex17",
      question: "### 1.3 Complete the sentences using: believe, eat, flow, go, grow, make, rise, tell, translate.\n1. The earth **__________** round the sun.",
      correctAnswer: "goes",
      userAnswer: "", isSubmitted: false
    },
    { id: "1.1-ex18", question: "2. Rice **__________** in Britain.", correctAnswer: "doesn't grow", userAnswer: "", isSubmitted: false },
    { id: "1.1-ex19", question: "3. The sun **__________** in the east.", correctAnswer: "rises", userAnswer: "", isSubmitted: false },
    { id: "1.1-ex20", question: "4. Bees **__________** honey.", correctAnswer: "make", userAnswer: "", isSubmitted: false },
    { id: "1.1-ex21", question: "5. Vegetarians **__________** meat.", correctAnswer: "don't eat", userAnswer: "", isSubmitted: false },
    { id: "1.1-ex22", question: "6. An atheist **__________** in God.", correctAnswer: "doesn't believe", userAnswer: "", isSubmitted: false },
    { id: "1.1-ex23", question: "7. An interpreter **__________** from one language into another.", correctAnswer: "translates", userAnswer: "", isSubmitted: false },
    { id: "1.1-ex24", question: "8. Liars are people who **__________** the truth.", correctAnswer: "don't tell", userAnswer: "", isSubmitted: false },
    { id: "1.1-ex25", question: "9. The River Amazon **__________** into the Atlantic Ocean.", correctAnswer: "flows", userAnswer: "", isSubmitted: false },
    // 1.4 Ask questions
    {
      id: "1.1-ex26",
      question: "### 1.4 Ask questions about herself.\n1. You know that Lisa plays tennis. You want to know how often. Ask her.\n**How often __________?**",
      correctAnswer: "do you play tennis",
      userAnswer: "", isSubmitted: false
    },
    { id: "1.1-ex27", question: "2. Perhaps Lisa's sister plays tennis too. You want to know. Ask Lisa.\n**__________?**", correctAnswer: "Does your sister play tennis", userAnswer: "", isSubmitted: false },
    { id: "1.1-ex28", question: "3. Lisa reads a newspaper every day. You want to know which one.\n**__________?**", correctAnswer: "Which newspaper do you read every day", userAnswer: "", isSubmitted: false },
    { id: "1.1-ex29", question: "4. Lisa's brother works. You want to know what he does.\n**__________?**", correctAnswer: "What does your brother do", userAnswer: "", isSubmitted: false },
    { id: "1.1-ex30", question: "5. Lisa goes to the cinema a lot. You want to know how often.\n**__________?**", correctAnswer: "How often do you go to the cinema", userAnswer: "", isSubmitted: false },
    { id: "1.1-ex31", question: "6. You don't know where Lisa's grandparents live. Ask Lisa.\n**__________?**", correctAnswer: "Where do your grandparents live", userAnswer: "", isSubmitted: false },
    // 1.5 Special Verbs
    {
      id: "1.1-ex32",
      question: "### 1.5 Complete using: I apologize, I insist, I promise, I recommend, I suggest.\n1. Mr Evans is not in the office. **__________** you try calling tomorrow.",
      correctAnswer: "I suggest",
      userAnswer: "", isSubmitted: false
    },
    { id: "1.1-ex33", question: "2. I won't tell anybody. **__________**.", correctAnswer: "I promise", userAnswer: "", isSubmitted: false },
    { id: "1.1-ex34", question: "3. (in a restaurant) You must let me pay. **__________**.", correctAnswer: "I insist", userAnswer: "", isSubmitted: false },
    { id: "1.1-ex35", question: "4. **__________** for what I did. It won't happen again.", correctAnswer: "I apologize", userAnswer: "", isSubmitted: false },
    { id: "1.1-ex36", question: "5. The new restaurant is very good. **__________** it.", correctAnswer: "I recommend", userAnswer: "", isSubmitted: false }
  ],
  "1.2": [
    // 1.2 Match sentences (Present Continuous)
    {
      id: "1.2-ex1",
      question: "### 1.1 Match the sentences on the left with the right.\n1. Please don't make so much noise. (Match with: f)  \na It's getting late.  \nb They're lying.  \nc It's starting to rain.  \nd They're trying to sell it.  \ne I'm getting hungry.  \n**f I'm trying to work.**  \ng I'm looking for an apartment.  \nh The company is losing money.\n\n**1. Please don't make so much noise. -> ?**",
      correctAnswer: "I'm trying to work",
      userAnswer: "", isSubmitted: false
    },
    { id: "1.2-ex2", question: "2. I need to eat something soon. -> ?", correctAnswer: "I'm getting hungry", userAnswer: "", isSubmitted: false },
    { id: "1.2-ex3", question: "3. I don't have anywhere to live right now. -> ?", correctAnswer: "I'm looking for an apartment", userAnswer: "", isSubmitted: false },
    { id: "1.2-ex4", question: "4. We need to leave soon. -> ?", correctAnswer: "It's getting late", userAnswer: "", isSubmitted: false },
    { id: "1.2-ex5", question: "5. They don't need their car any more. -> ?", correctAnswer: "They're trying to sell it", userAnswer: "", isSubmitted: false },
    { id: "1.2-ex6", question: "6. Things are not so good at work. -> ?", correctAnswer: "The company is losing money", userAnswer: "", isSubmitted: false },
    { id: "1.2-ex7", question: "7. It isn't true what they said. -> ?", correctAnswer: "They're lying", userAnswer: "", isSubmitted: false },
    { id: "1.2-ex8", question: "8. We're going to get wet. -> ?", correctAnswer: "It's starting to rain", userAnswer: "", isSubmitted: false },
    // 1.2 Complete conversations
    {
      id: "1.2-ex9",
      question: "### 1.2 Complete the conversations.\n\nA: I saw Brian a few days ago.  \nB: Oh, did you? **__________** (what / he / do) these days?",
      correctAnswer: "What's he doing",
      userAnswer: "", isSubmitted: false
    },
    { id: "1.2-ex10", question: "A: He's at university.  \nB: **__________**? (what / he / study)", correctAnswer: "What's he studying", userAnswer: "", isSubmitted: false },
    { id: "1.2-ex11", question: "B: **__________** it? (he / enjoy)", correctAnswer: "Is he enjoying", userAnswer: "", isSubmitted: false },
    { id: "1.2-ex12", question: "A: Hi, Nicola. How **__________**? (your new job / go)", correctAnswer: "is your new job going", userAnswer: "", isSubmitted: false },
    { id: "1.2-ex13", question: "B: Not bad. It wasn't so good at first, but **__________** better now. (it / get)", correctAnswer: "it is getting", userAnswer: "", isSubmitted: false },
    { id: "1.2-ex14", question: "A: What about Daniel? Is he OK?  \nB: Yes, but **__________** his work right now. (he / not / enjoy)", correctAnswer: "he isn't enjoying", userAnswer: "", isSubmitted: false },
    { id: "1.2-ex15", question: "B: He's been in the same job for a long time and **__________** to get bored with it. (he / begin)", correctAnswer: "he is beginning", userAnswer: "", isSubmitted: false },
    // 1.3 Put the verb into correct form
    {
      id: "1.2-ex16",
      question: "### 1.3 Put the verb into the correct form.\n1. Please don't make so much noise. **__________** (I / try) to work.",
      correctAnswer: "I'm trying",
      userAnswer: "", isSubmitted: false
    },
    { id: "1.2-ex17", question: "2. Let's go out now. **__________** (it / rain) any more.", correctAnswer: "It isn't raining", userAnswer: "", isSubmitted: false },
    { id: "1.2-ex18", question: "3. You can turn off the radio. **__________** (I / listen) to it.", correctAnswer: "I am not listening", userAnswer: "", isSubmitted: false },
    { id: "1.2-ex19", question: "4. Kate phoned me last night. She's on holiday in France. **__________** (she / have) a great time.", correctAnswer: "She is having", userAnswer: "", isSubmitted: false },
    { id: "1.2-ex20", question: "5. I want to lose weight, so this week **__________** (I / eat) lunch.", correctAnswer: "I am not eating", userAnswer: "", isSubmitted: false },
    { id: "1.2-ex21", question: "6. Andrew has just started evening classes. **__________** (he / learn) Japanese.", correctAnswer: "He is learning", userAnswer: "", isSubmitted: false },
    { id: "1.2-ex22", question: "7. Paul and Sally have had an argument. **__________** (they / speak) to each other.", correctAnswer: "They aren't speaking", userAnswer: "", isSubmitted: false },
    { id: "1.2-ex23", question: "8. **__________** (I / get) tired. I need a rest.", correctAnswer: "I am getting", userAnswer: "", isSubmitted: false },
    { id: "1.2-ex24", question: "9. Tim **__________** (work) today. He's taken the day off.", correctAnswer: "is not working", userAnswer: "", isSubmitted: false },
    { id: "1.2-ex25", question: "10. **__________** (I / look) for Sophie. Do you know where she is?", correctAnswer: "I am looking", userAnswer: "", isSubmitted: false },
    // 1.4 Complete using start, get, increase, change, rise
    {
      id: "1.2-ex26",
      question: "### 1.4 Complete the sentences using: start, get, increase, change, rise.\n1. The population of the world **__________** very fast.",
      correctAnswer: "is increasing",
      userAnswer: "", isSubmitted: false
    },
    { id: "1.2-ex27", question: "2. The world **__________**. Things never stay the same.", correctAnswer: "is changing", userAnswer: "", isSubmitted: false },
    { id: "1.2-ex28", question: "3. The situation is already bad and it **__________** worse.", correctAnswer: "is getting", userAnswer: "", isSubmitted: false },
    { id: "1.2-ex29", question: "4. The cost of living **__________**. Every year things are more expensive.", correctAnswer: "is rising", userAnswer: "", isSubmitted: false },
    { id: "1.2-ex30", question: "5. The weather **__________** to improve. The rain has stopped.", correctAnswer: "is starting", userAnswer: "", isSubmitted: false },
    // 1.5 Bonus practice
    { id: "1.2-ex31", question: "### 1.5 Bonus Practice\n**The engine __________ (make) a strange noise. Can you check it?**", correctAnswer: "is making", userAnswer: "", isSubmitted: false },
    { id: "1.2-ex32", question: "**They __________ (not / tell) us the truth about the project.**", correctAnswer: "aren't telling", userAnswer: "", isSubmitted: false },
    { id: "1.2-ex33", question: "**Why __________ (you / stand) on the table? Get down!**", correctAnswer: "are you standing", userAnswer: "", isSubmitted: false },
    { id: "1.2-ex34", question: "**The moon __________ (hide) behind the clouds right now.**", correctAnswer: "is hiding", userAnswer: "", isSubmitted: false },
    { id: "1.2-ex35", question: "**I __________ (wait) for the bus. It's five minutes late.**", correctAnswer: "am waiting", userAnswer: "", isSubmitted: false }
  ]
};

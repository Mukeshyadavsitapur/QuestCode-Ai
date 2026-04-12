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
    {
      "id": "1.1-ex1",
      "question": "Sarah **is driving** to work right now. (drive)\n\nComplete the sentence: **She __________ to her office. (go)**",
      "correctAnswer": "is going",
      "userAnswer": "",
      "isSubmitted": false
    },
    {
      "id": "1.1-ex2",
      "question": "Listen! The phone **is ringing**. (ring)\n\nComplete the sentence: **Somebody __________ us. (call)**",
      "correctAnswer": "is calling",
      "userAnswer": "",
      "isSubmitted": false
    },
    {
      "id": "1.1-ex3",
      "question": "The sun **is shining**. (shine)\n\nComplete the sentence: **The weather __________ beautiful today. (be)**",
      "correctAnswer": "is being",
      "userAnswer": "",
      "isSubmitted": false
    },
    {
      "id": "1.1-ex4",
      "question": "We're in the kitchen. **We are having** breakfast. (have)\n\nComplete the sentence: **We __________ our meal. (eat)**",
      "correctAnswer": "are eating",
      "userAnswer": "",
      "isSubmitted": false
    },
    {
      "id": "1.1-ex5",
      "question": "Look! **It is raining** outside. (rain)\n\nComplete the sentence: **The ground __________ wet. (get)**",
      "correctAnswer": "is getting",
      "userAnswer": "",
      "isSubmitted": false
    }
  ],
  "1.2": [
    {
      "id": "1.2-ex1",
      "question": "Tanya **speaks** German very well. (speak)\n\nComplete the sentence: **Tanya __________ German very well. (speak)**",
      "correctAnswer": "speaks",
      "userAnswer": "",
      "isSubmitted": false
    },
    {
      "id": "1.2-ex2",
      "question": "I don't often **drink** coffee. (drink)\n\nComplete the sentence: **I don't often __________ coffee. (drink)**",
      "correctAnswer": "drink",
      "userAnswer": "",
      "isSubmitted": false
    },
    {
      "id": "1.2-ex3",
      "question": "The swimming pool **opens** at 7:30 every morning. (open)\n\nComplete the sentence: **The swimming pool __________ at 7:30 every morning. (open)**",
      "correctAnswer": "opens",
      "userAnswer": "",
      "isSubmitted": false
    },
    {
      "id": "1.2-ex4",
      "question": "Bad driving **causes** many accidents. (cause)\n\nComplete the sentence: **Bad driving __________ many accidents. (cause)**",
      "correctAnswer": "causes",
      "userAnswer": "",
      "isSubmitted": false
    },
    {
      "id": "1.2-ex5",
      "question": "My parents **live** in a very small flat. (live)\n\nComplete the sentence: **My parents __________ in a very small flat. (live)**",
      "correctAnswer": "live",
      "userAnswer": "",
      "isSubmitted": false
    },
    {
      "id": "1.2-ex6",
      "question": "The earth **goes** round the sun. (go)\n\nComplete the sentence: **The earth __________ round the sun. (go)**",
      "correctAnswer": "goes",
      "userAnswer": "",
      "isSubmitted": false
    },
    {
      "id": "1.2-ex7",
      "question": "I **promise** I won't be late. (promise)\n\nComplete the sentence: **I __________ I won't be late. (promise)**",
      "correctAnswer": "promise",
      "userAnswer": "",
      "isSubmitted": false
    }
  ],
  "1.3": [
    {
      "id": "1.3-ex1",
      "question": "Review: **He __________ (work) in a bank every day.**",
      "correctAnswer": "works",
      "userAnswer": "",
      "isSubmitted": false
    }
  ]
};

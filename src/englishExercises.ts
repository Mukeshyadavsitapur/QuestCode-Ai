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
      "question": "1. Sarah **is driving** to work right now. (drive)\n\nComplete the sentence: **She __________ to her office.**",
      "correctAnswer": "is going",
      "userAnswer": "",
      "isSubmitted": false
    },
    {
      "id": "1.1-ex2",
      "question": "2. Listen! The phone **is ringing**. (ring)\n\nComplete the sentence: **Somebody __________ us.**",
      "correctAnswer": "is calling",
      "userAnswer": "",
      "isSubmitted": false
    },
    {
      "id": "1.1-ex3",
      "question": "3. The sun **is shining**. (shine)\n\nComplete the sentence: **The weather __________ beautiful today.**",
      "correctAnswer": "is being",
      "userAnswer": "",
      "isSubmitted": false
    },
    {
      "id": "1.1-ex4",
      "question": "4. We're in the kitchen. **We are having** breakfast. (have)\n\nComplete the sentence: **We __________ our meal.**",
      "correctAnswer": "are eating",
      "userAnswer": "",
      "isSubmitted": false
    },
    {
      "id": "1.1-ex5",
      "question": "5. Look! **It is raining** outside. (rain)\n\nComplete the sentence: **The ground __________ wet.**",
      "correctAnswer": "is getting",
      "userAnswer": "",
      "isSubmitted": false
    }
  ],
  "1.2": [
    {
      "id": "1.2-ex1",
      "question": "Practice Questions for 1.2 will appear here. \n\nExample: **He __________ (sleep) at the moment.**",
      "correctAnswer": "is sleeping",
      "userAnswer": "",
      "isSubmitted": false
    }
  ]
};

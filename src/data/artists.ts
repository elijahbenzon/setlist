export interface Artist {
  id: number;
  name: string;
  genre: string;
  tentId: number;
  dialogue: string[];
  collectedDialogue: string[];
  trivia: {
    question: string;
    options: string[];
    correctAnswer: number;
  };
}

export const artists: Artist[] = [
  {
    id: 1,
    name: "Domi & JD Beck",
    genre: "Jazz Jive Isle",
    tentId: 1,
    dialogue: [
      "Hey there! We're Domi & JD Beck, a jazz duo known for our unique blend of jazz and electronic music.",
      "We've been playing together since 2018 and have worked with some amazing artists.",
      "Our music combines complex jazz harmonies with modern electronic production techniques.",
      "Want to test your jazz knowledge? Answer this question correctly to join our festival!"
    ],
    collectedDialogue: [
      "We're so excited to be part of your festival!",
      "We've been practicing some new pieces just for this event.",
      "Can't wait to share our unique sound with everyone!"
    ],
    trivia: {
      question: "Which jazz legend did Domi & JD Beck collaborate with on their debut album?",
      options: [
        "Herbie Hancock",
        "Miles Davis",
        "John Coltrane",
        "Duke Ellington"
      ],
      correctAnswer: 0
    }
  },
  {
    id: 2,
    name: "Paramore",
    genre: "Amp Valley",
    tentId: 2,
    dialogue: [
      "Hi! We're Paramore, a rock band from Tennessee.",
      "We've been making music since 2004 and have won multiple Grammy Awards.",
      "Our sound has evolved from pop-punk to a more alternative rock style over the years.",
      "Think you know your rock history? Answer this question to join our festival!"
    ],
    collectedDialogue: [
      "We're all set for the festival!",
      "We've got some special surprises planned for our set.",
      "Can't wait to rock out with everyone!"
    ],
    trivia: {
      question: "What was Paramore's first album called?",
      options: [
        "Riot!",
        "All We Know Is Falling",
        "Brand New Eyes",
        "After Laughter"
      ],
      correctAnswer: 1
    }
  },
  {
    id: 3,
    name: "Sabrina Carpenter",
    genre: "Synth City",
    tentId: 3,
    dialogue: [
      "Hello! I'm Sabrina Carpenter, a pop singer and actress.",
      "I started my career on Disney Channel and have since released multiple albums.",
      "My music blends pop, R&B, and electronic elements.",
      "Want to join my set? Answer this question correctly!"
    ],
    collectedDialogue: [
      "I'm so excited to perform at your festival!",
      "I've been working on some new dance moves.",
      "Can't wait to see everyone dancing to my music!"
    ],
    trivia: {
      question: "Which of these songs is NOT by Sabrina Carpenter?",
      options: [
        "Thumbs",
        "Skin",
        "Nonsense",
        "Bad Blood"
      ],
      correctAnswer: 3
    }
  }
]; 
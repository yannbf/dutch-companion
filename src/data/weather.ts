export interface WeatherWord {
  word: string
  translation: string
  type: 'noun' | 'verb' | 'adjective' | 'phrase'
}

export interface WeatherSentimentItem {
  sentence: string
  translation: string
  sentiment: 'positive' | 'negative'
}

export const weatherWords: WeatherWord[] = [
  { word: 'regen', translation: 'rain', type: 'noun' },
  { word: 'sneeuw', translation: 'snow', type: 'noun' },
  { word: 'zon', translation: 'sun', type: 'noun' },
  { word: 'bewolkt', translation: 'cloudy', type: 'adjective' },
  { word: 'wind', translation: 'wind', type: 'noun' },
  { word: 'storm', translation: 'storm', type: 'noun' },
  { word: 'bliksem', translation: 'lightning', type: 'noun' },
  { word: 'onweer', translation: 'thunderstorm', type: 'noun' },
  { word: 'hagel', translation: 'hail', type: 'noun' },
  { word: 'mist', translation: 'fog', type: 'noun' },
  { word: 'het vriest', translation: "it's freezing", type: 'phrase' },
  { word: 'het dooit', translation: 'it thaws', type: 'phrase' },
  { word: 'het regent', translation: 'it rains', type: 'phrase' },
  { word: 'het sneeuwt', translation: 'it snows', type: 'phrase' },
  { word: 'de temperatuur', translation: 'the temperature', type: 'noun' },
  { word: 'de hittegolf', translation: 'the heatwave', type: 'noun' },
  { word: 'koud', translation: 'cold', type: 'adjective' },
  { word: 'warm', translation: 'warm', type: 'adjective' },
  { word: 'heet', translation: 'hot', type: 'adjective' },
  { word: 'fris', translation: 'chilly', type: 'adjective' },
  { word: 'lekker weer', translation: 'nice weather', type: 'phrase' },
  { word: 'hondenweer', translation: 'nasty weather', type: 'noun' },
]

export const weatherSentences: WeatherSentimentItem[] = [
  {
    sentence: 'Lekker weer vandaag!',
    translation: 'Nice weather today!',
    sentiment: 'positive',
  },
  {
    sentence: 'Wat een hondenweer!',
    translation: 'What awful weather!',
    sentiment: 'negative',
  },
  {
    sentence: 'De zon schijnt en het is warm.',
    translation: 'The sun is shining and it is warm.',
    sentiment: 'positive',
  },
  {
    sentence: 'Het regent de hele dag.',
    translation: 'It rains all day.',
    sentiment: 'negative',
  },
  {
    sentence: 'Het is fris maar droog.',
    translation: 'It is chilly but dry.',
    sentiment: 'positive',
  },
  {
    sentence: 'Er is veel wind en onweer.',
    translation: 'There is a lot of wind and thunder.',
    sentiment: 'negative',
  },
  {
    sentence: 'Perfect weer voor een wandeling.',
    translation: 'Perfect weather for a walk.',
    sentiment: 'positive',
  },
  {
    sentence: 'Ik blijf thuis, wat een storm.',
    translation: 'I stay home, what a storm.',
    sentiment: 'negative',
  },
]

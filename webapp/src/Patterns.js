
const PatternList = [
  { id: 'fire', name: 'Fire' },
  { id: 'firefly', name: 'Firefly' },
  { id: 'rainbow', name: 'Rainbow' },
  { id: 'starburst', name: 'Starburst' },
  { id: 'pulse', name: 'Pulse' },
  { id: 'fade', name: 'Fade' },
]

export const getPatternById = (patternId) => PatternList.find(p => p.id === patternId)

export const nextPattern = (patternId) => {
    const nextIndex = (PatternList.findIndex(p => p.id === patternId) + 1) % PatternList.length
    return PatternList[nextIndex]
}
export const previousPattern = (patternId) => {
    const nextIndex = (PatternList.findIndex(p => p.id === patternId) - 1 + PatternList.length) % PatternList.length
    return PatternList[nextIndex]
}

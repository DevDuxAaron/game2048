import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<div class="container hide">
  <div class="heading">
    <h1>2048</h1>
    <div class="score-container">
      Score:
      <span id="score">0</span>
    </div>
  </div>
  <div class="grid"></div>
</div>
<div class="cover-screen">
  <h2 id="over-text" class="hide">Game Over</h2>
  <p id="result"></p>
  <button id="start-button">Start Game</button>
</div>
`

let grid: HTMLDivElement | null = document.querySelector(".grid")
const startButton: HTMLElement | null = document.getElementById("start-button")
const container: HTMLDivElement | null = document.querySelector(".container")
const coverScreen: HTMLDivElement |null = document.querySelector(".cover-screen")
const result: HTMLElement | null = document.getElementById("result")
const overText: HTMLElement | null = document.getElementById("over-text")

let matrix: number[][]
let score: number
let touchX: number, touchY: number
let initialX = 0, initialY = 0
let rows = 4, columns = 4
let swipeDirection: string

const getXY = (e: TouchEvent, end: boolean): number[] => {
  let X = 0
  let Y = 0
  if (!end) {
    X = e.touches[0].pageX
    Y = e.touches[0].pageY
  } else {
    X = e.changedTouches[0].pageX
    Y = e.changedTouches[0].pageY
  }
  return [X, Y]
}

const createGrid = (): void => {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      const boxDiv: HTMLDivElement = document.createElement("div")
      boxDiv.classList.add("box")
      boxDiv.setAttribute("data-position", `${i}_${j}`)
      grid?.appendChild(boxDiv)
    }
  }
}

const adjacentCheck = (arr: number[]): boolean => {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      return true
    }
  }
  return false
}

const possibleMovesCheck = (): boolean => {
  for (const i in matrix) {
    if (adjacentCheck(matrix[i])) return true
    let colarr = []
    for (let j = 0; j < columns; j++) {
      colarr.push(matrix[i][j])
    }
    if (adjacentCheck(colarr)) return true
  }
  return false
}

const randomPosition = (arr: number[] | number[][]): number => {
  return Math.floor(Math.random() * arr.length)
}

const hasEmptyBox = (): boolean => {
  for (const r in matrix) {
    return matrix[r].indexOf(0) !== -1
  }
  return false
}

const gameOverCheck = () => {
  if (!possibleMovesCheck()) {
    coverScreen?.classList.remove("hide")
    container?.classList.add("hide")
    overText?.classList.remove("hide")
    if (result) {
      result.innerText = `Final score: ${score}`
    }
    if (startButton){
      startButton.innerText = "Restart Game"
    }
  }
}

const generateTwo = () => {
  if (hasEmptyBox()) {
    let randomRow = randomPosition(matrix)
    let randomCol = randomPosition(matrix[randomPosition(matrix)])
    if (matrix[randomRow][randomCol] === 0) {
      matrix[randomRow][randomCol] = 2
      let element: HTMLElement | null = document.querySelector(`[data-position = '${randomRow}_${randomCol}']`)
      if (element){
        element.innerText = "2"
        element.classList.add(`box-2`)
      }
    } else {
      generateTwo()
    }
  } else {
    gameOverCheck()
  }
}

const removeZero = (arr: number[]) => arr.filter((num) => num)

const checker = (arr: number[], reverseArr: boolean): number[] => {
  arr = reverseArr ? removeZero(arr).reverse() : removeZero(arr)

  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]){
      arr[i] += arr[i + 1]
      arr[i + 1] = 0
      score += arr[i]
    }
  }
  arr = reverseArr ? removeZero(arr).reverse() : removeZero(arr)

  let missingCount = 4 - arr.length
  while (missingCount > 0) {
    if(reverseArr) {
      arr.unshift(0)
    } else {
      arr.push(0)
    }
    missingCount -= 1
  }
  return arr
}

const updateElement = (i:number, j:number) => {
  let element = document.querySelector(`[data-position='${i}_${j}']`)
  if (element) {
    element.innerHTML = matrix[i][j] !== 0 ? matrix[i][j].toString() : ""
    element.classList.value = ""
    element.classList.add("box", `box-${matrix[i][j]}`)
  }
}

const sliderMovement = (outer: number, inner: number, reverse:boolean, reversePos: boolean) => {
  for (let i = 0; i < outer; i++) {
    let num: number[] = []
    for (let j = 0; j < inner; j++) {
      if (reversePos) {
        num.push(matrix[j][i])
      } else {
        num.push(matrix[i][j])
      }
    }
    num = checker(num, reverse)
    for (let j = 0; j < inner; j++) {
      if (reversePos) {
        matrix[j][i] = num[j]
        updateElement(j, i)
      } else {
        matrix[i][j] = num[j]
        updateElement(i, j)
      }
    }
  }
}

type slideCreatorType = {
  reverse: boolean,
  vertical: boolean,
  horizontal: boolean
}

const slideCreator = ({reverse, vertical, horizontal}: slideCreatorType) => {
  const slider = () => {
    if (vertical) {
      sliderMovement(columns, rows, reverse, true)
    } else if (horizontal) {
      sliderMovement(rows, columns, reverse, false)
    }
    setTimeout(generateTwo, 200)
  }
  return slider
}

const slideDown = slideCreator({reverse: true, vertical: true, horizontal: false})
const slideUp = slideCreator({reverse: false, vertical: true, horizontal: false})
const slideRight = slideCreator({reverse: true, vertical: false, horizontal: true})
const slideLeft = slideCreator({reverse: false, vertical: false, horizontal: true})

const updateScore = (): void => {
  const scoreAux = document.getElementById("score")
  if (scoreAux) {
    scoreAux.innerText = score?.toString()
  }
}

document.addEventListener("keyup", (e: KeyboardEvent) => {
  if (e.code === "ArrowLeft") slideLeft()
  else if (e.code === "ArrowRight") slideRight()
  else if (e.code === "ArrowUp") slideUp()
  else if (e.code === "ArrowDown") slideDown()
  updateScore()
})

grid?.addEventListener("touchstart", (event: TouchEvent) => {
  [ initialX, initialY ] = getXY(event, false)
})

grid?.addEventListener("touchend", (event: TouchEvent) => {
  [ touchX, touchY ] = getXY(event, true)
  let diffX = Math.max(initialX, touchX) - Math.min(initialX, touchX)
  let diffY = Math.max(initialY, touchY) - Math.min(initialY, touchY)
  if (Math.abs(diffY) > Math.abs(diffX)){
    swipeDirection = touchY > initialY ? "down" : "up"
  } else {
    swipeDirection = touchX > initialX ? "right" : "left"
  }
  type swipeCallsType  = {
    "up": () => void,
    "down": () => void,
    "left": () => void,
    "right": () => void
  }
  let swipeCalls: swipeCallsType = {
    up: slideUp,
    down: slideDown,
    left: slideLeft,
    right: slideRight
  }
  swipeCalls[swipeDirection as keyof swipeCallsType]()
  updateScore()
})

const startGame = () => {
  score = 0
  updateScore()

  if (grid) {
    grid.innerHTML = ""
  }
  matrix = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  container?.classList.remove("hide")
  coverScreen?.classList.add("hide")
  createGrid()
  generateTwo()
  generateTwo()
}

startButton?.addEventListener("click", () => {
  startGame()
  swipeDirection = ""
})
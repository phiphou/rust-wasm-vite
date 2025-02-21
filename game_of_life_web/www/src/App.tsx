import './App.css'
import { WasmUniverse, WasmCell, get_memory } from 'game_of_life'
import { useCallback, useEffect, useRef, useState } from 'react'

let memory = new WebAssembly.Memory({
  initial: 256, // Taille initiale en pages (1 page = 64 Ko)
  maximum: 512 // Taille maximale en pages
})

function adjustMemoryIfNeeded(width: number, height: number) {
  const requiredMemoryPages = Math.ceil((width * height) / 65536) // 1 page = 64 Ko
  const currentMemoryPages = memory.buffer.byteLength / 65536

  if (currentMemoryPages < requiredMemoryPages) {
    memory.grow(requiredMemoryPages - currentMemoryPages)
  }
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [fps, setFps] = useState(30)
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [cellColor, setCellColor] = useState('#000000')
  const [gridWidth, setGridWidth] = useState(80)
  const [gridHeight, setGridHeight] = useState(45) // Initialiser avec un ratio 16:9
  const [universeKey, setUniverseKey] = useState(0) // Force le rechargement de l'univers
  const universeRef = useRef<WasmUniverse | null>(null)
  const lastRenderTimeRef = useRef(0)

  // Largeur et hauteur des contrôles à gauche
  const controlPanelWidth = 300 // Valeur statique ou dynamique en fonction de ton design

  // Calculer la largeur du canvas en fonction de la largeur restante après les contrôles
  const [canvasWidth, setCanvasWidth] = useState(window.innerWidth - controlPanelWidth)

  // Calculer la taille des cellules carrées basées sur la largeur du canvas
  const CELL_SIZE = Math.round(canvasWidth / gridWidth) // Taille de chaque cellule carrée

  console.log(CELL_SIZE)
  // Hauteur du canvas calculée dynamiquement en fonction des cellules et de leur taille
  const canvasHeight = CELL_SIZE * gridHeight

  const getCtx = () => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    return ctx
  }

  const ctx = getCtx()
  const GRID_COLOR = '#CCCCCC'

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getIndex = (row: number, column: number) => row * gridWidth + column

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const drawGrid = () => {
    if (!ctx) return

    ctx.beginPath()
    ctx.strokeStyle = GRID_COLOR

    // Dessiner les lignes de la grille
    for (let i = 0; i <= gridWidth; i++) {
      ctx.moveTo(i * CELL_SIZE, 0)
      ctx.lineTo(i * CELL_SIZE, canvasHeight)
    }

    for (let j = 0; j <= gridHeight; j++) {
      ctx.moveTo(0, j * CELL_SIZE)
      ctx.lineTo(canvasWidth - CELL_SIZE, j * CELL_SIZE)
    }

    ctx.lineWidth = 1 // Épaisseur des lignes de la grille
    ctx.stroke()
  }

  const drawCells = useCallback(() => {
    if (!ctx || !universeRef.current) return

    adjustMemoryIfNeeded(gridWidth, gridHeight) // Ajuste la mémoire avant de dessiner
    memory = get_memory()

    const universe = universeRef.current
    const cellsPtr = universe.get_cells()
    const cells = new Uint8Array(memory.buffer, cellsPtr, gridWidth * gridHeight)

    ctx.clearRect(0, 0, canvasWidth, canvasHeight) // Effacer avant de redessiner

    ctx.beginPath()
    for (let row = 0; row < gridHeight; row++) {
      for (let col = 0; col < gridWidth; col++) {
        const idx = getIndex(row, col)
        ctx.fillStyle = cells[idx] === WasmCell.Dead ? bgColor : cellColor
        ctx.fillRect(
          col * CELL_SIZE, // Largeur dynamique de chaque cellule carrée
          row * CELL_SIZE, // Hauteur dynamique de chaque cellule carrée
          CELL_SIZE,
          CELL_SIZE
        )
      }
    }
    if (showGrid) {
      drawGrid() // Si la grille doit être affichée, on l'affiche
    }
  }, [
    CELL_SIZE,
    bgColor,
    canvasHeight,
    canvasWidth,
    cellColor,
    ctx,
    getIndex,
    gridHeight,
    gridWidth,
    drawGrid,
    showGrid
  ])

  const generateRandomUniverse = () => {
    universeRef.current = new WasmUniverse(gridWidth, gridHeight)
    // universeRef.current.randomise()
    setUniverseKey((prev) => prev + 1) // Forcer la mise à jour de l'univers
  }

  useEffect(() => {
    if (!universeRef.current) {
      universeRef.current = new WasmUniverse(gridWidth, gridHeight) // Crée l'univers uniquement si il n'existe pas encore
    }
    drawCells() // Redessine après chaque changement de taille
  }, [gridWidth, gridHeight, universeKey, drawCells]) // Dépendances pour recréer l'univers

  useEffect(() => {
    let animationId: number
    const renderLoop = (timestamp: number) => {
      // Vérifie si l'univers existe et si l'animation est activée
      if (!universeRef.current || !isRunning) return

      if (timestamp - lastRenderTimeRef.current > 1000 / fps) {
        universeRef.current.tick() // Avance d'une génération dans l'univers
        drawCells() // Redessine les cellules
        lastRenderTimeRef.current = timestamp
      }

      animationId = requestAnimationFrame(renderLoop)
    }

    if (isRunning) {
      animationId = requestAnimationFrame(renderLoop)
    }

    return () => cancelAnimationFrame(animationId) // Nettoyage de l'animation
  }, [isRunning, fps, drawCells, gridWidth]) // Ne pas redéclencher pour gridWidth, gridHeight, etc.

  function updateWidth(arg0: number): void {
    setGridWidth(arg0)
    setGridHeight(Math.floor((arg0 * 9) / 16)) // Met à jour `gridHeight` en fonction du ratio 16:9
    setIsRunning(false)
  }

  // function updateHeight(arg0: number): void {
  //   setGridHeight(arg0);
  //   setGridWidth(Math.floor(arg0 * 16 / 9));  // Met à jour `gridWidth` en fonction du ratio 16:9
  // }

  function updateShowGrid(arg0: boolean): void {
    setShowGrid(arg0) // Met à jour l'état de la grille
  }

  // Mise à jour dynamique de la largeur du canvas
  useEffect(() => {
    const handleResize = () => {
      setCanvasWidth(window.innerWidth - controlPanelWidth) // Mettre à jour la largeur du canvas lors du redimensionnement
    }

    window.addEventListener('resize', handleResize) // Ajouter un écouteur d'événements pour redimensionner

    return () => window.removeEventListener('resize', handleResize) // Nettoyer l'écouteur lors du démontage
  }, [])

  // Mise à jour du canvas selon la largeur et la hauteur dynamiques
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = canvasWidth // Définir la largeur du canvas
      canvas.height = canvasHeight // Définir la hauteur du canvas
    }
  }, [canvasWidth, canvasHeight]) // Mise à jour lors du redimensionnement

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <div className="w-[300px] p-6 space-y-6 bg-gray-900 text-gray-100">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="mt-4 cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-800 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isRunning ? 'Stop' : 'Start'}
        </button>

        <div className="space-y-4">
          <div>
            <label htmlFor="fps" className="block text-sm font-semibold">
              FPS:
            </label>
            <input
              id="fps"
              type="number"
              value={fps}
              onChange={(e) => setFps(Number(e.target.value))}
              min="1"
              max="60"
              className="w-full p-2 mt-1 bg-indigo-800 text-white rounded-md"
            />
          </div>

          <div>
            <label htmlFor="bgColor" className="block text-sm font-semibold">
              Couleur de fond:
            </label>
            <input
              id="bgColor"
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className=" p-2 mt-1 bg-indigo-800 text-white rounded-md"
            />
          </div>

          <div>
            <label htmlFor="cellColor" className="block text-sm font-semibold">
              Couleur des cellules:
            </label>
            <input
              id="cellColor"
              type="color"
              value={cellColor}
              onChange={(e) => setCellColor(e.target.value)}
              className=" p-2 mt-1 bg-indigo-800 text-white rounded-md"
            />
          </div>

          <div>
            <label htmlFor="gridWidth" className="block text-sm font-semibold">
              Largeur:
            </label>
            <input
              id="gridWidth"
              type="number"
              value={gridWidth}
              onChange={(e) => updateWidth(Number(e.target.value))}
              min="10"
              max="2000"
              className="w-full p-2 mt-1 bg-indigo-800 text-white rounded-md"
            />
          </div>

          <div>
            <label htmlFor="showGrid" className="block text-sm font-semibold">
              Afficher la grille:
            </label>
            <input
              id="showGrid"
              type="checkbox"
              checked={showGrid}
              onChange={(e) => updateShowGrid(e.target.checked)}
              className=" p-2 mt-2 bg-indigo-200 text-white rounded-md"
            />
          </div>

          <button
            onClick={generateRandomUniverse}
            className="mt-4 cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-800 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Relancer l'univers
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} className="flex-1" />
    </div>
  )
}

export default App

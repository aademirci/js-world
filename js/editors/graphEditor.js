class GraphEditor {
    constructor(viewport, graph) {
        this.viewport = viewport
        this.canvas = viewport.canvas
        this.graph = graph

        this.ctx = this.canvas.getContext('2d')

        this.selected = null
        this.hovered = null
        this.dragging = false
        this.mouse = null
        this.segments = []
    }

    enable() {
        this.#addEventListeners()
    }

    disable() {
        this.#removeEventListeners()
        this.selected = false
        this.hovered = false
    }

    #addEventListeners() {
        this.boundMouseDown = this.#handleMouseDown.bind(this)
        this.boundMouseMove = this.#handleMouseMove.bind(this)
        this.boundMouseUp = this.#handleMouseUp.bind(this)
        this.boundContextMenu = e => e.preventDefault()
        this.canvas.addEventListener('mousedown', this.boundMouseDown)
        this.canvas.addEventListener('mousemove', this.boundMouseMove)
        this.canvas.addEventListener('mouseup', this.boundMouseUp)
        this.canvas.addEventListener('contextmenu', this.boundContextMenu)
    }

    #removeEventListeners() {
        this.canvas.removeEventListener('mousedown', this.boundMouseDown)
        this.canvas.removeEventListener('mousemove', this.boundMouseMove)
        this.canvas.removeEventListener('mouseup', this.boundMouseUp)
        this.canvas.removeEventListener('contextmenu', this.boundContextMenu)
    }

    #handleMouseMove(e) {
        this.mouse = this.viewport.getMouse(e, true)
        this.hovered = getNearestPoint(this.mouse, this.graph.points, 10)
        if (this.dragging == true) {
            this.selected.x = this.mouse.x
            this.selected.y = this.mouse.y
            this.segments = this.graph.getSegmentsWithPoint(this.selected) 
        }
    }

    #handleMouseDown(e) {
        if (e.button == 2) { // right click
            if (this.selected) {
                this.selected = null
            } else if (this.hovered) {
                this.#removePoint(this.hovered)
            }
        }
        if (e.button == 0) { // left click
            let onSegment = false
            if (this.viewport.keyDown) {
                return
            }
            if (this.hovered) {
                this.#select(this.hovered)
                this.dragging = true
                return
            }
            this.graph.addPoint(this.mouse)
            if (this.selected) {
                onSegment = this.graph.onSegment(this.selected, this.mouse) 
            }
            this.#select(this.mouse, onSegment)
            this.hovered = this.mouse
        }
    }

    #handleMouseUp(e) {
        if (e.button == 0) { 
            this.dragging = false
            if (this.segments.length == 1) {
                if (this.graph.onSegment(this.segments[0].p1, this.selected)) {
                    this.graph.removeSegment(this.segments[0])
                }
            }
        }
    }

    #select(point, onSegment) {
        if (this.selected && !onSegment) {
            this.graph.tryAddSegment(new Segment(this.selected, point))
        }
        this.selected = point
    }

    #removePoint(point) {
        this.graph.removePoint(point)
        this.hovered = null
        if (this.selected == point) {
            this.selected = null
        }
    }

    dispose() {
        this.graph.dispose()
        this.selected = null
        this.hovered = null
    }

    display() {
        this.graph.draw(this.ctx)
        if (this.hovered) {
            this.hovered.draw(this.ctx, { fill: true })
        }
        if (this.selected) {
            const intent = this.hovered ? this.hovered : this.mouse
            new Segment(this.selected, intent).draw(this.ctx, { dash: [3, 3] })
            this.selected.draw(this.ctx, { outline: true })
        }
    }
}
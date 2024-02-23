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

        this.#addEventListeners()
    }

    #addEventListeners() {
        this.canvas.addEventListener('mousedown', this.#handleMouseDown.bind(this))
        this.canvas.addEventListener('mousemove', this.#handleMouseMove.bind(this))
        this.canvas.addEventListener('contextmenu', e => e.preventDefault())
        this.canvas.addEventListener('mouseup', () => this.dragging = false)
    }

    #handleMouseMove(e) {
        this.mouse = this.viewport.getMouse(e, true)
        this.hovered = getNearestPoint(this.mouse, this.graph.points, 10)
        if (this.dragging == true) {
            this.selected.x = this.mouse.x
            this.selected.y = this.mouse.y
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
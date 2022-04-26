// Kudos to https://www.youtube.com/watch?v=5MUsKgU6i0I&list=PLpPnRKq7eNW3We9VdCfx9fprhqXHwTPXL&index=18

const canvas  = document.querySelector('canvas')
const c = canvas.getContext('2d')
const tb = document.querySelector('.top-bar')
const about = document.querySelector('#about h1')

canvas.width = getCanvasDim().xDim
canvas.height = getCanvasDim().yDim

let botTakeover = true
const mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2
}

addEventListener('resize', () => {
    if (mouse.x == canvas.width / 2) {
        mouse.x = getCanvasDim().xDim / 2
        mouse.y = getCanvasDim().yDim / 2
    }
    canvas.width = getCanvasDim().xDim
    canvas.height = getCanvasDim().yDim
})
addEventListener('mousemove', (event) => {
    if (botTakeover) {
    // if ((event.clientX > canvas.width * 0.9) || (event.clientY > canvas.height * 0.9)) {
        mouse.x = Math.random() * getCanvasDim().xDim
        mouse.y = Math.random() * getCanvasDim().yDim
        // console.log(mouse.x)
        // mouse.y = randomDoodles()
    } else {
        mouse.x = event.clientX
        mouse.y = event.clientY
    }
})
canvas.addEventListener('mouseleave', (event) => {
    botTakeover = true
})
canvas.addEventListener('mouseenter', (event) => {
    botTakeover = false
})

const spiral = {
    center: {
        x: getCanvasDim().xDim / 2,
        y: getCanvasDim().yDim / 2
    },
    current: {
        radius: 135,
        angle: 0,
        x: 0,
        y: 0,
        direction: 1
    },
    reset: function() {
        this.center.x = getCanvasDim().xDim / 2,
        this.center.y = getCanvasDim().yDim / 2,
        this.current.radius = 135,
        this.current.angle = 0,
        this.current.x = this.center.x,
        this.current.y = this.center.y
        this.current.direction = this.current.direction * -1 
    },
    doodle: function() {
        console.log(this.current.radius)
        this.current.radius += 0.1
        this.current.angle =this.current.angle + this.current.direction * (2 * Math.PI) / 360
        xx = this.center.x + this.current.radius * Math.cos(this.current.angle)
        yy = this.center.y + this.current.radius * Math.sin(this.current.angle)
        if (isOutOfBounds(xx, yy)) {
            this.reset()
            this.doodle()
        }
        else {
            return [xx, yy]
        }
    }
}

// Class for creating single particle.
class Particle {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw(x=this.x, y=this.y, radius=this.radius, color=this.color) {
        c.beginPath()
        c.arc(x, y, radius, 0, Math.PI * 2)
        c.fillStyle = color
        c.fill()
        c.closePath()
    }

    update(x=this.x, y=this.y, radius=this.radius, color=this.color) {
        this.draw(x, y, radius, color) 
    }
}

// Class for bundle of particles.
class ParticleBundle {
    constructor(x, y, particleRadius, color='blue', numParticles=10) {
        this.x = x
        this.y = y
        this.particleRadius = particleRadius
        this.color = color

        this.bundleRadius = 0
        this.velocity = 3
        this.numParticles = numParticles
        this.radPerParticle = 2 * Math.PI / this.numParticles
        this.rotateRad = 0.180 / Math.PI
        this.bundle = this.addParticles()
    }

    addParticles() {
        let particles = []
        for (let i = 0; i < this.numParticles; i++) {
            particles.push(new Particle(
                this.x,
                this.y,
                this.particleRadius,
                this.color
            ))
        }
        return particles
    }

    update() {
        for (let i = 0; i < this.numParticles; i++) {
            let particle = this.bundle[i]
            particle.x = this.x + this.bundleRadius * Math.cos(this.radPerParticle * i)
            particle.y = this.y + this.bundleRadius * Math.sin(this.radPerParticle * i)
            particle.update()
        }
        this.bundleRadius += this.velocity
    }
}

// Class for bundles on screen.
class BundlesOnScreen {
    constructor(bundlesList=[]) {
        this.bundles = bundlesList
        this.numBundles
        this.delay = 100
        this.hueRadians = 0
    }

    get numBundles() {
        return this.bundles.length
    }

    generateBundle(
        that=this, 
        x=canvas.width/2, 
        y=canvas.height/2, 
        radius=5, 
        color='blue', 
        numParticles=30
        ) {
            const hue = 180 * (Math.sin(that.hueRadians) + 1)
            that.hueRadians += 0.01
            color = `hsl(${hue}, 50%, 50%)`
            setTimeout(
                that.generateBundle, 
                that.delay, 
                that, 
                mouse.x, 
                mouse.y, 
                radius, 
                color, 
                numParticles
                )
            let pb = new ParticleBundle(x, y, radius, color, numParticles)
            that.bundles.push(pb)
    }

    update() {
        let i = 0
        this.bundles.forEach(bundle => {
            if (bundle.bundleRadius > Math.max(canvas.width, canvas.height)) {
                this.bundles.splice(i, 1)
            } else{
                bundle.update()
            }
            i++
        })
        // console.log(this.numBundles)
    }

}

function getCanvasDim() {
    let xDim = innerWidth
    let yDim = innerHeight - tb.clientHeight - 2*about.clientHeight
    return { xDim, yDim }
}

function randomDoodles(x=mouse.x, y=mouse.y) {
    xx = x
    yy = y
    radius = 8
    do {
        angle = Math.random() * 2 * Math.PI
        xx = x + radius * Math.cos(angle)
        yy = y + radius * Math.sin(angle)
    } while(isOutOfBounds(xx, yy))
    return [xx, yy]
}

function isOutOfBounds(x, y, lowerX=0, lowerY=0, higherX=0.99*getCanvasDim().xDim, higherY=0.99*getCanvasDim().yDim) {
    if ((x <= lowerX) || (y <=lowerY) || (x >= higherX) || (y >= higherY)) {
        return true
    } else {
        return false
    }
}

function animate() {
    requestAnimationFrame(animate)
    if (botTakeover) {
        [mouse.x, mouse.y] = spiral.doodle()
    }
    console.log(bos.delay / 10000)
    c.fillStyle = `rgba(0, 0, 0, ${bos.delay / 10000})`
    c.fillRect(0, 0, canvas.width, canvas.height)

    bos.update()
}

bos = new BundlesOnScreen()
animate()
bos.generateBundle(bos)
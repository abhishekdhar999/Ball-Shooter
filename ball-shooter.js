const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const c = canvas.getContext('2d');
const bigScore = document.querySelector('#big-score')
const modelEl = document.querySelector('#modelEl')
const score = document.querySelector('#scoreEl')
const startGameBtn = document.querySelector('#start-game-btn')
const mouse = {
    x: canvas.width,
    y: canvas.height
}

addEventListener('resize', function () {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    // init();
})
class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;

        this.draw = function () {
            c.beginPath();
            c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
            c.fillStyle = this.color;
            c.fill()
            c.closePath();
        }
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity

        this.draw = function () {
            c.beginPath();
            c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
            c.fillStyle = this.color;
            c.fill()
            c.closePath();
        }

        this.update = function () {
            this.x = this.x + this.velocity.x;
            this.y = this.y + this.velocity.y;
            this.draw();
        }
    }
}

class Enemies {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;


        this.draw = function () {
            c.beginPath();
            c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
            c.fillStyle = this.color;
            c.fill()
            c.closePath();
        }

        this.update = function () {
            this.x = this.x + this.velocity.x;
            this.y = this.y + this.velocity.y;
            this.draw();
        }
    }

}
const friction = 0.99
class Particles {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 0.5;

        this.draw = function () {
            c.save();
            c.globalAlpha = this.alpha;
            c.beginPath();
            c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
            c.fillStyle = this.color;
            c.fill()
            c.closePath();
            c.restore()
        }

        this.update = function () {
            this.velocity.x  *= friction
            this.velocity.y *=friction
            this.x = this.x + this.velocity.x;
            this.y = this.y + this.velocity.y;
            this.alpha  -= 0.01
            this.draw();

        }
    }

}
// const projectile =  new Projectile(canvas.width/2,canvas.height/2,5,red)
let player;
let projectileArray = [];
let enemiesArray = [];
let particles = [];
function init() {
     projectileArray = [];
     enemiesArray = [];
     particles = [];
     scores =0
     score.innerHTML = scores
     bigScore.innerHTML = scores
}

let hueincriment = 0;
function spawnEnemies() {

    setInterval(() => {
        const radius = Math.random() * (30 - 4) + 4;
        let x
        let y
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;;
        }



        const radian = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);

        const velocity = {
            x: Math.cos(radian)*0.5,
            y: Math.sin(radian)*0.5
        }
        enemiesArray.push(new Enemies(x, y, radius, `hsl(${hueincriment*360},50%,50%)`, velocity))
        hueincriment +=0.1
    }, 2000)
    
}
console.log(enemiesArray)

let animationid
let scores = 0;
function animate() {
    animationid = requestAnimationFrame(animate)
    c.fillStyle = "rgba(0,0,0,0.1)"
    c.fillRect(0, 0, canvas.width, canvas.height)
    // for player
    player = new Player(canvas.width / 2, canvas.height / 2, 15, "white");
    player.draw();

    // Create explosion
    particles.forEach((particle,index)=>{
        if(particle.alpha <=0){
            setTimeout(()=>{
                particles.splice(index,1)
            },0)
           
        }else{
            particle.update();
        }
       
    })
    // for shooter 
    projectileArray.forEach((projectile, index) => {
        projectile.update();
       
        if (projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width ||
            projectile.y - projectile.radius > canvas.width || projectile.y + projectile.radius < 0) {
            projectileArray.splice(index, 1)
        }
    })

    // for enemies
    enemiesArray.forEach((enemy, index) => {
        enemy.update();

        projectileArray.forEach((projectile, projectileindex) => {
            const distance = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            // when projectile touches enemy
            if (distance - projectile.radius - enemy.radius < 1) {

                   
                // FOR PARTICLES TO EXPLODDE
                for(let i=0;i<enemy.radius *2;i++){
                    particles.push(new Particles(enemy.x,enemy.y,Math.random()*4,enemy.color,{
                        x:(Math.random() - 0.5)*(Math.random()*6),
                        y:(Math.random()-0.5)*(Math.random()*6)
                    }));
                   
                }
                setTimeout(() => {
                    if(enemy.radius-10 >10 ){
                        gsap.to(enemy,{
                            radius:enemy.radius -10
                        })
                       enemy.radius -=5
                       setTimeout(()=>{
                        scores +=50;
                            score.innerHTML = scores
                        projectileArray.splice(projectileindex, 1)
                       })
                    }else{
                        setTimeout(()=>{
                            scores +=100;
                            score.innerHTML = scores
                            enemiesArray.splice(index, 1);
                            projectileArray.splice(projectileindex, 1)
                        })
                        
                    }
                    
                })

            }
        })
            // when enemy touches palyer
        const playerdistancewithenemies = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (playerdistancewithenemies - player.radius - enemy.radius < 1) {

            cancelAnimationFrame(animationid)
            modelEl.style.display ='block'
            bigScore.innerHTML = scores
        }
    })


}
//  let radian = Math.atan2(canvas.width/2-mouse.x,canvas.height-mouse.y)
let distance = Math.hypot(canvas.width / 2 - mouse.x, canvas.height - mouse.y);
addEventListener('click', (event) => {


    const radian = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2);

    const velocity = {
        x: Math.cos(radian) * 4,
        y: Math.sin(radian) * 4
    }

    projectileArray.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, "white", velocity));


})


  startGameBtn.addEventListener('click',()=>{
    modelEl.style.display ='none'
    init()
    
    spawnEnemies();
  animate();
  }) 
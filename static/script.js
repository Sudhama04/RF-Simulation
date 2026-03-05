const snrSlider=document.getElementById("snr")
const snrVal=document.getElementById("snr_val")

snrSlider.oninput=()=>{
snrVal.innerText=snrSlider.value
}

function openPanel(id){

document.querySelectorAll(".panel")
.forEach(p=>p.classList.remove("active"))

let panel=document.getElementById(id)

panel.classList.add("active")

resizePlot(id)

}

function resizePlot(id){

setTimeout(()=>{
if(window.Plotly){
Plotly.Plots.resize(document.getElementById(id))
}
},200)

}

function runSimulation(){

let mod=document.getElementById("modulation").value
let channel=document.getElementById("channel").value
let snr=document.getElementById("snr").value

fetch("/simulate",{

method:"POST",
headers:{"Content-Type":"application/json"},

body:JSON.stringify({
modulation:mod,
channel:channel,
snr:snr
})

})

.then(res=>res.json())

.then(data=>{

document.getElementById("ber").innerText=data.ber
document.getElementById("selected_mod").innerText=data.modulation

Plotly.newPlot("waveform_panel",[{
y:data.waveform,
type:"scatter",
line:{color:"#4cc9f0"}
}],{title:"Signal Waveform"},{responsive:true})

Plotly.newPlot("const_panel",[{
x:data.real,
y:data.imag,
mode:"markers",
type:"scatter",
marker:{color:"#4cc9f0"}
}],{title:"Constellation"},{responsive:true})

Plotly.newPlot("const3d_panel",[{
x:data.real,
y:data.imag,
z:data.real.map((v,i)=>Math.sqrt(v*v+data.imag[i]*data.imag[i])),
mode:"markers",
type:"scatter3d"
}],{title:"3D Constellation"},{responsive:true})

Plotly.newPlot("spectrum_panel",[{
y:data.spectrum,
type:"scatter"
}],{title:"OFDM Spectrum"},{responsive:true})

animateSignal()

})

}

fetch("/ber_curve")

.then(res=>res.json())

.then(data=>{

Plotly.newPlot("ber_panel",[{
x:data.snr,
y:data.ber,
type:"scatter"
}],{title:"BER vs SNR"},{responsive:true})

})

function animateSignal(){

let canvas=document.getElementById("signalCanvas")
let ctx=canvas.getContext("2d")

let particles=[]

for(let i=0;i<50;i++){

particles.push({
x:Math.random()*canvas.width,
y:Math.random()*canvas.height,
vx:(Math.random()-0.5)*2,
vy:(Math.random()-0.5)*2
})

}

function draw(){

ctx.fillStyle="#232836"
ctx.fillRect(0,0,canvas.width,canvas.height)

ctx.fillStyle="#4cc9f0"

particles.forEach(p=>{

p.x+=p.vx
p.y+=p.vy

if(p.x<0||p.x>canvas.width) p.vx*=-1
if(p.y<0||p.y>canvas.height) p.vy*=-1

ctx.beginPath()
ctx.arc(p.x,p.y,3,0,Math.PI*2)
ctx.fill()

})

requestAnimationFrame(draw)

}

draw()

}

function startRFSimulation(){

const container=document.getElementById("rf3d_container")

container.innerHTML=""

const scene=new THREE.Scene()
scene.background=new THREE.Color(0x1a1f2b)

const camera=new THREE.PerspectiveCamera(
60,
container.clientWidth/container.clientHeight,
0.1,
1000
)

camera.position.set(0,6,12)

const renderer=new THREE.WebGLRenderer({antialias:true})

renderer.setSize(container.clientWidth,container.clientHeight)

container.appendChild(renderer.domElement)

const grid=new THREE.GridHelper(20,20)

scene.add(grid)

const tower=new THREE.Mesh(
new THREE.CylinderGeometry(0.3,0.5,5,16),
new THREE.MeshStandardMaterial({color:0x4cc9f0})
)

tower.position.y=2.5
scene.add(tower)

const antenna=new THREE.Mesh(
new THREE.SphereGeometry(0.6,32,32),
new THREE.MeshStandardMaterial({color:0x72efdd})
)

antenna.position.y=5
scene.add(antenna)

const light=new THREE.PointLight(0xffffff,1)
light.position.set(10,10,10)
scene.add(light)

let waves=[]

for(let i=0;i<6;i++){

let ring=new THREE.Mesh(
new THREE.RingGeometry(1,1.05,64),
new THREE.MeshBasicMaterial({color:0x4cc9f0,side:THREE.DoubleSide})
)

ring.rotation.x=Math.PI/2
ring.scale.set(0.1,0.1,0.1)

scene.add(ring)
waves.push(ring)

}

function animate(){

requestAnimationFrame(animate)

waves.forEach(r=>{
r.scale.x+=0.02
r.scale.y+=0.02

if(r.scale.x>10){
r.scale.set(0.1,0.1,0.1)
}
})

renderer.render(scene,camera)

}

animate()

}

openPanel("waveform_panel")

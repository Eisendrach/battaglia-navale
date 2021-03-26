const express = require("express")
const app = express()
const fetch = require("node-fetch")

const codename = "lorem ipsum"
const password = "lorem ipsum"
const points = 0
const maxH = 0
const maxW = 0
const register_res = fetch(`http://localhost:8080/register?codename=${codename}&pass=${password}`)
.then(register_res=register_res.json())
.then(maxH=register_res.H)
.then(maxW=register_res.W)


const signup_res = fetch(`http://localhost:8080/singup?codename=${codename}&pass=${password}`).json()

          if(targetx > maxW || targetx < 0 || targety > maxH || targety < 0){
               break
          }

BombardamentOnRow((x, y)=>{
     x=0
     while(x < maxW){
          Aim(x, y)
          x+=1
          if (score ==50){break}
     }  
})

BombardamentOnColumn((x, y)=>{
     y=0
     while(y<maxH){
          Aim(x, y)
          y+=1
          if (score ==50){break}
     }
})

FindTarget((score)=>{
     const targetx =0
     const targety =0
     while (score =0){
          while(targetx < maxW){
               while(targety < maxH){
                    Aim(targetx, targety)
                    targety+=1
               }
               targetx+=1
          }
     }
     while(score=10){
          const hitx= targetx
          const hity= targety
          BombardamentOnColumn(hitx, targety)
          BombardamentOnRow(targetx, hity)
     }
})


Aim ((x,y) => {
     const hit_res = fetch(`http://localhost:8080/fire?x=${x}&y=${y}&team=${codename}&password=${password}`)
     .then(hit_res=hit_res.json())
     .then(points = hit_res.score)
})

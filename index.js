const faker = require("faker")
const express = require("express")
const app = new express()
const PORT = 8080

const teams = {
  pippo: {
    name: "pippo",
    password: "",
    score: 0,
    killedShips: [],
    firedBullets: 0,
    lastFiredBullet: new Date().getTime()
  }
}
const field = []
const ships = []

const W = process.argv[2] || 6
const H = process.argv[3] || 6
const S = process.argv[4] || 10

for (let y = 0; y < H; y++) {
  const row = []
  for (let x = 0; x < W; x++) {
    row.push({
      team: null,
      x,
      y,
      ship: null,
      hit: false
    })    
  } 
  field.push(row)
}

let id = 1
for (let i = 0; i < S; i++) {
  const maxHp = faker.random.number({ min: 1, max: 6 })
  const vertical = faker.random.boolean()
  console.log({ vertical, maxHp })

  const ship = {
    id,
    name: faker.name.firstName(),
    x: faker.random.number({ min: 0, max: vertical ? W - 1 : W - maxHp }),
    y: faker.random.number({ min: 0, max: vertical ? H - maxHp : H - 1 }),
    vertical,
    maxHp,
    curHp: 4,
    alive: true,
    killer: null
  }

  let found = false
  for (let e = 0; e < ship.maxHp; e++) {
    const x = ship.vertical ? ship.x : ship.x + e
    const y = ship.vertical ? ship.y + e : ship.y
    if (field[y][x].ship) {
      found = true
      break
    }
  }

  if (!found) {
    for (let e = 0; e < ship.maxHp; e++) {
      const x = ship.vertical ? ship.x : ship.x + e
      const y = ship.vertical ? ship.y + e : ship.y
      field[y][x].ship = ship
    }
  
    ships.push(ship)
    id ++
  }
}

app.get("/", ({ query: { format } }, res) => {
  const visibleField = field.map(row => row.map(cell => ({ 
    x: cell.x,
    y: cell.y,
    hit: cell.hit,
    team: cell.team,
    ship: cell.hit ? 
      cell.ship ? { id: cell.ship.id, name: cell.ship.name, alive: cell.ship.alive, killer: cell.ship.killer } : null 
      : null
  })))

  const visibleShipInfo = ships.map(ship => ({
    id: ship.id,
    name: ship.name,
    alive: ship.alive,
    killer: ship.killer
  }))

  if ( format === "json") {
    res.json({ 
      field: visibleField,
      ships: visibleShipInfo
    })
  } else {
    // html format field
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>battaglia navale</title>
      <style>
        table, td, th {
          border: 1px solid black;
        }

        td {
          width: 40px;
          height: 40px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
      </style>
    </head>
    <body>
      <table>
        <tbody>
          ${visibleField.map(row => `<tr>${row.map(cell => `<td>${cell.ship ? cell.ship.name : ""}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    </body>
    </html>
    `)
  }
})

app.get("/score", (req, res) => {
  res.json([])
})

app.signup("/signup", (req, res) => {
  //team password
})
app.get("/fire", ({ query: { x, y, team, password } }, res) => { 
   const FiringTeamData = teams[team]
   const resultmessage = ""
   if (FiringTeamData.lastFiredBullet + new Date().getTime() < 1000){
     resultmessage = "artiglieria in ricarica, a breve sarà disponibile"
   }else{     
    FiringTeamData.firedBullets +=1
    FiringTeamData.lastFiredBullet = new Date().getTime()
      if (x>W || y>H || x<0 || y<0 ){
        FiringTeamData.score -= 5 
        resultmessage = "Il tuo colpo è uscito dal tabellone, hai subito una penalità di -5 punti"
      }else{
        const FiredCell = field[x][y]
        if(FiredCell.hit){
          FiringTeamData.score -=2
          resultmessage = "Hai colpito una cella già colpita, hai subito una penalità di -2 punti"
        }else{
          FiredCell.hit = true
          if(FiredCell.ship){
            const FiredShip = FiredCell.ship
            FiredShip.curHp -=1 
            if(FiredShip.curHp == 0){
                FiredShip.alive = false
                FiredShip.killer = FiringTeamData.name
                FiringTeamData.killedShips.push(FiredShip.id)
                FiringTeamData.score +=3
                resultmessage= `Hai colpito ed affondato la nave ${FiredShip.name}`
            }else{
                FiringTeamData.score += 1
                resultmessage = "Hai colpito una nave che però galleggia ancora"
            }
          }else{
            resultmessage = "Hai fatto buco nell'acqua"
          }
        }
      }
    }
   res.send({score: FiringTeamData.score, message:resultmessage})
  /*
    1. segnare la cella come colpita
    2. segnare eventualmente la nave come colpita (ridurre gli hp e verificare se e' morta)
    3. assegnare il team sia alla cella che alla nave (eventuale)
    4. assicurarsi che il team che chiama l'endpoint non possa chiamarlo per piu' di una volta al secondo (opzionale)
    5. definire un punteggio conseguente all'attacco:
      a. punteggio molto negativo se si spara fuori dal campo
      b. punteggio 0 se acqua
      c. punteggio negativo se spari su casella gia' colpita
      c. punteggio positivo se spari su nave ma non la uccidi
      d. punteggio molto positivo se spari su nave e la uccidi
  */
  res.json({
    x, y, team
  })
})

app.all("*", (req, res) => {
  res.sendStatus(404)
})

app.listen(PORT, () => console.log("App listening on port %O", PORT))
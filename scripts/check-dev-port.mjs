// Corre antes de `pnpm dev`. Si el puerto ya responde, casi siempre es otro servidor de
// desarrollo del mismo proyecto: los dos escriben en .next y cada uno le borra los
// chunks al otro, asi que la pagina aparece sin CSS.
//
// Next, por su cuenta, se mueve al puerto siguiente sin avisar del problema real, y el
// choque sobre .next ocurre igual.
//
// La comprobacion es intentar CONECTARSE, no intentar escuchar: en Windows, Node abre
// los sockets con SO_REUSEADDR y un segundo bind al mismo puerto funciona igual, asi
// que escuchar no prueba nada. Conectarse si.
import { connect } from "node:net"

const port = Number(process.env.PORT) || 3000

const socket = connect({ port, host: "127.0.0.1" })
socket.setTimeout(1500)

const free = () => {
  socket.destroy()
  process.exit(0)
}

socket.once("error", free)
socket.once("timeout", free)

socket.once("connect", () => {
  socket.destroy()
  console.error(`\n  Port ${port} is already answering.`)
  console.error("  There is very likely another dev server running for this project.")
  console.error("  Two of them share .next and overwrite each other: the page loses its CSS.\n")
  console.error("  Use the one already running, or close it first:")
  console.error(`    netstat -ano | findstr :${port}\n`)
  process.exit(1)
})

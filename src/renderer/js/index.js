const information = document.getElementById('info')

information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`

const func = async () => {
  const response = await window.versions.ping()
  console.log("response", response) // prints out 'pong'
}

func()

document.getElementById("click-test").addEventListener("click", () => {
  window.versions.openDialog("Testando dialog!!")
})
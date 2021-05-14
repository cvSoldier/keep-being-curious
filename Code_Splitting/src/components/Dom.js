const div = document.createElement('div')
for(let i = 0; i < 10; i++) {
  var p = document.createElement('p')
  p.innerHTML = `列表项${i}`
  div.appendChild(p);
}

const root = document.getElementById('app')
root.setAttribute('style', 'display: flex; justify-content: center;')
root.appendChild(div)

export default div

let saldo = 0;

function render() {
  document.querySelector('#app').innerHTML = `
    <div class="container">
      <h1>FinanceHub 💰</h1>

      <p id="saldo">Saldo: R$ ${saldo}</p>

      <button id="btnAdd">Adicionar R$ 10</button>
    </div>
  `;

  document.getElementById("btnAdd").addEventListener("click", () => {
    saldo += 10;
    render();
  });
}

render();
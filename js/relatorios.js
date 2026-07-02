console.log("carregou: relatorios.js");

const MESES = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
];

function fecharMes() {

    const dados = carregarDados();

    if (!dados.relatorios)
        dados.relatorios = [];

    const totais = calcularTotais();

    const hoje = new Date();

    const ano = hoje.getFullYear();

    const mes = hoje.getMonth();

    const existe = dados.relatorios.find(r =>
        r.ano == ano &&
        r.mes == mes
    );

    if (existe) {

        alert("Este mês já foi fechado.");

        return;

    }

    dados.relatorios.push({

        ano,
        mes,

        data: hoje.toLocaleDateString("pt-BR"),

        receita: totais.rendaTotal,

        salario: totais.dados.salario,

        rendaExtra: totais.totalRendaExtra,

        gastos: totais.gastosNormais,

        lazer: totais.gastosLazer,

        cartoes: totais.totalCartoesMensal,

        investimentos: totais.totalInvestimentos,

        reserva: totais.totalReserva,

        saldo: totais.saldo,

        quantidadeGastos: totais.dados.gastos.length,

        quantidadeInvestimentos: totais.dados.investimentos.length,

        quantidadeCartoes: totais.dados.cartoes.length,

        quantidadeRendas: totais.dados.rendasExtras.length,

        metas: totais.dados.metas.length

    });

    salvarDados(dados);

    alert("Mês fechado com sucesso!");

    carregarRelatorios();

}

function carregarRelatorios() {

    const dados = carregarDados();

    if (!dados.relatorios)
        dados.relatorios = [];

    const calendario = document.getElementById("calendarioRelatorios");

    if (!calendario)
        return;

    calendario.innerHTML = "";

    const anoSelect = document.getElementById("anoRelatorio");

    if (anoSelect) {

        if (anoSelect.options.length == 0) {

            const atual = new Date().getFullYear();

            for (let i = atual - 5; i <= atual + 5; i++) {

                anoSelect.innerHTML += `
                    <option value="${i}">
                        ${i}
                    </option>
                `;

            }

            anoSelect.value = atual;

        }

    }

    const ano = anoSelect ? Number(anoSelect.value) : new Date().getFullYear();

    for (let i = 0; i < 12; i++) {

        const relatorio = dados.relatorios.find(r =>
            r.ano == ano &&
            r.mes == i
        );

        calendario.innerHTML += `

        <div
            class="mes-relatorio ${relatorio ? "mes-fechado" : "mes-aberto"}"
            onclick="abrirRelatorio(${ano},${i})">

            <h4>${MESES[i]}</h4>

            <p>

            ${relatorio
                ? "✅ Fechado"
                : "Em aberto"}

            </p>

        </div>

        `;

    }

}

function abrirRelatorio(ano, mes) {

    const dados = carregarDados();

    const r = dados.relatorios.find(x =>
        x.ano == ano &&
        x.mes == mes
    );

    const painel = document.getElementById("dashboardHistorico");

    if (!painel)
        return;

    if (!r) {

        painel.innerHTML = `

        <div class="cardResumo">

        <h3>

        Nenhum relatório encontrado.

        </h3>

        </div>

        `;

        return;

    }

    painel.innerHTML = `

<div class="cardResumo">

<h2>${MESES[r.mes]} ${r.ano}</h2>

<p>Fechado em ${r.data}</p>

</div>

<div class="cardResumo">

<h3>💰 Receita</h3>

<h2>${formatarMoeda(r.receita)}</h2>

</div>

<div class="cardResumo">

<h3>💸 Gastos</h3>

<h2>${formatarMoeda(r.gastos)}</h2>

</div>

<div class="cardResumo">

<h3>💳 Cartões</h3>

<h2>${formatarMoeda(r.cartoes)}</h2>

</div>

<div class="cardResumo">

<h3>📈 Investimentos</h3>

<h2>${formatarMoeda(r.investimentos)}</h2>

</div>

<div class="cardResumo">

<h3>🛡 Reserva</h3>

<h2>${formatarMoeda(r.reserva)}</h2>

</div>

<div class="cardResumo">

<h3>🍔 Lazer</h3>

<h2>${formatarMoeda(r.lazer)}</h2>

</div>

<div class="cardResumo">

<h3>💵 Saldo</h3>

<h2 style="color:${r.saldo>=0?"#2ecc71":"#ff4d4d"}">

${formatarMoeda(r.saldo)}

</h2>

</div>

<div class="cardResumo">

<h3>📋 Gastos cadastrados</h3>

<h2>${r.quantidadeGastos}</h2>

</div>

<div class="cardResumo">

<h3>💳 Compras</h3>

<h2>${r.quantidadeCartoes}</h2>

</div>

<div class="cardResumo">

<h3>📈 Investimentos</h3>

<h2>${r.quantidadeInvestimentos}</h2>

</div>

<div class="cardResumo">

<h3>💵 Rendas Extras</h3>

<h2>${r.quantidadeRendas}</h2>

</div>

<div class="cardResumo">

<h3>🎯 Metas</h3>

<h2>${r.metas}</h2>

</div>

`;

}

function compararMeses(ano1,mes1,ano2,mes2){

    const dados=carregarDados();

    const a=dados.relatorios.find(r=>r.ano==ano1 && r.mes==mes1);

    const b=dados.relatorios.find(r=>r.ano==ano2 && r.mes==mes2);

    if(!a || !b){

        alert("Relatórios não encontrados.");

        return;

    }

    console.table({

        primeiro:a,

        segundo:b

    });

}

window.addEventListener("load",()=>{

    setTimeout(()=>{

        carregarRelatorios();

    },300);

});
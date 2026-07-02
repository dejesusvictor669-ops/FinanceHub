console.log("carregou: relatorios.js");

const MESES = [
    "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

// ======================================
// FECHAR MÊS — salva um snapshot dos dados atuais
// ======================================

function fecharMes() {
    const dados = carregarDados();
    if (!dados.relatorios) dados.relatorios = [];

    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();

    const jaExiste = dados.relatorios.find(r => r.ano === ano && r.mes === mes);
    if (jaExiste) {
        alert("Este mês já foi fechado.");
        return;
    }

    const t = calcularTotais();

    dados.relatorios.push({
        ano,
        mes,
        fechadoEm: hoje.toLocaleDateString("pt-BR"),
        salario: t.dados.salario,
        rendaExtra: t.totalRendaExtra,
        receita: t.rendaTotal,
        gastosNormais: t.gastosNormais,
        gastosLazer: t.gastosLazer,
        cartoes: t.totalCartoesMensal,
        investimentos: t.totalInvestimentos,
        reserva: t.totalReserva,
        lazerOrcamento: t.lazerOrcamento,
        saldo: t.saldo,
        qtdGastos: t.dados.gastos.length,
        qtdCartoes: t.dados.cartoes.length,
        qtdInvestimentos: t.dados.investimentos.length,
        qtdRendas: t.dados.rendasExtras.length,
        qtdMetas: t.dados.metas.length
    });

    salvarDados(dados);
    alert(`${MESES[mes]} ${ano} fechado com sucesso!`);
    carregarRelatorios();
}

// ======================================
// REABRIR MÊS
// ======================================

function reabrirMes(ano, mes) {
    if (!confirm(`Reabrir ${MESES[mes]} ${ano}?`)) return;

    const dados = carregarDados();
    dados.relatorios = dados.relatorios.filter(r => !(r.ano === ano && r.mes === mes));
    salvarDados(dados);

    document.getElementById("dashboardHistorico").innerHTML = "";
    carregarRelatorios();
    alert("Mês reaberto.");
}

// ======================================
// CALENDÁRIO — grade dos 12 meses
// ======================================

function carregarRelatorios() {
    const dados = carregarDados();
    if (!dados.relatorios) dados.relatorios = [];

    const calendario = document.getElementById("calendarioRelatorios");
    if (!calendario) return;

    // monta o select de ano se ainda não tiver
    const anoSelect = document.getElementById("anoRelatorio");
    if (anoSelect && anoSelect.options.length === 0) {
        const anoAtual = new Date().getFullYear();
        for (let a = anoAtual - 3; a <= anoAtual + 2; a++) {
            anoSelect.innerHTML += `<option value="${a}">${a}</option>`;
        }
        anoSelect.value = anoAtual;
    }

    const ano = anoSelect ? Number(anoSelect.value) : new Date().getFullYear();

    calendario.innerHTML = "";

    for (let i = 0; i < 12; i++) {
        const rel = dados.relatorios.find(r => r.ano === ano && r.mes === i);
        const fechado = !!rel;

        calendario.innerHTML += `
            <div class="mes-relatorio ${fechado ? 'mes-fechado' : 'mes-aberto'}"
                 onclick="abrirRelatorio(${ano}, ${i})">
                <h4>${MESES[i]}</h4>
                <p>${fechado ? '✅ Fechado' : '📂 Em aberto'}</p>
                ${fechado ? `<small>${rel.fechadoEm}</small>` : ''}
            </div>
        `;
    }
}

// ======================================
// ABRIR RELATÓRIO DE UM MÊS
// ======================================

function abrirRelatorio(ano, mes) {
    const dados = carregarDados();
    const r = dados.relatorios ? dados.relatorios.find(x => x.ano === ano && x.mes === mes) : null;

    const painel = document.getElementById("dashboardHistorico");
    if (!painel) return;

    if (!r) {
        painel.innerHTML = `
            <div class="cardResumo">
                <h3>📂 ${MESES[mes]} ${ano}</h3>
                <p>Este mês ainda não foi fechado.</p>
            </div>
        `;
        return;
    }

    const linha = (emoji, label, valor, cor) => `
        <div class="cardResumo">
            <h3>${emoji} ${label}</h3>
            <h2 style="color:${cor || 'var(--text)'}">${formatarMoeda(valor)}</h2>
        </div>
    `;

    painel.innerHTML = `
        <div class="cardResumo" style="grid-column:1/-1;">
            <h2>📋 ${MESES[r.mes]} ${r.ano}</h2>
            <p style="color:var(--gray)">Fechado em ${r.fechadoEm}</p>
        </div>

        ${linha('💼', 'Salário base', r.salario, 'var(--success)')}
        ${linha('💵', 'Rendas extras', r.rendaExtra, 'var(--success)')}
        ${linha('🧾', 'Gastos normais', r.gastosNormais, 'var(--danger)')}
        ${linha('🎮', 'Gastos de lazer', r.gastosLazer, 'var(--danger)')}
        ${linha('💳', 'Parcelas cartão', r.cartoes, 'var(--danger)')}
        ${linha('📈', 'Investimentos', r.investimentos, 'var(--warning)')}
        ${linha('🛡️', 'Reserva', r.reserva, 'var(--warning)')}
        ${linha('🍔', 'Orçamento lazer', r.lazerOrcamento, 'var(--warning)')}
        ${linha('💰', 'Saldo final', r.saldo, r.saldo >= 0 ? 'var(--success)' : 'var(--danger)')}

        <div class="cardResumo">
            <h3>📊 Quantidades</h3>
            <p>🧾 ${r.qtdGastos} gastos</p>
            <p>💳 ${r.qtdCartoes} compras no cartão</p>
            <p>📈 ${r.qtdInvestimentos} aportes</p>
            <p>💵 ${r.qtdRendas} rendas extras</p>
            <p>🎯 ${r.qtdMetas} metas</p>
        </div>

        <div class="cardResumo">
            <h3>⚙️ Ações</h3>
            <button class="btn" onclick="reabrirMes(${r.ano}, ${r.mes})">
                🔓 Reabrir este mês
            </button>
        </div>
    `;
}
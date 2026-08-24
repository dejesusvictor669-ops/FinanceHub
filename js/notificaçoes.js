console.log("carregou: notificacoes.js");

// ======================================
// REGISTRO DO SERVICE WORKER
// ======================================

async function registrarServiceWorker() {
    if (!("serviceWorker" in navigator)) return;

    try {
        await navigator.serviceWorker.register("/service-worker.js");
        console.log("Service Worker registrado.");
    } catch (err) {
        console.error("Erro ao registrar SW:", err);
    }
}

// ======================================
// PEDIR PERMISSÃO DE NOTIFICAÇÃO
// ======================================

async function pedirPermissaoNotificacao() {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") return;
    if (Notification.permission === "denied") return;

    await Notification.requestPermission();
}

// ======================================
// ENVIAR NOTIFICAÇÃO LOCAL
// ======================================

function notificar(titulo, mensagem) {
    if (Notification.permission !== "granted") return;

    new Notification(titulo, {
        body: mensagem
    });
}

// ======================================
// VERIFICAR METAS E SALDO — chamada ao carregar
// ======================================

async function verificarAlertas() {
    if (Notification.permission !== "granted") return;

    const dados = await carregarDados();
    const t = await calcularTotais();

    // Alerta de saldo negativo
    if (t.saldo < 0) {
        notificar(
            "⚠️ Saldo negativo!",
            `Seu saldo está em ${formatarMoeda(t.saldo)}. Revise seus gastos.`
        );
    }

    // Alerta de lazer estourado
    if (t.lazerRestante < 0) {
        notificar(
            "🍔 Orçamento de lazer estourado!",
            `Você gastou ${formatarMoeda(Math.abs(t.lazerRestante))} a mais no lazer.`
        );
    }

    // Alerta de metas próximas de concluir
    dados.metas.forEach(meta => {
        const pct = (meta.valorAtual / meta.valorAlvo) * 100;
        if (pct >= 90 && pct < 100) {
            notificar(
                `🎯 Meta quase lá! "${meta.nome}"`,
                `Faltam apenas ${formatarMoeda(meta.valorAlvo - meta.valorAtual)} para concluir.`
            );
        }
        if (pct >= 100) {
            notificar(
                `🎉 Meta concluída! "${meta.nome}"`,
                `Parabéns! Você atingiu sua meta de ${formatarMoeda(meta.valorAlvo)}.`
            );
        }
    });

    // Alerta de reserva abaixo de 10% da meta
    if (dados.metaReserva > 0) {
        const pctReserva = (t.totalReserva / dados.metaReserva) * 100;
        if (pctReserva < 10) {
            notificar(
                "🛡️ Reserva de emergência baixa",
                `Sua reserva está em ${pctReserva.toFixed(0)}% da meta. Considere aportar mais.`
            );
        }
    }
}
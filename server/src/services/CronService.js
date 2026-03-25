const cron = require('node-cron');
const DailyStatus = require('../models/DailyStatus');

class CronService {
  static start() {
    console.log('🚀 Iniciando serviço de cron...');

    cron.schedule('0 22 * * 1-5', async () => {
      const diaSemana = new Date().getDay();
      if (diaSemana >= 1 && diaSemana <= 5) {
        console.log('⏰ [22:00] Executando verificação de pendências...');
        try {
          const resultados = await DailyStatus.verificarUsuariosInativos();
          console.log(`✅ Verificação concluída. ${resultados.length} usuário(s) afetado(s).`);
          if (resultados.length > 0) {
            console.log('📋 Usuários:', resultados.map(r => `${r.nome}`).join(', '));
          }
        } catch (error) {
          console.error('❌ Erro na verificação de pendências:', error);
        }
      }
    }, {
      timezone: 'America/Sao_Paulo'
    });

    cron.schedule('0 8 * * 1-5', async () => {
      console.log('🌅 [08:00] Resetando sistema para novo dia...');
    }, {
      timezone: 'America/Sao_Paulo'
    });

    cron.schedule('0 0 * * *', async () => {
      console.log('🧹 Limpando registros antigos de daily_status...');
      try {
        const deletados = await DailyStatus.limparDiasAnteriores(60);
        if (deletados > 0) {
          console.log(`✅ ${deletados} registro(s) antigo(s) removido(s).`);
        }
      } catch (error) {
        console.error('❌ Erro ao limpar registros:', error);
      }
    }, {
      timezone: 'America/Sao_Paulo'
    });

    console.log('✅ Cron jobs configurados:');
    console.log('   - Verificação de pendências: Seg-Sex às 22:00');
    console.log('   - Reset diário: Seg-Sex às 08:00');
    console.log('   - Limpeza de dados: Diário à meia-noite');
  }

  static getStatus() {
    const now = new Date();
    const horaAtual = now.getHours();
    const diaSemana = now.getDay();
    const isDiaUtil = diaSemana >= 1 && diaSemana <= 5;
    
    const inicio = 8;
    const fim = 22;
    
    let status = 'fora_do_horario';
    let tempoRestante = null;
    
    if (isDiaUtil) {
      if (horaAtual >= inicio && horaAtual < fim) {
        status = 'ativo';
        const fimDate = new Date(now);
        fimDate.setHours(fim, 0, 0, 0);
        tempoRestante = fimDate - now;
      } else if (horaAtual >= fim) {
        status = 'encerrado';
      } else {
        status = 'nao_iniciado';
      }
    } else {
      status = 'fim_de_semana';
    }

    return {
      status,
      isDiaUtil,
      horaAtual: `${String(horaAtual).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      inicio: `${inicio}:00`,
      fim: `${fim}:00`,
      tempoRestanteMs: tempoRestante,
      tempoRestanteFormatado: tempoRestante ? this.formatarTempo(tempoRestante) : null
    };
  }

  static formatarTempo(ms) {
    const horas = Math.floor(ms / (1000 * 60 * 60));
    const minutos = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
  }
}

module.exports = CronService;

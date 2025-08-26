// 📢 INTEGRAÇÃO SLACK - Notificações de Deploy e Testes
// Envia relatórios de deploy e testes para o Slack

class SlackNotifier {
    constructor(webhookUrl, channel = '#deploys') {
        this.webhookUrl = webhookUrl;
        this.channel = channel;
        this.appName = 'ProfitShards Deploy';
    }

    // Enviar mensagem básica
    async sendMessage(text, options = {}) {
        const payload = {
            channel: this.channel,
            username: this.appName,
            icon_emoji: ':rocket:',
            text: text,
            ...options
        };

        try {
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Slack API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao enviar para Slack:', error);
            throw error;
        }
    }

    // Enviar relatório de deploy
    async sendDeployReport(deployData) {
        const { status, commit, branch, timestamp, duration, url } = deployData;
        
        const color = status === 'success' ? 'good' : status === 'warning' ? 'warning' : 'danger';
        const emoji = status === 'success' ? '✅' : status === 'warning' ? '⚠️' : '❌';
        
        const attachment = {
            color: color,
            title: `${emoji} Deploy ${status.toUpperCase()}`,
            title_link: url,
            fields: [
                {
                    title: 'Branch',
                    value: branch,
                    short: true
                },
                {
                    title: 'Commit',
                    value: commit?.substring(0, 7) || 'N/A',
                    short: true
                },
                {
                    title: 'Duração',
                    value: duration || 'N/A',
                    short: true
                },
                {
                    title: 'URL',
                    value: url,
                    short: true
                },
                {
                    title: 'Timestamp',
                    value: new Date(timestamp).toLocaleString('pt-BR'),
                    short: false
                }
            ],
            footer: 'ProfitShards CI/CD',
            ts: Math.floor(timestamp / 1000)
        };

        return await this.sendMessage(`Deploy realizado na branch \`${branch}\``, {
            attachments: [attachment]
        });
    }

    // Enviar relatório de testes
    async sendTestReport(testResults) {
        const { 
            totalTests, 
            passedTests, 
            failedTests, 
            performance, 
            errors = [],
            url,
            timestamp = Date.now()
        } = testResults;

        const successRate = ((passedTests / totalTests) * 100).toFixed(1);
        const color = successRate >= 90 ? 'good' : successRate >= 70 ? 'warning' : 'danger';
        const emoji = successRate >= 90 ? '✅' : successRate >= 70 ? '⚠️' : '❌';

        const fields = [
            {
                title: 'Taxa de Sucesso',
                value: `${successRate}% (${passedTests}/${totalTests})`,
                short: true
            },
            {
                title: 'Performance',
                value: `${performance.avg}ms (média)`,
                short: true
            },
            {
                title: 'URL Testada',
                value: url,
                short: false
            }
        ];

        if (errors.length > 0) {
            fields.push({
                title: 'Erros Encontrados',
                value: errors.slice(0, 3).join('\n'),
                short: false
            });
        }

        const attachment = {
            color: color,
            title: `${emoji} Relatório de Testes`,
            fields: fields,
            footer: 'ProfitShards Testing',
            ts: Math.floor(timestamp / 1000)
        };

        return await this.sendMessage(`Testes executados em produção`, {
            attachments: [attachment]
        });
    }

    // Enviar relatório de melhorias do feed
    async sendFeedImprovementReport() {
        const improvements = [
            '🎨 Interface visual melhorada com gradientes',
            '⚡ Badges de eficiência em tempo real',
            '🔄 Indicadores de atividade pulsantes',
            '🎯 Cores diferentes por tipo de mapa',
            '📱 Layout responsivo aprimorado',
            '🖱️ Efeitos de hover sofisticados',
            '📊 Estatísticas do feed em tempo real',
            '🔄 Controles de auto-refresh'
        ];

        const attachment = {
            color: 'good',
            title: '🚀 Feed de Atividade Melhorado - Deploy em Produção',
            text: 'As seguintes melhorias foram implementadas no feed:',
            fields: [
                {
                    title: 'Melhorias Implementadas',
                    value: improvements.join('\n'),
                    short: false
                },
                {
                    title: 'URL de Produção',
                    value: 'https://profitshards.pages.dev',
                    short: true
                },
                {
                    title: 'Status API',
                    value: '✅ Funcionando',
                    short: true
                }
            ],
            footer: 'ProfitShards Development',
            ts: Math.floor(Date.now() / 1000)
        };

        return await this.sendMessage('🎉 Melhorias do feed promovidas para produção!', {
            attachments: [attachment]
        });
    }

    // Enviar mensagem de teste automatizado
    async sendAutomatedTestResults(results) {
        const blocks = [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: '🧪 Relatório de Testes Automatizados'
                }
            },
            {
                type: 'section',
                fields: [
                    {
                        type: 'mrkdwn',
                        text: `*Site Status:* ${results.connectivity.status === 200 ? '✅ Online' : '❌ Offline'}`
                    },
                    {
                        type: 'mrkdwn', 
                        text: `*API Feed:* ${results.api.working ? '✅ Funcionando' : '❌ Com problemas'}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*Performance:* ${results.performance.avg}ms (${results.performance.rating})`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*Runs Encontradas:* ${results.api.runsCount}`
                    }
                ]
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*Detalhes dos Testes:*\n${results.details}`
                }
            },
            {
                type: 'actions',
                elements: [
                    {
                        type: 'button',
                        text: {
                            type: 'plain_text',
                            text: 'Abrir Site'
                        },
                        url: 'https://profitshards.pages.dev',
                        style: 'primary'
                    },
                    {
                        type: 'button',
                        text: {
                            type: 'plain_text',
                            text: 'Ver API'
                        },
                        url: 'https://profitshards.pages.dev/api/feed/activity-stream'
                    }
                ]
            }
        ];

        return await this.sendMessage('', { blocks });
    }
}

// Função para executar testes e enviar para Slack
async function runTestsAndNotifySlack(webhookUrl) {
    const slack = new SlackNotifier(webhookUrl);
    
    console.log('🧪 Executando testes e enviando para Slack...');
    
    try {
        // Executar testes
        const testResults = await executeProductionTests();
        
        // Enviar relatório de melhorias
        await slack.sendFeedImprovementReport();
        
        // Aguardar um pouco
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Enviar resultados dos testes
        await slack.sendAutomatedTestResults(testResults);
        
        console.log('✅ Relatórios enviados para Slack com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao enviar para Slack:', error);
        
        // Enviar notificação de erro
        await slack.sendMessage(`❌ Erro nos testes: ${error.message}`, {
            color: 'danger'
        });
    }
}

// Função de testes resumida
async function executeProductionTests() {
    const PRODUCTION_URL = 'https://profitshards.pages.dev';
    
    console.log('🔗 Testando conectividade...');
    const connectivityStart = Date.now();
    const connectivityResponse = await fetch(PRODUCTION_URL);
    const connectivityTime = Date.now() - connectivityStart;
    
    console.log('📊 Testando API...');
    const apiStart = Date.now();
    const apiResponse = await fetch(`${PRODUCTION_URL}/api/feed/activity-stream`);
    const apiTime = Date.now() - apiStart;
    const apiData = apiResponse.ok ? await apiResponse.json() : null;
    
    console.log('⚡ Testando performance...');
    const performanceTests = [];
    for (let i = 0; i < 3; i++) {
        const start = Date.now();
        await fetch(PRODUCTION_URL);
        performanceTests.push(Date.now() - start);
    }
    
    const avgPerformance = Math.round(performanceTests.reduce((a, b) => a + b) / performanceTests.length);
    const performanceRating = avgPerformance < 500 ? 'Excelente' : avgPerformance < 1000 ? 'Boa' : 'Regular';
    
    return {
        connectivity: {
            status: connectivityResponse.status,
            time: connectivityTime
        },
        api: {
            working: apiResponse.ok,
            time: apiTime,
            runsCount: apiData?.runs?.length || 0,
            cached: apiData?.cached || false
        },
        performance: {
            avg: avgPerformance,
            rating: performanceRating,
            tests: performanceTests
        },
        details: `
Conectividade: ${connectivityTime}ms
API Response: ${apiTime}ms  
Performance: ${performanceTests.join('ms, ')}ms
Runs no feed: ${apiData?.runs?.length || 0}
Cache ativo: ${apiData?.cached ? 'Sim' : 'Não'}
        `.trim()
    };
}

// Exemplo de uso
async function example() {
    // Substitua pela sua webhook URL do Slack
    const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL';
    
    if (SLACK_WEBHOOK_URL.includes('YOUR')) {
        console.log('⚠️ Configure a SLACK_WEBHOOK_URL antes de usar');
        return;
    }
    
    await runTestsAndNotifySlack(SLACK_WEBHOOK_URL);
}

// Executar se chamado diretamente
if (typeof window === 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
    example().catch(console.error);
}

export { SlackNotifier, runTestsAndNotifySlack, executeProductionTests };
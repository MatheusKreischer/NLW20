const apiKeyInput = document.getElementById('apiKey')
const gameSelect = document.getElementById('gameSelect')
const questionInput = document.getElementById('questionInput')
const askButton = document.getElementById('askButton')
const aiResponse = document.getElementById('aiResponse')
const form = document.getElementById('form')

const markdownToHTML = (text) => {
    const converter = new showdown.Converter()
    return converter.makeHtml(text)
}


// Exemplo de como a variável 'game' poderia ser definida
let game = 'cs2' // Ou 'valorant', ou qualquer outro valor

const perguntaCs2 = Qual é o seu mapa favorito no CS2? // Agora a template string está fechada!

const perguntaValorant = Quem é o seu agente favorito no Valorant?// Agora a template string está fechada!

let pergunta = '' // Inicializamos 'pergunta'

if (game === 'cs2') {
    pergunta = perguntaCs2;
    // Se 'contents' for relevante apenas para 'cs2', ele poderia ir aqui:
    const contentsCs2 = [{
        id: 1,
        tipo: 'mapa',
        detalhe: 'Inferno'
    }];
    console.log("Conteúdo de CS2:", contentsCs2);
} else if (game === 'valorant') {
    pergunta = perguntaValorant;
    // Se 'contents' for relevante apenas para 'valorant', ele poderia ir aqui:
    const contentsValorant = [{
        id: 1,
        tipo: 'agente',
        detalhe: 'Jett'
    }]
    console.log("Conteúdo de Valorant:", contentsValorant)
} else {
    // É uma boa prática ter um 'else' para tratar casos em que 'game' não é 'cs2' nem 'valorant'
    pergunta = 'Por favor, selecione um jogo válido.'
    console.log("Nenhum conteúdo específico para este jogo.")
}

console.log("A pergunta selecionada é:", pergunta)

// Se 'contents' for algo que você quer que seja global ou usado após a condicional,
// você precisaria definir a variável 'contents' com 'let' fora dos blocos 'if/else if'
// e atribuir os valores dentro deles.
// Exemplo:
/*
let contents = [];
if (game === 'cs2') {
    contents = [{ id: 1, tipo: 'mapa', detalhe: 'Mirage' }];
} else if (game === 'valorant') {
    contents = [{ id: 2, tipo: 'agente', detalhe: 'Reyna' }];
}
console.log("Conteúdo final:", contents);
*/

const perguntarAI = async (question, game, apiKey) => {
    const model = "gemini-2.0-flash"
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const pergunta = `
    ## Especialidade
    Você é um especialista assistente de meta para o jogo ${game}

    ## Tarefa
    Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, build e dicas

    ## Regras
    - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
    - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'
    - Considere a data atual ${new Date().toLocaleDateString()}
    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
    - Nunca responsda itens que vc não tenha certeza de que existe no patch atual.

    ## Resposta
    - Economize na resposta, seja direto e responda no máximo 500 caracteres
    - Responda em markdown
    - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

    ## Exemplo de resposta
    pergunta do usuário: Melhor build rengar jungle
    resposta: A build mais atual é: \n\n **Itens:**\n\n coloque os itens aqui.\n\n**Runas:**\n\nexemplo de runas\n\n

    ---
    Aqui está a pergunta do usuário: ${question}
  `

    const contents = [{
        role: "user",
        parts: [{
            text: pergunta
        }]
    }]

    const tools = [{
        google_search: {}
    }]

    // chamada API
    const response = await fetch(geminiURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents,
            tools
        })
    })

    const data = await response.json()
    return data.candidates[0].content.parts[0].text
}

const enviarFormulario = async (event) => {
    event.preventDefault()
    const apiKey = apiKeyInput.value
    const game = gameSelect.value
    const question = questionInput.value

    if (apiKey == '' || game == '' || question == '') {
        alert('Por favor, preencha todos os campos')
        return
    }

    askButton.disabled = true
    askButton.textContent = 'Perguntando...'
    askButton.classList.add('loading')

    try {
        const text = await perguntarAI(question, game, apiKey)
        aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text)
        aiResponse.classList.remove('hidden')
    } catch (error) {
        console.log('Erro: ', error)
    } finally {
        askButton.disabled = false
        askButton.textContent = "Perguntar"
        askButton.classList.remove('loading')
    }
}

form.addEventListener('submit', enviarFormulario)
'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Sparkles } from 'lucide-react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'mya'
  timestamp: Date
}

interface MyaTabProps {
  studioName: string
}

export default function MyaTab({ studioName }: MyaTabProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Olá! Eu sou a Mya, sua assistente inteligente para gestão do ${studioName}. Como posso ajudar você hoje?`,
      sender: 'mya',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const processMyaCommand = async (userMessage: string): Promise<string> => {
    const message = userMessage.toLowerCase()
    
    // Simulação de processamento inteligente
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Detecção de intenções
    if (message.includes('agendar') || message.includes('marcar')) {
      return processAgendamento(userMessage)
    }
    
    if (message.includes('cliente') && (message.includes('cadastrar') || message.includes('novo'))) {
      return processNovoCliente(userMessage)
    }
    
    if (message.includes('financeiro') || message.includes('receita') || message.includes('despesa')) {
      return processFinanceiro(userMessage)
    }
    
    if (message.includes('estoque') || message.includes('produto')) {
      return processEstoque(userMessage)
    }
    
    if (message.includes('ajuda') || message.includes('help')) {
      return `Posso ajudar você com:
      
📅 **Agendamentos**: "Agendar Maria para manicure amanhã às 14h"
👥 **Clientes**: "Cadastrar novo cliente João"  
💰 **Financeiro**: "Adicionar receita de R$ 150"
📦 **Estoque**: "Verificar produtos em falta"

Fale naturalmente comigo, entendo comandos de várias formas!`
    }

    // Resposta padrão inteligente
    return `Entendi que você quer "${userMessage}". 

Para te ajudar melhor, posso:
• Agendar clientes e serviços
• Cadastrar novos clientes  
• Gerenciar financeiro
• Controlar estoque

Tente ser mais específico, por exemplo: "Agendar Ana para design de sobrancelha na sexta às 15h com sinal de R$ 30"`
  }

  const processAgendamento = (message: string): string => {
    // Extração inteligente de informações
    const nomeMatch = message.match(/agendar\s+(\w+)/i) || message.match(/marcar\s+(\w+)/i)
    const servicoMatch = message.match(/(manicure|pedicure|design|sobrancelha|depilação|massagem|limpeza)/i)
    const dataMatch = message.match(/(hoje|amanhã|segunda|terça|quarta|quinta|sexta|sábado|domingo|\d{1,2}\/\d{1,2})/i)
    const horarioMatch = message.match(/(\d{1,2}h|\d{1,2}:\d{2})/i)
    const sinalMatch = message.match(/sinal\s+(?:de\s+)?r?\$?\s*(\d+)/i)

    const nome = nomeMatch ? nomeMatch[1] : 'Cliente'
    const servico = servicoMatch ? servicoMatch[1] : 'Serviço'
    const data = dataMatch ? dataMatch[1] : 'data'
    const horario = horarioMatch ? horarioMatch[1] : 'horário'
    const sinal = sinalMatch ? sinalMatch[1] : '0'

    // Simular cadastro (em uma implementação real, isso salvaria no estado)
    return `✅ **Agendamento processado com sucesso!**

**Detalhes extraídos:**
👤 Cliente: ${nome}
💅 Serviço: ${servico}
📅 Data: ${data}
⏰ Horário: ${horario}
💰 Sinal: R$ ${sinal}

O agendamento foi adicionado à sua agenda. O cliente ${nome} ${sinal !== '0' ? 'deu sinal de R$ ' + sinal : 'ainda não deu sinal'}.

*Vá para a aba Agenda para ver todos os detalhes!*`
  }

  const processNovoCliente = (message: string): string => {
    const nomeMatch = message.match(/cliente\s+(\w+)/i) || message.match(/cadastrar\s+(\w+)/i)
    const telefoneMatch = message.match(/(\d{10,11})/i)
    const emailMatch = message.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i)

    const nome = nomeMatch ? nomeMatch[1] : 'Novo Cliente'
    const telefone = telefoneMatch ? telefoneMatch[1] : 'não informado'
    const email = emailMatch ? emailMatch[1] : 'não informado'

    return `✅ **Cliente cadastrado com sucesso!**

**Informações extraídas:**
👤 Nome: ${nome}
📱 Telefone: ${telefone}
📧 Email: ${email}

O cliente foi adicionado à sua base de dados.

*Vá para a aba Clientes para ver todos os cadastros!*`
  }

  const processFinanceiro = (message: string): string => {
    const valorMatch = message.match(/r?\$?\s*(\d+(?:,\d{2})?)/i)
    const tipoMatch = message.match(/(receita|despesa|gasto|entrada)/i)
    const descricaoMatch = message.match(/(?:receita|despesa|gasto|entrada)\s+(?:de\s+)?(?:r?\$?\s*\d+\s+)?(?:de\s+|para\s+)?(.+)/i)

    const valor = valorMatch ? valorMatch[1].replace(',', '.') : '0'
    const tipo = tipoMatch ? (tipoMatch[1].includes('receita') || tipoMatch[1].includes('entrada') ? 'receita' : 'despesa') : 'receita'
    const descricao = descricaoMatch ? descricaoMatch[1] : 'Transação'

    return `✅ **Transação registrada com sucesso!**

**Detalhes:**
💰 Valor: R$ ${valor}
📊 Tipo: ${tipo}
📝 Descrição: ${descricao}
📅 Data: ${new Date().toLocaleDateString('pt-BR')}

A transação foi adicionada ao seu controle financeiro.

*Vá para a aba Financeiro para ver o resumo completo!*`
  }

  const processEstoque = (message: string): string => {
    if (message.includes('falta') || message.includes('baixo') || message.includes('acabando')) {
      return `📦 **Verificação de Estoque**

**Produtos com estoque baixo:**
⚠️ Base líquida - 2 unidades (mín: 5)
⚠️ Lixa descartável - 8 unidades (mín: 20)
⚠️ Acetona - 1 litro (mín: 3)

**Recomendação:** Reabastecer estes produtos em breve.

*Vá para a aba Estoque para gerenciar todos os produtos!*`
    }

    const produtoMatch = message.match(/produto\s+(\w+)/i) || message.match(/adicionar\s+(\w+)/i)
    const quantidadeMatch = message.match(/(\d+)\s+unidades?/i)

    const produto = produtoMatch ? produtoMatch[1] : 'Produto'
    const quantidade = quantidadeMatch ? quantidadeMatch[1] : '1'

    return `✅ **Produto adicionado ao estoque!**

**Detalhes:**
📦 Produto: ${produto}
🔢 Quantidade: ${quantidade} unidades
📅 Data: ${new Date().toLocaleDateString('pt-BR')}

*Vá para a aba Estoque para ver todos os produtos!*`
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      const response = await processMyaCommand(inputMessage)
      
      const myaMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'mya',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, myaMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.',
        sender: 'mya',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Mya - Assistente Inteligente
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestão inteligente do {studioName}
          </p>
        </div>
        <div className="ml-auto">
          <Sparkles className="w-5 h-5 text-purple-500 animate-pulse" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.sender === 'user'
                ? 'bg-blue-500'
                : 'bg-gradient-to-r from-purple-500 to-pink-500'
            }`}>
              {message.sender === 'user' ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            
            <div className={`max-w-[80%] ${
              message.sender === 'user' ? 'text-right' : 'text-left'
            }`}>
              <div className={`inline-block p-3 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              }`}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.text}
                </div>
              </div>
              <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
                message.sender === 'user' ? 'text-right' : 'text-left'
              }`}>
                {message.timestamp.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem... Ex: 'Agendar Maria para manicure amanhã às 14h'"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
              rows={2}
              disabled={isTyping}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-xl hover:from-purple-600 hover:to-pink-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
          💡 Dica: Fale naturalmente! Ex: "Agendar Ana para design de sobrancelha na sexta às 15h com sinal de R$ 30"
        </div>
      </div>
    </div>
  )
}
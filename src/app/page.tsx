'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, DollarSign, Package, MessageCircle, Settings, Sun, Moon, LogOut, Trash2, Edit, Plus, Check, X, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react'
import LoginForm from '@/components/LoginForm'
import MyaTab from '@/components/MyaTab'

// Tipos
interface Cliente {
  id: string
  nome: string
  telefone: string
  email: string
  dataCadastro: string
}

interface Agendamento {
  id: string
  clienteId: string
  clienteNome: string
  servico: string
  data: string
  horario: string
  valor: number
  sinal: number
  sinalPago: boolean
  status: 'agendado' | 'finalizado' | 'cancelado'
  observacoes?: string
}

interface Transacao {
  id: string
  tipo: 'receita' | 'despesa'
  descricao: string
  valor: number
  data: string
  categoria: string
  agendamentoId?: string
}

interface Produto {
  id: string
  nome: string
  categoria: string
  quantidade: number
  quantidadeMinima: number
  preco: number
  fornecedor: string
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState('agenda')
  const [darkMode, setDarkMode] = useState(false)
  const [studioName, setStudioName] = useState('Meu Studio')
  const [isEditingStudio, setIsEditingStudio] = useState(false)

  // Estados dos dados
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])

  // Estados da agenda
  const [viewMode, setViewMode] = useState<'dia' | 'semana' | 'mes'>('semana')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showAgendamentoForm, setShowAgendamentoForm] = useState(false)
  const [editingAgendamento, setEditingAgendamento] = useState<Agendamento | null>(null)

  // Estados do financeiro
  const [showTransacaoForm, setShowTransacaoForm] = useState(false)
  const [editingTransacao, setEditingTransacao] = useState<Transacao | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{show: boolean, id: string, type: 'transacao' | 'agendamento'}>({show: false, id: '', type: 'transacao'})

  // Estados do estoque
  const [showProdutoForm, setShowProdutoForm] = useState(false)
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null)

  // Verificar autenticação
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  // Aplicar tema
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Carregar dados do localStorage
  useEffect(() => {
    if (isAuthenticated) {
      const savedClientes = localStorage.getItem('clientes')
      const savedAgendamentos = localStorage.getItem('agendamentos')
      const savedTransacoes = localStorage.getItem('transacoes')
      const savedProdutos = localStorage.getItem('produtos')
      const savedStudioName = localStorage.getItem('studioName')

      if (savedClientes) setClientes(JSON.parse(savedClientes))
      if (savedAgendamentos) setAgendamentos(JSON.parse(savedAgendamentos))
      if (savedTransacoes) setTransacoes(JSON.parse(savedTransacoes))
      if (savedProdutos) setProdutos(JSON.parse(savedProdutos))
      if (savedStudioName) setStudioName(savedStudioName)
    }
  }, [isAuthenticated])

  // Salvar dados no localStorage
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('clientes', JSON.stringify(clientes))
    }
  }, [clientes, isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('agendamentos', JSON.stringify(agendamentos))
    }
  }, [agendamentos, isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('transacoes', JSON.stringify(transacoes))
    }
  }, [transacoes, isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('produtos', JSON.stringify(produtos))
    }
  }, [produtos, isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('studioName', studioName)
    }
  }, [studioName, isAuthenticated])

  if (!isAuthenticated) {
    return <LoginForm onLogin={() => setIsAuthenticated(true)} />
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    setIsAuthenticated(false)
  }

  const toggleTheme = () => {
    setDarkMode(!darkMode)
  }

  // Funções de agendamento
  const handleSaveAgendamento = (agendamentoData: any) => {
    if (editingAgendamento) {
      // Atualizar agendamento existente
      const updatedAgendamentos = agendamentos.map(ag => 
        ag.id === editingAgendamento.id ? { ...ag, ...agendamentoData } : ag
      )
      setAgendamentos(updatedAgendamentos)

      // Atualizar transação financeira se necessário
      if (agendamentoData.sinalPago !== editingAgendamento.sinalPago) {
        if (agendamentoData.sinalPago) {
          // Adicionar transação do sinal
          const novaTransacao: Transacao = {
            id: Date.now().toString(),
            tipo: 'receita',
            descricao: `Sinal - ${agendamentoData.servico} (${agendamentoData.clienteNome})`,
            valor: agendamentoData.sinal,
            data: new Date().toISOString().split('T')[0],
            categoria: 'Serviços',
            agendamentoId: editingAgendamento.id
          }
          setTransacoes(prev => [...prev, novaTransacao])
        } else {
          // Remover transação do sinal
          setTransacoes(prev => prev.filter(t => 
            !(t.agendamentoId === editingAgendamento.id && t.descricao.includes('Sinal'))
          ))
        }
      }
    } else {
      // Criar novo agendamento
      const novoAgendamento: Agendamento = {
        id: Date.now().toString(),
        ...agendamentoData
      }
      setAgendamentos(prev => [...prev, novoAgendamento])

      // Adicionar cliente se não existir
      const clienteExiste = clientes.find(c => c.nome.toLowerCase() === agendamentoData.clienteNome.toLowerCase())
      if (!clienteExiste) {
        const novoCliente: Cliente = {
          id: Date.now().toString(),
          nome: agendamentoData.clienteNome,
          telefone: agendamentoData.telefone || '',
          email: agendamentoData.email || '',
          dataCadastro: new Date().toISOString().split('T')[0]
        }
        setClientes(prev => [...prev, novoCliente])
      }

      // Adicionar transação do sinal se pago
      if (agendamentoData.sinalPago && agendamentoData.sinal > 0) {
        const transacaoSinal: Transacao = {
          id: Date.now().toString(),
          tipo: 'receita',
          descricao: `Sinal - ${agendamentoData.servico} (${agendamentoData.clienteNome})`,
          valor: agendamentoData.sinal,
          data: new Date().toISOString().split('T')[0],
          categoria: 'Serviços',
          agendamentoId: novoAgendamento.id
        }
        setTransacoes(prev => [...prev, transacaoSinal])
      }
    }

    setShowAgendamentoForm(false)
    setEditingAgendamento(null)
  }

  const handleDeleteAgendamento = (id: string) => {
    // Remover agendamento
    setAgendamentos(prev => prev.filter(ag => ag.id !== id))
    
    // Remover todas as transações relacionadas ao agendamento
    setTransacoes(prev => prev.filter(t => t.agendamentoId !== id))
    
    setDeleteConfirmation({show: false, id: '', type: 'agendamento'})
  }

  const handleFinalizarServico = (agendamento: Agendamento) => {
    // Marcar como finalizado
    const updatedAgendamentos = agendamentos.map(ag => 
      ag.id === agendamento.id ? { ...ag, status: 'finalizado' as const } : ag
    )
    setAgendamentos(updatedAgendamentos)

    // Adicionar transação do valor restante
    const valorRestante = agendamento.valor - agendamento.sinal
    if (valorRestante > 0) {
      const transacaoRestante: Transacao = {
        id: Date.now().toString(),
        tipo: 'receita',
        descricao: `Serviço Finalizado - ${agendamento.servico} (${agendamento.clienteNome})`,
        valor: valorRestante,
        data: new Date().toISOString().split('T')[0],
        categoria: 'Serviços',
        agendamentoId: agendamento.id
      }
      setTransacoes(prev => [...prev, transacaoRestante])
    }
  }

  // Funções financeiras
  const handleSaveTransacao = (transacaoData: any) => {
    if (editingTransacao) {
      const updatedTransacoes = transacoes.map(t => 
        t.id === editingTransacao.id ? { ...t, ...transacaoData } : t
      )
      setTransacoes(updatedTransacoes)
    } else {
      const novaTransacao: Transacao = {
        id: Date.now().toString(),
        ...transacaoData
      }
      setTransacoes(prev => [...prev, novaTransacao])
    }

    setShowTransacaoForm(false)
    setEditingTransacao(null)
  }

  const handleDeleteTransacao = (id: string) => {
    setTransacoes(prev => prev.filter(t => t.id !== id))
    setDeleteConfirmation({show: false, id: '', type: 'transacao'})
  }

  // Funções de estoque
  const handleSaveProduto = (produtoData: any) => {
    if (editingProduto) {
      const updatedProdutos = produtos.map(p => 
        p.id === editingProduto.id ? { ...p, ...produtoData } : p
      )
      setProdutos(updatedProdutos)
    } else {
      const novoProduto: Produto = {
        id: Date.now().toString(),
        ...produtoData
      }
      setProdutos(prev => [...prev, novoProduto])
    }

    setShowProdutoForm(false)
    setEditingProduto(null)
  }

  // Funções de navegação do calendário
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    
    if (viewMode === 'dia') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    } else if (viewMode === 'semana') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    }
    
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Filtrar agendamentos por data
  const getAgendamentosPorData = () => {
    const hoje = new Date(currentDate)
    
    return agendamentos.filter(ag => {
      const dataAgendamento = new Date(ag.data)
      
      if (viewMode === 'dia') {
        return dataAgendamento.toDateString() === hoje.toDateString()
      } else if (viewMode === 'semana') {
        const inicioSemana = new Date(hoje)
        inicioSemana.setDate(hoje.getDate() - hoje.getDay())
        const fimSemana = new Date(inicioSemana)
        fimSemana.setDate(inicioSemana.getDate() + 6)
        
        return dataAgendamento >= inicioSemana && dataAgendamento <= fimSemana
      } else {
        return dataAgendamento.getMonth() === hoje.getMonth() && 
               dataAgendamento.getFullYear() === hoje.getFullYear()
      }
    })
  }

  // Calcular totais financeiros
  const calcularTotais = () => {
    const receitas = transacoes.filter(t => t.tipo === 'receita').reduce((sum, t) => sum + t.valor, 0)
    const despesas = transacoes.filter(t => t.tipo === 'despesa').reduce((sum, t) => sum + t.valor, 0)
    return { receitas, despesas, saldo: receitas - despesas }
  }

  const totais = calcularTotais()

  const renderContent = () => {
    switch (activeTab) {
      case 'agenda':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Agenda</h2>
              <button
                onClick={() => setShowAgendamentoForm(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Novo Agendamento
              </button>
            </div>

            {/* Controles do Calendário */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateDate('prev')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 min-w-[200px] text-center">
                    {viewMode === 'dia' && currentDate.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    {viewMode === 'semana' && `Semana de ${currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`}
                    {viewMode === 'mes' && currentDate.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' })}
                  </h3>
                  <button
                    onClick={() => navigateDate('next')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={goToToday}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Hoje
                  </button>
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    {(['dia', 'semana', 'mes'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                          viewMode === mode
                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                        }`}
                      >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lista de Agendamentos */}
              <div className="space-y-3">
                {getAgendamentosPorData().length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    Nenhum agendamento para este período
                  </p>
                ) : (
                  getAgendamentosPorData().map((agendamento) => (
                    <div
                      key={agendamento.id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-l-4 border-blue-500"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                              {agendamento.clienteNome}
                            </h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              agendamento.status === 'agendado' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              agendamento.status === 'finalizado' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {agendamento.status}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 mb-1">{agendamento.servico}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(agendamento.data).toLocaleDateString('pt-BR')} às {agendamento.horario}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="text-gray-600 dark:text-gray-300">
                              Valor: R$ {agendamento.valor.toFixed(2)}
                            </span>
                            <span className="text-gray-600 dark:text-gray-300">
                              Sinal: R$ {agendamento.sinal.toFixed(2)}
                              <span className={`ml-1 ${agendamento.sinalPago ? 'text-green-600' : 'text-red-600'}`}>
                                ({agendamento.sinalPago ? 'Pago' : 'Pendente'})
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {agendamento.status === 'agendado' && (
                            <button
                              onClick={() => handleFinalizarServico(agendamento)}
                              className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors"
                              title="Finalizar Serviço"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingAgendamento(agendamento)
                              setShowAgendamentoForm(true)
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmation({show: true, id: agendamento.id, type: 'agendamento'})}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )

      case 'clientes':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Clientes</h2>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="space-y-4">
                {clientes.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    Nenhum cliente cadastrado
                  </p>
                ) : (
                  clientes.map((cliente) => (
                    <div
                      key={cliente.id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                    >
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {cliente.nome}
                      </h4>
                      <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        {cliente.telefone && <p>Telefone: {cliente.telefone}</p>}
                        {cliente.email && <p>Email: {cliente.email}</p>}
                        <p>Cadastrado em: {new Date(cliente.dataCadastro).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )

      case 'financeiro':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Financeiro</h2>
              <button
                onClick={() => setShowTransacaoForm(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nova Transação
              </button>
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Receitas</h3>
                <p className="text-3xl font-bold">R$ {totais.receitas.toFixed(2)}</p>
              </div>
              <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Despesas</h3>
                <p className="text-3xl font-bold">R$ {totais.despesas.toFixed(2)}</p>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Saldo</h3>
                <p className="text-3xl font-bold">R$ {totais.saldo.toFixed(2)}</p>
              </div>
            </div>

            {/* Lista de Transações */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Transações Recentes
              </h3>
              <div className="space-y-3">
                {transacoes.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    Nenhuma transação registrada
                  </p>
                ) : (
                  transacoes
                    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                    .map((transacao) => (
                      <div
                        key={transacao.id}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex justify-between items-center"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              transacao.tipo === 'receita' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {transacao.tipo}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {transacao.categoria}
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {transacao.descricao}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(transacao.data).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold ${
                            transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transacao.tipo === 'receita' ? '+' : '-'}R$ {transacao.valor.toFixed(2)}
                          </span>
                          {!transacao.agendamentoId && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingTransacao(transacao)
                                  setShowTransacaoForm(true)
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmation({show: true, id: transacao.id, type: 'transacao'})}
                                className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )

      case 'estoque':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Estoque</h2>
              <button
                onClick={() => setShowProdutoForm(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Novo Produto
              </button>
            </div>

            {/* Alertas de Estoque Baixo */}
            {produtos.filter(p => p.quantidade <= p.quantidadeMinima).length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  ⚠️ Produtos com Estoque Baixo
                </h3>
                <div className="space-y-2">
                  {produtos
                    .filter(p => p.quantidade <= p.quantidadeMinima)
                    .map(produto => (
                      <p key={produto.id} className="text-yellow-700 dark:text-yellow-300">
                        {produto.nome} - Quantidade: {produto.quantidade} (Mínimo: {produto.quantidadeMinima})
                      </p>
                    ))}
                </div>
              </div>
            )}

            {/* Lista de Produtos */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="space-y-4">
                {produtos.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    Nenhum produto cadastrado
                  </p>
                ) : (
                  produtos.map((produto) => (
                    <div
                      key={produto.id}
                      className={`rounded-lg p-4 border-l-4 ${
                        produto.quantidade <= produto.quantidadeMinima
                          ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            {produto.nome}
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-300">
                            <div>
                              <span className="font-medium">Categoria:</span>
                              <p>{produto.categoria}</p>
                            </div>
                            <div>
                              <span className="font-medium">Quantidade:</span>
                              <p className={produto.quantidade <= produto.quantidadeMinima ? 'text-yellow-600 font-bold' : ''}>
                                {produto.quantidade}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">Preço:</span>
                              <p>R$ {produto.preco.toFixed(2)}</p>
                            </div>
                            <div>
                              <span className="font-medium">Fornecedor:</span>
                              <p>{produto.fornecedor}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingProduto(produto)
                              setShowProdutoForm(true)
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setProdutos(prev => prev.filter(p => p.id !== produto.id))}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )

      case 'mya':
        return <MyaTab studioName={studioName} />

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {isEditingStudio ? (
                  <input
                    type="text"
                    value={studioName}
                    onChange={(e) => setStudioName(e.target.value)}
                    onBlur={() => setIsEditingStudio(false)}
                    onKeyPress={(e) => e.key === 'Enter' && setIsEditingStudio(false)}
                    className="text-xl font-bold bg-transparent border-b-2 border-blue-500 text-gray-900 dark:text-gray-100 focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <h1 
                    className="text-xl font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => setIsEditingStudio(true)}
                  >
                    {studioName}
                  </h1>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'agenda', label: 'Agenda', icon: Calendar },
              { id: 'clientes', label: 'Clientes', icon: Users },
              { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
              { id: 'estoque', label: 'Estoque', icon: Package },
              { id: 'mya', label: 'Mya', icon: MessageCircle },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {/* Modals */}
      {showAgendamentoForm && (
        <AgendamentoForm
          agendamento={editingAgendamento}
          onSave={handleSaveAgendamento}
          onClose={() => {
            setShowAgendamentoForm(false)
            setEditingAgendamento(null)
          }}
        />
      )}

      {showTransacaoForm && (
        <TransacaoForm
          transacao={editingTransacao}
          onSave={handleSaveTransacao}
          onClose={() => {
            setShowTransacaoForm(false)
            setEditingTransacao(null)
          }}
        />
      )}

      {showProdutoForm && (
        <ProdutoForm
          produto={editingProduto}
          onSave={handleSaveProduto}
          onClose={() => {
            setShowProdutoForm(false)
            setEditingProduto(null)
          }}
        />
      )}

      {deleteConfirmation.show && (
        <DeleteConfirmationModal
          type={deleteConfirmation.type}
          onConfirm={() => {
            if (deleteConfirmation.type === 'transacao') {
              handleDeleteTransacao(deleteConfirmation.id)
            } else {
              handleDeleteAgendamento(deleteConfirmation.id)
            }
          }}
          onCancel={() => setDeleteConfirmation({show: false, id: '', type: 'transacao'})}
        />
      )}
    </div>
  )
}

// Componente de Formulário de Agendamento
function AgendamentoForm({ agendamento, onSave, onClose }: {
  agendamento: Agendamento | null
  onSave: (data: any) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    clienteNome: agendamento?.clienteNome || '',
    servico: agendamento?.servico || '',
    data: agendamento?.data || '',
    horario: agendamento?.horario || '',
    valor: agendamento?.valor || 0,
    sinal: agendamento?.sinal || 0,
    sinalPago: agendamento?.sinalPago || false,
    observacoes: agendamento?.observacoes || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {agendamento ? 'Editar Agendamento' : 'Novo Agendamento'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cliente
            </label>
            <input
              type="text"
              value={formData.clienteNome}
              onChange={(e) => setFormData(prev => ({ ...prev, clienteNome: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Serviço
            </label>
            <input
              type="text"
              value={formData.servico}
              onChange={(e) => setFormData(prev => ({ ...prev, servico: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data
              </label>
              <input
                type="date"
                value={formData.data}
                onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Horário
              </label>
              <input
                type="time"
                value={formData.horario}
                onChange={(e) => setFormData(prev => ({ ...prev, horario: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valor Total (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => setFormData(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sinal (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.sinal}
                onChange={(e) => setFormData(prev => ({ ...prev, sinal: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="sinalPago"
              checked={formData.sinalPago}
              onChange={(e) => setFormData(prev => ({ ...prev, sinalPago: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="sinalPago" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Sinal foi pago
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Observações
            </label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Componente de Formulário de Transação
function TransacaoForm({ transacao, onSave, onClose }: {
  transacao: Transacao | null
  onSave: (data: any) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    tipo: transacao?.tipo || 'despesa' as 'receita' | 'despesa',
    descricao: transacao?.descricao || '',
    valor: transacao?.valor || 0,
    data: transacao?.data || new Date().toISOString().split('T')[0],
    categoria: transacao?.categoria || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {transacao ? 'Editar Transação' : 'Nova Transação'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as 'receita' | 'despesa' }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descrição
            </label>
            <input
              type="text"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Valor (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.valor}
              onChange={(e) => setFormData(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data
            </label>
            <input
              type="date"
              value={formData.data}
              onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoria
            </label>
            <input
              type="text"
              value={formData.categoria}
              onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Ex: Produtos, Aluguel, Serviços..."
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Componente de Formulário de Produto
function ProdutoForm({ produto, onSave, onClose }: {
  produto: Produto | null
  onSave: (data: any) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    nome: produto?.nome || '',
    categoria: produto?.categoria || '',
    quantidade: produto?.quantidade || 0,
    quantidadeMinima: produto?.quantidadeMinima || 5,
    preco: produto?.preco || 0,
    fornecedor: produto?.fornecedor || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {produto ? 'Editar Produto' : 'Novo Produto'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome do Produto
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoria
            </label>
            <input
              type="text"
              value={formData.categoria}
              onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Ex: Cosméticos, Equipamentos..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quantidade
              </label>
              <input
                type="number"
                value={formData.quantidade}
                onChange={(e) => setFormData(prev => ({ ...prev, quantidade: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Qtd. Mínima
              </label>
              <input
                type="number"
                value={formData.quantidadeMinima}
                onChange={(e) => setFormData(prev => ({ ...prev, quantidadeMinima: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Preço (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.preco}
              onChange={(e) => setFormData(prev => ({ ...prev, preco: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fornecedor
            </label>
            <input
              type="text"
              value={formData.fornecedor}
              onChange={(e) => setFormData(prev => ({ ...prev, fornecedor: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Componente de Confirmação de Exclusão
function DeleteConfirmationModal({ type, onConfirm, onCancel }: {
  type: 'transacao' | 'agendamento'
  onConfirm: () => void
  onCancel: () => void
}) {
  const [confirmText, setConfirmText] = useState('')
  const requiredText = 'CONFIRMAR'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
          ⚠️ Confirmar Exclusão
        </h3>

        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Tem certeza que deseja excluir esta {type === 'transacao' ? 'transação' : 'agendamento'}?
          {type === 'agendamento' && ' Todas as transações relacionadas também serão removidas.'}
        </p>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Digite <strong>CONFIRMAR</strong> para prosseguir:
        </p>

        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-4"
          placeholder="Digite CONFIRMAR"
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmText !== requiredText}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}
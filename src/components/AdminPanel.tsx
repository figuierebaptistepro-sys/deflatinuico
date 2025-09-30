import React, { useState } from 'react'
import { useManualSettings } from '../hooks/useManualSettings'
import { useICORounds } from '../hooks/useICORounds'
import { useICOStatus } from '../hooks/useICOStatus'
import { 
  Settings, 
  DollarSign, 
  RefreshCw, 
  Save, 
  AlertTriangle, 
  CheckCircle,
  Play,
  Square,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react'

export const AdminPanel: React.FC = () => {
  const { settings, loading: settingsLoading, updateTotalRaised, resetToCalculated } = useManualSettings()
  const { rounds, activateRound, completeRound, resetRound } = useICORounds()
  const { status: icoStatus, finishICO } = useICOStatus()
  const [isVisible, setIsVisible] = useState(false)
  const [newAmount, setNewAmount] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdateAmount = async () => {
    if (!newAmount || isNaN(parseFloat(newAmount))) {
      alert('Veuillez entrer un montant valide')
      return
    }

    if (!confirm(`Êtes-vous sûr de vouloir définir le montant total à $${parseFloat(newAmount).toLocaleString()} ?`)) {
      return
    }

    setIsUpdating(true)
    try {
      await updateTotalRaised(parseFloat(newAmount))
      setNewAmount('')
      alert('Montant mis à jour avec succès!')
    } catch (error) {
      alert('Erreur lors de la mise à jour du montant')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleResetToCalculated = async () => {
    if (!confirm('Êtes-vous sûr de vouloir revenir au montant calculé automatiquement ?')) {
      return
    }

    setIsUpdating(true)
    try {
      await resetToCalculated()
      alert('Montant remis au calcul automatique!')
    } catch (error) {
      alert('Erreur lors de la remise à zéro')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRoundAction = async (action: string, roundNumber: number) => {
    const confirmMessage = {
      activate: `Activer le Round ${roundNumber} ?`,
      complete: `Terminer le Round ${roundNumber} ?`,
      reset: `Remettre le Round ${roundNumber} en "upcoming" ?`
    }[action]

    if (!confirm(confirmMessage)) return

    try {
      switch (action) {
        case 'activate':
          await activateRound(roundNumber)
          break
        case 'complete':
          await completeRound(roundNumber)
          break
        case 'reset':
          await resetRound(roundNumber)
          break
      }
      alert(`Round ${roundNumber} ${action === 'activate' ? 'activé' : action === 'complete' ? 'terminé' : 'remis à zéro'} avec succès!`)
    } catch (error) {
      alert(`Erreur lors de l'action sur le Round ${roundNumber}`)
    }
  }

  const handleFinishICO = async () => {
    if (!confirm('Êtes-vous sûr de vouloir terminer définitivement l\'ICO ? Cette action est irréversible.')) {
      return
    }

    try {
      await finishICO()
      alert('ICO terminé avec succès!')
    } catch (error) {
      alert('Erreur lors de la finalisation de l\'ICO')
    }
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-6 left-6 z-50 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-all duration-200"
        title="Ouvrir le panneau d'administration"
      >
        <Settings className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 w-96 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <Settings className="w-6 h-6 text-orange-500 mr-3" />
          Admin Panel
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <EyeOff className="w-5 h-5" />
        </button>
      </div>

      {/* Total Raised Control */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <DollarSign className="w-5 h-5 text-green-500 mr-2" />
          Montant Total Levé
        </h4>
        
        {settingsLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                ${settings?.totalRaisedUsd.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-600 flex items-center mt-1">
                {settings?.isManualOverride ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mr-1" />
                    Montant manuel
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    Calculé automatiquement
                  </>
                )}
              </div>
            </div>

            <div className="flex space-x-2">
              <input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="Nouveau montant"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button
                onClick={handleUpdateAmount}
                disabled={isUpdating || !newAmount}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                {isUpdating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
              </button>
            </div>

            <button
              onClick={handleResetToCalculated}
              disabled={isUpdating}
              className="w-full bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Revenir au calcul auto</span>
            </button>
          </div>
        )}
      </div>

      {/* ICO Rounds Control */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Gestion des Rounds</h4>
        <div className="space-y-3">
          {rounds.map((round) => (
            <div key={round.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Round {round.round_number}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  round.status === 'active' ? 'bg-green-100 text-green-800' :
                  round.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {round.status}
                </span>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleRoundAction('activate', round.round_number)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs flex items-center justify-center"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Activer
                </button>
                <button
                  onClick={() => handleRoundAction('complete', round.round_number)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs flex items-center justify-center"
                >
                  <Square className="w-3 h-3 mr-1" />
                  Terminer
                </button>
                <button
                  onClick={() => handleRoundAction('reset', round.round_number)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs flex items-center justify-center"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reset
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ICO Control */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Contrôle ICO</h4>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="text-sm text-red-700 mb-3">
            ⚠️ Action irréversible - Termine définitivement l'ICO
          </div>
          <button
            onClick={handleFinishICO}
            disabled={icoStatus?.ico_finished}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
          >
            {icoStatus?.ico_finished ? 'ICO Terminé' : 'Terminer l\'ICO'}
          </button>
        </div>
      </div>
    </div>
  )
}
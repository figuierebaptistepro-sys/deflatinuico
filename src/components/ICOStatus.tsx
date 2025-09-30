import React from 'react'
import { useICOStatus } from '../hooks/useICOStatus'
import { useManualTotal } from '../hooks/useManualTotal'
import { CheckCircle, Clock, DollarSign, Coins, Calendar, AlertTriangle } from 'lucide-react'

export const ICOStatus: React.FC = () => {
  const { status, loading, error, finishICO } = useICOStatus()
  const { data: manualTotalData } = useManualTotal()

  const handleFinishICO = async () => {
    if (!confirm('Êtes-vous sûr de vouloir terminer l\'ICO ? Cette action est irréversible.')) {
      return
    }

    try {
      await finishICO()
      alert('ICO terminé avec succès !')
    } catch (error) {
      alert('Erreur lors de la finalisation de l\'ICO')
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-600">Chargement du statut ICO...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <div>
            <h3 className="text-red-800 font-semibold">Erreur</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!status) {
    return null
  }

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-200 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
          {status.ico_finished ? (
            <>
              <CheckCircle className="w-8 h-8 text-green-500 mr-4" />
              ICO Terminé
            </>
          ) : (
            <>
              <Clock className="w-8 h-8 text-orange-500 mr-4" />
              ICO En Cours
            </>
          )}
        </h3>
      </div>

      {/* Status Banner */}
      <div className={`rounded-xl p-4 mb-6 ${
        status.ico_finished 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-orange-50 border border-orange-200'
      }`}>
        <div className="flex items-center space-x-3">
          {status.ico_finished ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : (
            <Clock className="w-6 h-6 text-orange-500" />
          )}
          <div>
            <h4 className={`font-semibold ${
              status.ico_finished ? 'text-green-800' : 'text-orange-800'
            }`}>
              {status.ico_finished ? 'ICO Terminé avec Succès' : 'ICO Actif'}
            </h4>
            <p className={`text-sm ${
              status.ico_finished ? 'text-green-600' : 'text-orange-600'
            }`}>
              {status.ico_finished 
                ? `Terminé le ${new Date(status.finish_date!).toLocaleDateString('fr-FR')}`
                : `${status.active_rounds} round(s) actif(s)`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-green-600">
                ${(manualTotalData?.total_raised || status.total_raised_usd || 0).toLocaleString()}
              </div>
              <div className="text-green-700 text-sm md:text-base">
                Total Levé
                {manualTotalData?.is_manual && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    Manuel
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Coins className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-blue-600">
                {status.total_tokens_sold.toLocaleString()}
              </div>
              <div className="text-blue-700 text-sm md:text-base">Tokens Vendus</div>
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-6 flex items-center justify-center text-gray-500 text-sm">
        <Calendar className="w-4 h-4 mr-2" />
        Dernière mise à jour: {new Date(status.last_updated).toLocaleString('fr-FR')}
      </div>

      {/* Finish Date */}
      {status.ico_finished && status.finish_date && (
        <div className="mt-4 bg-gray-50 rounded-xl p-4 text-center">
          <div className="text-gray-700 font-medium">
            ICO terminé le {new Date(status.finish_date).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      )}
    </div>
  )
}
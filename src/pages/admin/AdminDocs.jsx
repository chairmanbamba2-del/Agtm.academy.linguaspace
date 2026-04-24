// ============================================================
// AdminDocs.jsx — Documentation admin téléchargeable
// Route protégée : /admin/docs
// ============================================================
import { useState, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'

export default function AdminDocs() {
  const [activeDoc, setActiveDoc] = useState('presentation')
  const [presentationContent, setPresentationContent] = useState('')
  const [guideContent, setGuideContent] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDocuments()
  }, [])

  async function loadDocuments() {
    try {
      const [presRes, guideRes] = await Promise.all([
        fetch('/docs/PRESENTATION_LINGUA_SPACE.md').catch(() => null),
        fetch('/docs/GUIDE_ADMIN_LINGUA_SPACE.md').catch(() => null),
      ])
      
      setPresentationContent(presRes?.ok ? await presRes.text() : '# Document non disponible\n\nLe fichier de présentation n\'a pas pu être chargé.')
      setGuideContent(guideRes?.ok ? await guideRes.text() : '# Document non disponible\n\nLe guide admin n\'a pas pu être chargé.')
    } catch (err) {
      console.error('Erreur chargement documents:', err)
      setPresentationContent('# Erreur de chargement\n\n' + err.message)
      setGuideContent('# Erreur de chargement\n\n' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = (content, filename) => {
    // Créer une nouvelle fenêtre avec le contenu formaté
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Veuillez autoriser les popups pour générer le PDF')
      return
    }

    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${filename}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
            background: #fff;
          }
          
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #f59e0b;
            padding-bottom: 20px;
          }
          
          .logo {
            font-size: 32px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 10px;
          }
          
          .logo span {
            color: #f59e0b;
          }
          
          .subtitle {
            font-size: 18px;
            color: #64748b;
            font-weight: 500;
          }
          
          .meta {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
            font-size: 14px;
            color: #94a3b8;
          }
          
          h1 {
            font-size: 28px;
            color: #1e293b;
            margin: 30px 0 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e2e8f0;
          }
          
          h2 {
            font-size: 22px;
            color: #334155;
            margin: 25px 0 15px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e2e8f0;
          }
          
          h3 {
            font-size: 18px;
            color: #475569;
            margin: 20px 0 12px;
          }
          
          p {
            margin-bottom: 16px;
            text-align: justify;
          }
          
          ul, ol {
            margin-left: 24px;
            margin-bottom: 20px;
          }
          
          li {
            margin-bottom: 8px;
          }
          
          code {
            background: #f1f5f9;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
          }
          
          pre {
            background: #f8fafc;
            padding: 16px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            margin: 20px 0;
            overflow-x: auto;
            font-family: 'Courier New', monospace;
            font-size: 14px;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          
          th, td {
            border: 1px solid #e2e8f0;
            padding: 12px;
            text-align: left;
          }
          
          th {
            background: #f8fafc;
            font-weight: 600;
          }
          
          .highlight {
            background: #fffbeb;
            padding: 16px;
            border-left: 4px solid #f59e0b;
            margin: 20px 0;
            border-radius: 4px;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
          }
          
          @media print {
            body {
              padding: 0;
            }
            
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">LINGUA<span>SPACE</span></div>
          <div class="subtitle">${filename.includes('Présentation') ? 'Plateforme d\'Apprentissage des Langues Intelligente' : 'Guide d\'Administration Complet'}</div>
          <div class="meta">
            <div>Date: ${new Date().toLocaleDateString('fr-FR')}</div>
            <div>Document: ${filename}</div>
          </div>
        </div>
        
        <div id="content">
          ${content
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
            .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
            .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2" style="max-width:100%;">')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
            .replace(/^\s*-\s*(.*$)/gim, '<li>$1</li>')
            .replace(/^\s*\*\s*(.*$)/gim, '<li>$1</li>')
            .replace(/^\s*\d+\.\s*(.*$)/gim, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
            .replace(/<\/ul>\s*<ul>/g, '')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/<p><\/p>/g, '')
            .replace(/^>\s*(.*$)/gim, '<div class="highlight">$1</div>')
            .replace(/\|(.*?)\|/g, (match) => {
              const rows = match.split('\\n').filter(r => r.includes('|'))
              if (rows.length < 2) return match
              
              let html = '<table>'
              rows.forEach((row, i) => {
                const cells = row.split('|').filter(c => c.trim() !== '')
                if (cells.length === 0) return
                
                html += i === 0 ? '<thead><tr>' : '<tr>'
                cells.forEach(cell => {
                  const content = cell.trim()
                  if (i === 0) {
                    html += `<th>${content}</th>`
                  } else {
                    html += `<td>${content}</td>`
                  }
                })
                html += i === 0 ? '</tr></thead><tbody>' : '</tr>'
              })
              html += '</tbody></table>'
              return html
            })
          }
        </div>
        
        <div class="footer">
          <p>LINGUA SPACE &copy; ${new Date().getFullYear()} — Tous droits réservés</p>
          <p>Document généré le ${new Date().toLocaleString('fr-FR')}</p>
          <p class="no-print">Pour imprimer: Ctrl+P ou Fichier > Imprimer</p>
        </div>
        
        <script>
          window.onload = function() {
            // Auto-impression optionnelle
            // window.print();
            
            // Message pour l'utilisateur
            document.title = "${filename}";
          }
        </script>
      </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    
    // Après un délai, proposer l'impression
    setTimeout(() => {
      printWindow.print()
      // printWindow.close() // Optionnel: fermer après impression
    }, 500)
  }

  const currentContent = activeDoc === 'presentation' ? presentationContent : guideContent
  const currentFilename = activeDoc === 'presentation' 
    ? 'Présentation_LINGUA_SPACE.pdf' 
    : 'Guide_Admin_LINGUA_SPACE.pdf'

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-400">Chargement des documents...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Documentation Admin</h1>
          <p className="text-gray-400 mt-2">
            Guides complets et présentation téléchargeables en PDF
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-800 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveDoc('presentation')}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm
                ${activeDoc === 'presentation'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'
                }
              `}
            >
              Présentation LINGUA SPACE
            </button>
            <button
              onClick={() => setActiveDoc('guide')}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm
                ${activeDoc === 'guide'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'
                }
              `}
            >
              Guide d'Administration
            </button>
          </nav>
        </div>

        {/* Actions */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {activeDoc === 'presentation' ? 'Présentation Complète' : 'Guide Admin Complet'}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {activeDoc === 'presentation' 
                ? 'Document de présentation technique et marketing' 
                : 'Guide détaillé pour administrateurs et super-admins'}
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => downloadPDF(currentContent, currentFilename)}
              className="bg-primary hover:bg-primary/80 text-white font-medium py-2 px-6 rounded-lg transition flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Télécharger PDF
            </button>
            <button
              onClick={() => window.print()}
              className="bg-dark-700 hover:bg-dark-600 text-white font-medium py-2 px-6 rounded-lg transition flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimer
            </button>
          </div>
        </div>

        {/* Document Preview */}
        <div className="bg-dark-800 rounded-xl p-6 border border-gray-800">
          <div className="prose prose-invert max-w-none">
            <div className="markdown-content whitespace-pre-wrap font-mono text-sm leading-relaxed">
              {currentContent.split('\n').map((line, i) => {
                const renderInline = (text) => {
                  const parts = text.split(/(\*\*.*?\*\*)/g)
                  return parts.map((part, j) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={j} className="text-white font-bold">{part.slice(2, -2)}</strong>
                    }
                    return part
                  })
                }
                if (line.startsWith('# ')) {
                  return <h1 key={i} className="text-2xl font-bold text-white mt-6 mb-4">{renderInline(line.substring(2))}</h1>
                }
                if (line.startsWith('## ')) {
                  return <h2 key={i} className="text-xl font-bold text-white mt-5 mb-3">{renderInline(line.substring(3))}</h2>
                }
                if (line.startsWith('### ')) {
                  return <h3 key={i} className="text-lg font-bold text-white mt-4 mb-2">{renderInline(line.substring(4))}</h3>
                }
                if (line.startsWith('#### ')) {
                  return <h4 key={i} className="text-base font-bold text-white mt-3 mb-2">{renderInline(line.substring(5))}</h4>
                }
                if (line.startsWith('- ') || line.startsWith('* ') || /^\d+\./.test(line)) {
                  const text = line.startsWith('- ') ? line.substring(2) : line.startsWith('* ') ? line.substring(2) : line.replace(/^\d+\.\s*/, '')
                  return <div key={i} className="ml-4 text-gray-300">• {renderInline(text)}</div>
                }
                if (line.startsWith('> ')) {
                  return <div key={i} className="bg-dark-700 border-l-4 border-primary pl-4 py-2 my-2 text-gray-300">{renderInline(line.substring(2))}</div>
                }
                if (line.includes('---')) {
                  return <hr key={i} className="my-6 border-gray-700" />
                }
                if (line.includes('|') && line.includes('|')) {
                  return <div key={i} className="text-gray-400 font-mono text-xs my-2">{line}</div>
                }
                if (line.trim() === '') {
                  return <br key={i} />
                }
                return <div key={i} className="text-gray-300 my-2">{renderInline(line)}</div>
              })}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-dark-700/50 rounded-lg border border-gray-800">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-medium text-white">Note sur la génération PDF</h3>
              <p className="text-gray-400 text-sm mt-1">
                Le bouton "Télécharger PDF" ouvre une nouvelle fenêtre avec le document formaté. 
                Utilisez l'impression du navigateur (Ctrl+P) et sélectionnez "Enregistrer au format PDF" 
                comme imprimante pour générer un fichier PDF de haute qualité.
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Les documents source sont stockés dans <code className="text-gray-400">/docs/</code> et peuvent être mis à jour manuellement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
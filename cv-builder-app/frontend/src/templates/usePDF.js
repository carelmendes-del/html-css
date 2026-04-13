// usePDF.js
// Hook de geração de PDF com wrapper A4 fixo e paginação automática
// Dependências: npm install html2canvas jspdf

import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// ─────────────────────────────────────────────────────────
// CONSTANTES A4
// ─────────────────────────────────────────────────────────
const A4_WIDTH_PX  = 794;   // largura A4 a 96dpi
const A4_HEIGHT_PX = 1123;  // altura A4 a 96dpi

// ─────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────
export function usePDF() {
  const printRef = useRef(null);

  async function gerarPDF(nomeArquivo = 'cv.pdf') {
    const elemento = printRef.current;
    if (!elemento) {
      console.error('usePDF: printRef não está ligado a nenhum elemento.');
      return;
    }

    try {
      // 1. Capturar o elemento como canvas
      const canvas = await html2canvas(elemento, {
        scale: 2,              // qualidade 2x para impressão nítida
        useCORS: true,         // permite imagens externas (fotos de perfil)
        allowTaint: true,
        width: A4_WIDTH_PX,
        windowWidth: A4_WIDTH_PX,  // forçar largura A4 — evita reflow
        scrollX: 0,
        scrollY: -window.scrollY,  // capturar desde o topo independente do scroll
        backgroundColor: '#ffffff'
      });

      const imgData   = canvas.toDataURL('image/png');
      const imgWidth  = A4_WIDTH_PX;
      const imgHeight = canvas.height * (imgWidth / canvas.width);

      // 2. Criar PDF com formato A4
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [A4_WIDTH_PX, A4_HEIGHT_PX],
        hotfixes: ['px_scaling']
      });

      // 3. Paginação dinâmica — divide o canvas em páginas A4
      let posicaoY     = 0;
      let alturaRestante = imgHeight;
      let primeiraPagina = true;

      while (alturaRestante > 0) {
        if (!primeiraPagina) {
          pdf.addPage();
        }

        // Desenha o canvas posicionado para mostrar a secção correcta
        pdf.addImage(
          imgData,
          'PNG',
          0,               // x
          -posicaoY,       // y negativo — desloca para a secção correcta
          imgWidth,
          imgHeight
        );

        alturaRestante -= A4_HEIGHT_PX;
        posicaoY       += A4_HEIGHT_PX;
        primeiraPagina  = false;
      }

      pdf.save(nomeArquivo);

    } catch (erro) {
      console.error('usePDF: erro ao gerar PDF —', erro);
    }
  }

  return { printRef, gerarPDF };
}


// ─────────────────────────────────────────────────────────
// COMPONENTE WRAPPER — envolve o TemplateEngine
// Usar este componente no lugar onde renderizas o CV
// ─────────────────────────────────────────────────────────
export function CVPrintWrapper({ children, printRef }) {
  return (
    <div
      ref={printRef}
      id="cv-print-area"
      style={{
        width: `${A4_WIDTH_PX}px`,       // largura A4 fixa — garante layout consistente
        minHeight: `${A4_HEIGHT_PX}px`,  // altura mínima A4
        margin: '0 auto',
        position: 'relative',
        backgroundColor: '#ffffff',
        boxSizing: 'border-box',
        overflow: 'visible',             // não cortar conteúdo de 2ª página
        boxShadow: '0 0 20px rgba(0,0,0,0.1)' // só visível no browser, não no PDF
      }}
    >
      {children}
    </div>
  );
}


// ─────────────────────────────────────────────────────────
// EXEMPLO DE USO NO COMPONENTE PAI
// ─────────────────────────────────────────────────────────
//
// import { usePDF, CVPrintWrapper } from './usePDF';
// import TemplateEngine from './TemplateEngine';
//
// function PaginaCV({ templateConfig, data }) {
//   const { printRef, gerarPDF } = usePDF();
//
//   return (
//     <div>
//       {/* Wrapper com ref ligado — garante largura A4 fixa */}
//       <CVPrintWrapper printRef={printRef}>
//         <TemplateEngine
//           templateConfig={templateConfig}
//           data={data}
//           lang="pt"
//         />
//       </CVPrintWrapper>
//
//       {/* Botão de download */}
//       <button onClick={() => gerarPDF(`cv_${data.name}.pdf`)}>
//         Baixar PDF
//       </button>
//     </div>
//   );
// }

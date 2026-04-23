import { jsPDF } from 'jspdf';

export const generateExclusivityPDF = (property: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 15;

  // Helper functions for PDF styling
  const drawSectionHeader = (title: string, num: string, currentY: number) => {
    doc.setFillColor(245, 245, 245);
    doc.rect(20, currentY, pageWidth - 40, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(`${num}. ${title.toUpperCase()}`, 25, currentY + 5.5);
    return currentY + 12;
  };

  const addField = (label: string, value: string | number, x: number, currentY: number, lineLength: number = 40) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`${label}:`, x, currentY);
    
    const labelWidth = doc.getTextWidth(`${label}: `);
    
    if (value && value !== '---') {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0);
      doc.text(`${value}`, x + labelWidth, currentY);
    } else {
      // Draw a line for handwriting
      doc.setDrawColor(200);
      doc.setLineWidth(0.1);
      doc.line(x + labelWidth, currentY + 1, x + labelWidth + lineLength, currentY + 1);
    }
  };

  const drawWatermark = () => {
    // Semi-transparent brand color for watermark
    doc.setTextColor(220, 235, 222);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    doc.text("CR IMÓVEIS DE LUXO", pageWidth / 2, pageHeight / 2 + 20, { angle: 45, align: 'center', renderingMode: 'fill' });
    // Reset color
    doc.setTextColor(30, 30, 30);
  };

  drawWatermark();

  // Header
  doc.setFontSize(18);
  doc.setTextColor(97, 121, 100); // #617964 - Brand Color
  doc.setFont('helvetica', 'bold');
  doc.text('CR IMÓVEIS DE LUXO', pageWidth / 2, y, { align: 'center' });
  y += 7;
  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.text('IMOBILIÁRIA ESPECIALISTA EM MERCADO DE ALTO PADRÃO | CRECI/MG 9469', pageWidth / 2, y, { align: 'center' });
  y += 10;
  
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.text('FICHA DE CADASTRO E AUTORIZAÇÃO EXCLUSIVA DE INTERMEDIAÇÃO', pageWidth / 2, y, { align: 'center' });
  y += 3;
  doc.setDrawColor(97, 121, 100);
  doc.setLineWidth(0.8);
  doc.line(pageWidth/2 - 40, y, pageWidth/2 + 40, y);
  y += 12;

  // 1. DADOS DO PROPRIETÁRIO
  y = drawSectionHeader('Dados do Proprietário', '1', y);
  doc.setFontSize(8);
  addField('NOME COMPLETO', property.ownerName, 25, y, 140);
  y += 6;
  addField('CPF', property.ownerCpf, 25, y, 50);
  addField('RG', property.ownerRg, 90, y, 40);
  addField('ÓRGÃO', property.ownerRgOrg, 145, y, 20);
  y += 6;
  addField('ESTADO CIVIL', property.ownerMaritalStatus, 25, y, 50);
  addField('PROFISSÃO', property.ownerProfession, 90, y, 45);
  addField('NACIONALIDADE', property.ownerNationality, 145, y, 20);
  y += 6;
  addField('TELEFONE (WHATSAPP)', property.ownerPhone || property.ownerPhone2, 25, y, 60);
  addField('E-MAIL', property.ownerEmail, 110, y, 70);
  y += 6;
  const ownerAddr = property.ownerAddress ? `${property.ownerAddress}, No ${property.ownerNumber || 'S/N'}` : '';
  addField('ENDEREÇO RESIDENCIAL', ownerAddr, 25, y, 140);
  y += 6;
  addField('BAIRRO', property.ownerBairro, 25, y, 50);
  const ownerCityState = property.ownerCity ? `${property.ownerCity}${property.ownerState ? ` - ${property.ownerState}` : ''}` : '';
  addField('CIDADE/UF', ownerCityState, 90, y, 60);
  addField('CEP', property.ownerCep, 165, y, 15);
  y += 12;

  // 2. DADOS DO IMÓVEL OBJETO DA INTERMEDIAÇÃO
  y = drawSectionHeader('Dados do Imóvel', '2', y);
  const logradouro = property.propertyStreet || (property.location ? property.location.split(',')[0] : '');
  addField('LOGRADOURO', logradouro, 25, y, 120);
  addField('NÚMERO', property.propertyNumber, 165, y, 15);
  y += 6;
  addField('COMPLEMENTO', property.propertyComplement, 25, y, 140);
  y += 6;
  addField('BAIRRO', property.propertyNeighborhood, 25, y, 50);
  const propertyCityState = property.propertyCity ? `${property.propertyCity}${property.propertyState ? ` - ${property.propertyState}` : ''}` : '';
  addField('CIDADE/UF', propertyCityState, 90, y, 60);
  addField('CEP', property.propertyCep, 165, y, 15);
  y += 6;
  addField('MATRÍCULA Nº', property.matricula, 25, y, 50);
  addField('INSCRIÇÃO IPTU', property.inscricaoIptu, 90, y, 50);
  y += 6;
  addField('ÁREA CONSTRUÍDA', property.area ? `${property.area} m²` : '', 25, y, 50);
  addField('ÁREA DO TERRENO', property.landArea ? `${property.landArea} m²` : '', 90, y, 50);
  y += 6;
  addField('VALOR IPTU (ANUAL)', property.iptu, 25, y, 50);
  addField('CONDOMÍNIO (MENSAL)', property.condoFee || property.condominium, 90, y, 50);
  y += 8;

  // Descrição do Imóvel
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIÇÃO DO IMÓVEL:', 25, y);
  y += 4;
  
  if (property.description && property.description !== '---') {
    doc.setFont('helvetica', 'normal');
    const splitDesc = doc.splitTextToSize(property.description, pageWidth - 50);
    doc.text(splitDesc, 25, y);
    y += (splitDesc.length * 4) + 6;
  } else {
    // Draw lines for manual writing
    doc.setDrawColor(200);
    for (let i = 0; i < 4; i++) {
      doc.line(25, y + 2, pageWidth - 25, y + 2);
      y += 6;
    }
    y += 2;
  }

  addField('VALOR PARA VENDA', property.vendaPrice || property.price, 25, y, 50);
  addField('VALOR PARA LOCAÇÃO', property.locacaoPrice, 110, y, 50);
  y += 12;

  // 3. CONDIÇÕES DA EXCLUSIVIDADE E REMUNERAÇÃO
  y = drawSectionHeader('Condições da Exclusividade e Remuneração', '3', y);
  
  addField('COMISSÃO PACTUADA', `${property.commissionPercentage || 6}%`, 25, y);
  y += 8;

  doc.setFontSize(8);
  const bullets = [
    `O proprietário concede à IMOBILIÁRIA CR IMÓVEIS DE LUXO, CRECI/MG 9469, com exclusividade, o direito de anunciar, divulgar e negociar a venda ou locação do imóvel descrito nesta ficha.`,
    `PRAZO DE EXCLUSIVIDADE: ${property.exclusivityDays || 90} DIAS CORRIDOS, contados da data da assinatura desta ficha.`,
    `Durante o prazo de exclusividade, o proprietário não realizará anúncios, negociações ou intermediações por conta própria ou por terceiros.`,
    `Caso a venda/locação seja realizada diretamente pelo proprietário ou por terceiros durante o período de exclusividade, a comissão será devida integralmente à corretora.`,
    `Após o término do prazo de exclusividade, permanece devido à corretora a comissão caso a venda/locação seja efetivada com cliente apresentado por ela durante a vigência desta autorização, dentro do prazo de 180 (cento e oitenta) dias após o encerramento do contrato.`,
    `O proprietário autoriza a corretora a divulgar o imóvel em todos os meios de comunicação, inclusive internet, redes sociais, placas, materiais impressos e imprensa, bem como a compartilhar com outras imobiliárias e corretores.`,
    `As informações fornecidas sobre o imóvel são de inteira responsabilidade do proprietário, que responde por sua veracidade e regularidade documental.`
  ];

  bullets.forEach(bullet => {
    // Split text leaving room for the bullet
    const splitBullet = doc.splitTextToSize(bullet, pageWidth - 55);
    doc.text("•", 25, y);
    doc.text(splitBullet, 28, y);
    y += (splitBullet.length * 3.5) + 3;
  });

  y += 4;
  
  // 4. DECLARAÇÃO DO PROPRIETÁRIO
  y = drawSectionHeader('Declaração do Proprietário', '4', y);
  const decText = "Declaro que as informações acima prestadas são verdadeiras e que o imóvel objeto desta autorização encontra-se em condições de ser comercializado, livre e desembaraçado de quaisquer ônus judiciais ou extrajudiciais, salvo se mencionado em campo de observações adicionais.";
  const splitDec = doc.splitTextToSize(decText, pageWidth - 45);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(splitDec, 25, y);
  y += (splitDec.length * 4) + 8;

  // 5. FUNDAMENTAÇÃO LEGAL
  y = drawSectionHeader('Fundamentação Legal', '5', y);
  doc.setFontSize(7.5);
  const legalBase = "Esta autorização é regida pelos termos da Lei Federal nº 6.530/1978, Decreto nº 81.871/1978 e Resoluções COFECI. O descumprimento da exclusividade durante a vigência deste instrumento ensejará o pagamento da comissão integral pactuada no item 3.";
  const splitLegal = doc.splitTextToSize(legalBase, pageWidth - 45);
  doc.text(splitLegal, 25, y);
  
  // Page Footer
  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text('Página 1 de 2', pageWidth - 30, pageHeight - 10);
  
  // PAGE 2
  doc.addPage();
  drawWatermark();
  
  y = 20;

  // 6. TESTEMUNHAS / SIGNATÁRIOS
  y = drawSectionHeader('Signatários e Testemunhas', '6', y);
  
  // Testimony boxes
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('TESTEMUNHA 1', 25, y);
  y += 5;
  addField('NOME', property.witness1Name, 25, y);
  y += 5;
  addField('CPF', property.witness1Cpf, 25, y);
  addField('RG', property.witness1Rg, 110, y);
  y += 10;
  doc.setLineWidth(0.1);
  doc.line(25, y, 100, y);
  doc.text('ASSINATURA TESTEMUNHA 1', 25, y + 4);
  
  y += 15;
  doc.setFont('helvetica', 'bold');
  doc.text('TESTEMUNHA 2', 25, y);
  y += 5;
  addField('NOME', property.witness2Name, 25, y);
  y += 5;
  addField('CPF', property.witness2Cpf, 25, y);
  addField('RG', property.witness2Rg, 110, y);
  y += 10;
  doc.line(25, y, 100, y);
  doc.text('ASSINATURA TESTEMUNHA 2', 25, y + 4);
  
  y += 20;

  // 7. CORRETORA RESPONSÁVEL
  y = drawSectionHeader('Corretora Responsável', '7', y);
  addField('IMOBILIÁRIA', 'CR IMÓVEIS DE LUXO', 25, y);
  addField('CRECI/MG', '9469', 110, y);
  y += 6;
  addField('GESTOR RESPONSÁVEL', property.broker || 'Daniel Vale', 25, y);
  y += 15;

  // 8. FORO
  y = drawSectionHeader('Foro', '8', y);
  const foroText = "As partes elegem o foro da Comarca de Juiz de Fora/MG para dirimir eventuais dúvidas oriundas deste instrumento.";
  const splitForo = doc.splitTextToSize(foroText, pageWidth - 45);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(splitForo, 25, y);
  y += (splitForo.length * 4) + 15;

  // Signature Area
  const sigBaseY = y + 20;
  doc.setLineWidth(0.5);
  
  // Calculate 3 columns for signatures
  const startX = 20;
  const lineW = 45;
  const gap = (pageWidth - 40 - (lineW * 3)) / 2;
  
  const x1 = startX;
  const cx1 = x1 + (lineW / 2);
  const x2 = x1 + lineW + gap;
  const cx2 = x2 + (lineW / 2);
  const x3 = x2 + lineW + gap;
  const cx3 = x3 + (lineW / 2);

  doc.line(x1, sigBaseY, x1 + lineW, sigBaseY);
  doc.line(x2, sigBaseY, x2 + lineW, sigBaseY);
  doc.line(x3, sigBaseY, x3 + lineW, sigBaseY);
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('PROPRIETÁRIO', cx1, sigBaseY + 5, { align: 'center' });
  doc.text('CORRETOR', cx2, sigBaseY + 5, { align: 'center' });
  doc.text('IMOBILIÁRIA', cx3, sigBaseY + 5, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(property.ownerName || '', cx1, sigBaseY + 9, { align: 'center' });
  doc.text(property.broker || 'Daniel Vale', cx2, sigBaseY + 9, { align: 'center' });
  doc.text('CR IMÓVEIS DE LUXO', cx3, sigBaseY + 9, { align: 'center' });

  y = sigBaseY + 25;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  const locationDate = `Juiz de Fora/MG, ${new Date(property.signatureDate || new Date()).toLocaleDateString('pt-BR')}`;
  doc.text(locationDate, pageWidth / 2, y, { align: 'center' });

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text('Página 2 de 2', pageWidth - 30, pageHeight - 10);
  doc.text(`Documento gerado eletronicamente em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, pageHeight - 10);

  doc.save(`FICHA_CURADORIA_${property.code || 'DOC'}.pdf`);
};

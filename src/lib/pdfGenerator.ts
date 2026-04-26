import { jsPDF } from 'jspdf';

export const generateExclusivityPDF = (property: any, options: { returnUri?: boolean } = {}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 15;
  let pageNum = 1;

  const drawFooter = () => {
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`Página ${pageNum}`, pageWidth - 30, pageHeight - 10);
    doc.text(`Documento gerado eletronicamente em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, pageHeight - 10);
  };

  const drawWatermark = () => {
    const prevSize = doc.getFontSize();
    const prevFont = doc.getFont();
    const prevColor = doc.getTextColor();

    doc.setTextColor(220, 235, 222);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    doc.text("CR IMÓVEIS DE LUXO", pageWidth / 2, pageHeight / 2, { angle: 45, align: 'center', baseline: 'middle', renderingMode: 'fill' });
    
    doc.setTextColor(prevColor);
    doc.setFontSize(prevSize);
    doc.setFont(prevFont.fontName, prevFont.fontStyle);
  };

  const checkPageBreak = (currentY: number, requiredSpace: number = 10) => {
    if (currentY + requiredSpace > pageHeight - 20) {
      drawFooter();
      doc.addPage();
      pageNum++;
      drawWatermark();
      return 20; // New y
    }
    return currentY;
  };

  // Helper functions for PDF styling
  const drawSectionHeader = (title: string, num: string, currentY: number) => {
    currentY = checkPageBreak(currentY, 15);
    doc.setFillColor(245, 245, 245);
    doc.rect(20, currentY, pageWidth - 40, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(`${num}. ${title.toUpperCase()}`, 25, currentY + 5.5);
    return currentY + 12;
  };

  const addField = (label: string, value: string | number | undefined, x: number, currentY: number, lineLength: number = 40) => {
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
  y = checkPageBreak(y, 10);
  doc.setFontSize(8);
  addField('NOME COMPLETO', property.ownerName, 25, y, 140);
  y += 6;
  y = checkPageBreak(y, 10);
  addField('CPF', property.ownerCpf, 25, y, 50);
  addField('RG', property.ownerRg, 90, y, 40);
  addField('ÓRGÃO', property.ownerRgOrg, 145, y, 20);
  y += 6;
  y = checkPageBreak(y, 10);
  addField('ESTADO CIVIL', property.ownerMaritalStatus, 25, y, 50);
  addField('PROFISSÃO', property.ownerProfession, 90, y, 45);
  addField('NACIONALIDADE', property.ownerNationality, 145, y, 20);
  y += 6;
  y = checkPageBreak(y, 10);
  addField('TELEFONE (WHATSAPP)', property.ownerPhone || property.ownerPhone2, 25, y, 60);
  addField('E-MAIL', property.ownerEmail, 110, y, 70);
  y += 6;
  y = checkPageBreak(y, 10);
  const ownerAddr = property.ownerAddress ? `${property.ownerAddress}, No ${property.ownerNumber || 'S/N'}` : '';
  addField('ENDEREÇO RESIDENCIAL', ownerAddr, 25, y, 140);
  y += 6;
  y = checkPageBreak(y, 10);
  addField('BAIRRO', property.ownerBairro, 25, y, 50);
  const ownerCityState = property.ownerCity ? `${property.ownerCity}${property.ownerState ? ` - ${property.ownerState}` : ''}` : '';
  addField('CIDADE/UF', ownerCityState, 90, y, 60);
  addField('CEP', property.ownerCep, 165, y, 15);
  y += 12;

  // 2. DADOS DO IMÓVEL OBJETO DA INTERMEDIAÇÃO
  y = drawSectionHeader('Dados do Imóvel', '2', y);
  y = checkPageBreak(y, 10);
  const logradouro = property.propertyStreet || (property.location ? property.location.split(',')[0] : '');
  addField('LOGRADOURO', logradouro, 25, y, 120);
  addField('NÚMERO', property.propertyNumber, 165, y, 15);
  y += 6;
  y = checkPageBreak(y, 10);
  addField('COMPLEMENTO', property.propertyComplement, 25, y, 140);
  y += 6;
  y = checkPageBreak(y, 10);
  addField('BAIRRO', property.propertyNeighborhood, 25, y, 50);
  const propertyCityState = property.propertyCity ? `${property.propertyCity}${property.propertyState ? ` - ${property.propertyState}` : ''}` : '';
  addField('CIDADE/UF', propertyCityState, 90, y, 60);
  addField('CEP', property.propertyCep, 165, y, 15);
  y += 6;
  y = checkPageBreak(y, 10);
  addField('MATRÍCULA Nº', property.matricula, 25, y, 50);
  addField('INSCRIÇÃO IPTU', property.inscricaoIptu, 90, y, 50);
  y += 6;
  y = checkPageBreak(y, 10);
  addField('ÁREA CONSTRUÍDA', property.area ? `${property.area} m²` : '', 25, y, 50);
  addField('ÁREA DO TERRENO', property.landArea ? `${property.landArea} m²` : '', 90, y, 50);
  y += 6;
  y = checkPageBreak(y, 10);
  addField('VALOR IPTU (ANUAL)', property.iptu, 25, y, 50);
  addField('CONDOMÍNIO (MENSAL)', property.condoFee || property.condominium, 90, y, 50);
  y += 8;

  // Descrição do Imóvel
  y = checkPageBreak(y, 10);
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIÇÃO DO IMÓVEL:', 25, y);
  y += 4;
  
  if (property.description && property.description !== '---') {
    doc.setFont('helvetica', 'normal');
    const splitDesc = doc.splitTextToSize(property.description, pageWidth - 50);
    y = checkPageBreak(y, (splitDesc.length * 4) + 6);
    doc.text(splitDesc, 25, y);
    y += (splitDesc.length * 4) + 6;
  } else {
    // Draw lines for manual writing
    doc.setDrawColor(200);
    y = checkPageBreak(y, 30);
    for (let i = 0; i < 4; i++) {
      doc.line(25, y + 2, pageWidth - 25, y + 2);
      y += 6;
    }
    y += 2;
  }

  y = checkPageBreak(y, 10);
  addField('VALOR PARA VENDA', property.vendaPrice || property.price, 25, y, 50);
  addField('VALOR PARA LOCAÇÃO', property.locacaoPrice, 110, y, 50);
  y += 12;

  // 3. CONDIÇÕES DA EXCLUSIVIDADE E REMUNERAÇÃO
  y = drawSectionHeader('Condições da Exclusividade e Remuneração', '3', y);
  y = checkPageBreak(y, 10);
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
    y = checkPageBreak(y, (splitBullet.length * 3.5) + 3);
    doc.text("•", 25, y);
    doc.text(splitBullet, 28, y);
    y += (splitBullet.length * 3.5) + 3;
  });

  y += 4;
  
  // 4. DECLARAÇÃO DO PROPRIETÁRIO
  y = drawSectionHeader('Declaração do Proprietário', '4', y);
  const decText = "Declaro que as informações acima prestadas são verdadeiras e que o imóvel objeto desta autorização encontra-se em condições de ser comercializado, livre e desembaraçado de quaisquer ônus judiciais ou extrajudiciais, salvo se mencionado em campo de observações adicionais.";
  const splitDec = doc.splitTextToSize(decText, pageWidth - 45);
  y = checkPageBreak(y, (splitDec.length * 4) + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(splitDec, 25, y);
  y += (splitDec.length * 4) + 8;

  // 5. FUNDAMENTAÇÃO LEGAL
  y = drawSectionHeader('Fundamentação Legal', '5', y);
  doc.setFontSize(7.5);
  const legalBase = "Esta autorização é regida pelos termos da Lei Federal nº 6.530/1978, Decreto nº 81.871/1978 e Resoluções COFECI. O descumprimento da exclusividade durante a vigência deste instrumento ensejará o pagamento da comissão integral pactuada no item 3.";
  const splitLegal = doc.splitTextToSize(legalBase, pageWidth - 45);
  y = checkPageBreak(y, (splitLegal.length * 4) + 10);
  doc.text(splitLegal, 25, y);
  y += (splitLegal.length * 4) + 12;
  
  // 6. TESTEMUNHAS / SIGNATÁRIOS
  y = drawSectionHeader('Signatários e Testemunhas', '6', y);
  
  // Testimony boxes
  y = checkPageBreak(y, 15);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('TESTEMUNHA 1', 25, y);
  y += 5;
  addField('NOME', property.witness1Name, 25, y);
  y += 5;
  y = checkPageBreak(y, 15);
  addField('CPF', property.witness1Cpf, 25, y);
  addField('RG', property.witness1Rg, 110, y);
  y += 10;
  doc.setLineWidth(0.1);
  doc.line(25, y, 100, y);
  doc.text('ASSINATURA TESTEMUNHA 1', 25, y + 4);
  
  y += 15;
  y = checkPageBreak(y, 15);
  doc.setFont('helvetica', 'bold');
  doc.text('TESTEMUNHA 2', 25, y);
  y += 5;
  addField('NOME', property.witness2Name, 25, y);
  y += 5;
  y = checkPageBreak(y, 15);
  addField('CPF', property.witness2Cpf, 25, y);
  addField('RG', property.witness2Rg, 110, y);
  y += 10;
  doc.line(25, y, 100, y);
  doc.text('ASSINATURA TESTEMUNHA 2', 25, y + 4);
  
  y += 20;

  // 7. CORRETORA RESPONSÁVEL
  y = drawSectionHeader('Corretora Responsável', '7', y);
  y = checkPageBreak(y, 10);
  addField('IMOBILIÁRIA', 'CR IMÓVEIS DE LUXO', 25, y);
  addField('CRECI/MG', '9469', 110, y);
  y += 6;
  y = checkPageBreak(y, 10);
  addField('GESTOR RESPONSÁVEL', property.broker || 'Daniel Vale', 25, y);
  y += 15;

  // 8. FORO
  y = drawSectionHeader('Foro', '8', y);
  const foroText = "As partes elegem o foro da Comarca de Juiz de Fora/MG para dirimir eventuais dúvidas oriundas deste instrumento.";
  const splitForo = doc.splitTextToSize(foroText, pageWidth - 45);
  y = checkPageBreak(y, (splitForo.length * 4) + 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(splitForo, 25, y);
  y += (splitForo.length * 4) + 15;

  y = checkPageBreak(y, 40); // Ensures signature has space

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
  const dateStr = property.signatureDate ? new Date(property.signatureDate).toLocaleDateString('pt-BR') : '___/___/____';
  const locationDate = `Juiz de Fora/MG, ${dateStr}`;
  doc.text(locationDate, pageWidth / 2, y, { align: 'center' });

  // Final Footer Call for the last page
  drawFooter();

  if (options.returnUri) {
    return doc.output('datauristring');
  }

  doc.save(`FICHA_CURADORIA_${property.code || 'DOC'}.pdf`);
};

export const generateNonExclusivityPDF = (property: any, options: { returnUri?: boolean } = {}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 15;
  let pageNum = 1;

  const drawFooter = () => {
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`Página ${pageNum}`, pageWidth - 30, pageHeight - 10);
    doc.text(`Documento gerado eletronicamente em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, pageHeight - 10);
  };

  const drawWatermark = () => {
    const prevSize = doc.getFontSize();
    const prevFont = doc.getFont();
    const prevColor = doc.getTextColor();

    doc.setTextColor(220, 235, 222);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    doc.text("CR IMÓVEIS DE LUXO", pageWidth / 2, pageHeight / 2, { angle: 45, align: 'center', baseline: 'middle', renderingMode: 'fill' });
    
    doc.setTextColor(prevColor);
    doc.setFontSize(prevSize);
    doc.setFont(prevFont.fontName, prevFont.fontStyle);
  };

  const checkPageBreak = (currentY: number, requiredSpace: number = 10) => {
    if (currentY + requiredSpace > pageHeight - 20) {
      drawFooter();
      doc.addPage();
      pageNum++;
      drawWatermark();
      return 20; // New y
    }
    return currentY;
  };

  const drawSectionHeader = (title: string, num: string, currentY: number) => {
    currentY = checkPageBreak(currentY, 15);
    doc.setFillColor(245, 245, 245);
    doc.rect(20, currentY, pageWidth - 40, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(`${num}. ${title.toUpperCase()}`, 25, currentY + 5.5);
    return currentY + 12;
  };

  const addField = (label: string, value: string | number | undefined, x: number, currentY: number, lineLength: number = 40) => {
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
      doc.setDrawColor(200);
      doc.setLineWidth(0.1);
      doc.line(x + labelWidth, currentY + 1, x + labelWidth + lineLength, currentY + 1);
    }
  };

  drawWatermark();

  // Header
  doc.setFontSize(18);
  doc.setTextColor(97, 121, 100);
  doc.setFont('helvetica', 'bold');
  doc.text('CR IMÓVEIS DE LUXO', pageWidth / 2, y, { align: 'center' });
  y += 7;
  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.text('IMOBILIÁRIA ESPECIALISTA EM MERCADO DE ALTO PADRÃO | CRECI/MG 9469', pageWidth / 2, y, { align: 'center' });
  y += 10;
  
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.text('FICHA DE CADASTRO E AUTORIZAÇÃO DE INTERMEDIAÇÃO (SEM EXCLUSIVIDADE)', pageWidth / 2, y, { align: 'center' });
  y += 3;
  doc.setDrawColor(97, 121, 100);
  doc.setLineWidth(0.8);
  doc.line(pageWidth/2 - 70, y, pageWidth/2 + 70, y);
  y += 12;

  // 1. DADOS DO PROPRIETÁRIO
  y = drawSectionHeader('Dados do Proprietário', '1', y);
  y = checkPageBreak(y, 10);
  doc.setFontSize(8);
  addField('NOME COMPLETO', property.ownerName, 25, y, 140);
  y += 6;
  y = checkPageBreak(y, 10);
  addField('CPF', property.ownerCpf, 25, y, 50);
  addField('RG', property.ownerRg, 90, y, 40);
  addField('ÓRGÃO', property.ownerRgOrg, 145, y, 20);
  y += 6;
  y = checkPageBreak(y, 10);
  addField('ESTADO CIVIL', property.ownerMaritalStatus, 25, y, 50);
  addField('PROFISSÃO', property.ownerProfession, 90, y, 45);
  addField('NACIONALIDADE', property.ownerNationality, 145, y, 20);
  y += 6;
  y = checkPageBreak(y, 10);
  addField('TELEFONE (WHATSAPP)', property.ownerPhone || property.ownerPhone2, 25, y, 60);
  addField('E-MAIL', property.ownerEmail, 110, y, 70);
  y += 6;
  y = checkPageBreak(y, 10);
  const ownerAddr = property.ownerAddress ? `${property.ownerAddress}, No ${property.ownerNumber || 'S/N'}` : '';
  addField('ENDEREÇO RESIDENCIAL', ownerAddr, 25, y, 140);
  y += 6;
  y = checkPageBreak(y, 10);
  addField('BAIRRO', property.ownerBairro, 25, y, 50);
  const ownerCityState = property.ownerCity ? `${property.ownerCity}${property.ownerState ? ` - ${property.ownerState}` : ''}` : '';
  addField('CIDADE/UF', ownerCityState, 90, y, 60);
  addField('CEP', property.ownerCep, 165, y, 15);
  y += 12;

  // 2. DADOS DO IMÓVEL
  y = drawSectionHeader('Dados do Imóvel', '2', y);
  y = checkPageBreak(y, 10);
  const logradouro = property.propertyStreet || (property.location ? property.location.split(',')[0] : '');
  addField('LOGRADOURO', logradouro, 25, y, 120);
  addField('NÚMERO', property.propertyNumber, 165, y, 15);
  y += 6;
  y = checkPageBreak(y, 10);
  addField('COMPLEMENTO', property.propertyComplement, 25, y, 140);
  y += 6;
  y = checkPageBreak(y, 10);
  addField('BAIRRO', property.propertyNeighborhood, 25, y, 50);
  const propertyCityState = property.propertyCity ? `${property.propertyCity}${property.propertyState ? ` - ${property.propertyState}` : ''}` : '';
  addField('CIDADE/UF', propertyCityState, 90, y, 60);
  addField('CEP', property.propertyCep, 165, y, 15);
  y += 6;
  y = checkPageBreak(y, 10);
  addField('MATRÍCULA Nº', property.matricula, 25, y, 50);
  addField('INSCRIÇÃO IPTU', property.inscricaoIptu, 90, y, 50);
  y += 6;
  y = checkPageBreak(y, 10);
  addField('ÁREA CONSTRUÍDA', property.area ? `${property.area} m²` : '', 25, y, 50);
  addField('ÁREA DO TERRENO', property.landArea ? `${property.landArea} m²` : '', 90, y, 50);
  y += 6;
  y = checkPageBreak(y, 10);
  addField('VALOR IPTU (ANUAL)', property.iptu, 25, y, 50);
  addField('CONDOMÍNIO (MENSAL)', property.condoFee || property.condominium, 90, y, 50);
  y += 8;

  // Descrição do Imóvel
  y = checkPageBreak(y, 10);
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIÇÃO DO IMÓVEL:', 25, y);
  y += 4;
  
  if (property.description && property.description !== '---') {
    doc.setFont('helvetica', 'normal');
    const splitDesc = doc.splitTextToSize(property.description, pageWidth - 50);
    y = checkPageBreak(y, (splitDesc.length * 4) + 6);
    doc.text(splitDesc, 25, y);
    y += (splitDesc.length * 4) + 6;
  } else {
    doc.setDrawColor(200);
    y = checkPageBreak(y, 30);
    for (let i = 0; i < 4; i++) {
      doc.line(25, y + 2, pageWidth - 25, y + 2);
      y += 6;
    }
    y += 2;
  }

  y = checkPageBreak(y, 10);
  addField('VALOR PARA VENDA', property.vendaPrice || property.price, 25, y, 50);
  addField('VALOR PARA LOCAÇÃO', property.locacaoPrice, 110, y, 50);
  y += 12;

  // 3. CONDIÇÕES DA INTERMEDIAÇÃO E REMUNERAÇÃO
  y = drawSectionHeader('Condições da Intermediação e Remuneração', '3', y);
  y = checkPageBreak(y, 10);
  addField('COMISSÃO PACTUADA', `${property.commissionPercentage || 6}%`, 25, y);
  y += 8;

  doc.setFontSize(8);
  const bullets = [
    `O proprietário autoriza a imobiliária a anunciar, divulgar e intermediar a venda ou locação do imóvel descrito nesta ficha, sem caráter de exclusividade.`,
    `O proprietário poderá anunciar, negociar ou contratar outros corretores e imobiliárias simultaneamente.`,
    `A comissão será devida à imobiliária somente se a negociação for concluída com cliente por ela apresentado.`,
    `O proprietário autoriza a divulgação do imóvel em meios digitais, redes sociais, portais imobiliários, placas e materiais promocionais.`,
    `As informações prestadas são de inteira responsabilidade do proprietário.`
  ];

  bullets.forEach(bullet => {
    const splitBullet = doc.splitTextToSize(bullet, pageWidth - 55);
    y = checkPageBreak(y, (splitBullet.length * 3.5) + 3);
    doc.text("•", 25, y);
    doc.text(splitBullet, 28, y);
    y += (splitBullet.length * 3.5) + 3;
  });

  y += 4;
  
  // 4. DECLARAÇÃO DO PROPRIETÁRIO
  y = drawSectionHeader('Declaração do Proprietário', '4', y);
  const decText = "Declaro que as informações acima são verdadeiras e que o imóvel encontra-se apto à comercialização, livre de impedimentos, salvo se informado em observações.";
  const splitDec = doc.splitTextToSize(decText, pageWidth - 45);
  y = checkPageBreak(y, (splitDec.length * 4) + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(splitDec, 25, y);
  y += (splitDec.length * 4) + 8;

  // 5. FUNDAMENTAÇÃO LEGAL
  y = drawSectionHeader('Fundamentação Legal', '5', y);
  doc.setFontSize(7.5);
  const legalBase = "Este instrumento segue a Lei nº 6.530/1978, Decreto nº 81.871/1978 e normas do COFECI.";
  const splitLegal = doc.splitTextToSize(legalBase, pageWidth - 45);
  y = checkPageBreak(y, (splitLegal.length * 4) + 10);
  doc.text(splitLegal, 25, y);
  y += (splitLegal.length * 4) + 12;
  
  // 6. SIGNATÁRIOS E TESTEMUNHAS
  y = drawSectionHeader('Signatários e Testemunhas', '6', y);
  
  y = checkPageBreak(y, 15);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('TESTEMUNHA 1', 25, y);
  y += 5;
  addField('NOME', property.witness1Name, 25, y);
  y += 5;
  y = checkPageBreak(y, 15);
  addField('CPF', property.witness1Cpf, 25, y);
  addField('RG', property.witness1Rg, 110, y);
  y += 10;
  doc.setLineWidth(0.1);
  doc.line(25, y, 100, y);
  doc.text('ASSINATURA TESTEMUNHA 1', 25, y + 4);
  
  y += 15;
  y = checkPageBreak(y, 15);
  doc.setFont('helvetica', 'bold');
  doc.text('TESTEMUNHA 2', 25, y);
  y += 5;
  addField('NOME', property.witness2Name, 25, y);
  y += 5;
  y = checkPageBreak(y, 15);
  addField('CPF', property.witness2Cpf, 25, y);
  addField('RG', property.witness2Rg, 110, y);
  y += 10;
  doc.line(25, y, 100, y);
  doc.text('ASSINATURA TESTEMUNHA 2', 25, y + 4);
  
  y += 20;

  // 7. CORRETORA RESPONSÁVEL
  y = drawSectionHeader('Corretora Responsável', '7', y);
  y = checkPageBreak(y, 10);
  addField('IMOBILIÁRIA', 'CR IMÓVEIS DE LUXO', 25, y);
  addField('CRECI/MG', '9469', 110, y);
  y += 6;
  y = checkPageBreak(y, 10);
  addField('GESTOR RESPONSÁVEL', property.broker || 'Daniel Vale', 25, y);
  y += 15;

  // 8. FORO
  y = drawSectionHeader('Foro', '8', y);
  const foroText = "Fica eleito o foro da comarca de Juiz de Fora/MG para dirimir eventuais dúvidas.";
  const splitForo = doc.splitTextToSize(foroText, pageWidth - 45);
  y = checkPageBreak(y, (splitForo.length * 4) + 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(splitForo, 25, y);
  y += (splitForo.length * 4) + 15;

  y = checkPageBreak(y, 40); // Ensures signature has space

  // Signature Area
  const sigBaseY = y + 20;
  doc.setLineWidth(0.5);
  
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
  const dateStr = property.signatureDate ? new Date(property.signatureDate).toLocaleDateString('pt-BR') : '___/___/____';
  const locationDate = `Juiz de Fora/MG, ${dateStr}`;
  doc.text(locationDate, pageWidth / 2, y, { align: 'center' });

  // Final Footer Call for the last page
  drawFooter();

  if (options.returnUri) {
    return doc.output('datauristring');
  }

  doc.save(`FICHA_SEM_EXCLUSIVIDADE_${property.code || 'DOC'}.pdf`);
};

export const generateClientFichaPDF = (clientData: any, options: { returnUri?: boolean } = {}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 15;
  let pageNum = 1;

  const drawFooter = () => {
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`Página ${pageNum}`, pageWidth - 30, pageHeight - 10);
    doc.text(`Documento gerado eletronicamente em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, pageHeight - 10);
  };

  const drawWatermark = () => {
    const prevSize = doc.getFontSize();
    const prevFont = doc.getFont();
    const prevColor = doc.getTextColor();

    doc.setTextColor(220, 235, 222);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    doc.text("CR IMÓVEIS DE LUXO", pageWidth / 2, pageHeight / 2, { angle: 45, align: 'center', baseline: 'middle', renderingMode: 'fill' });
    
    doc.setTextColor(prevColor);
    doc.setFontSize(prevSize);
    doc.setFont(prevFont.fontName, prevFont.fontStyle);
  };

  const checkPageBreak = (currentY: number, requiredSpace: number = 10) => {
    if (currentY + requiredSpace > pageHeight - 20) {
      drawFooter();
      doc.addPage();
      pageNum++;
      drawWatermark();
      return 20; // New y
    }
    return currentY;
  };

  const drawSectionHeader = (title: string, num: string, currentY: number) => {
    currentY = checkPageBreak(currentY, 15);
    doc.setFillColor(245, 245, 245);
    doc.rect(20, currentY, pageWidth - 40, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(`${num}. ${title.toUpperCase()}`, 25, currentY + 5.5);
    return currentY + 12;
  };

  const addField = (label: string, value: string | number | undefined, x: number, currentY: number, lineLength: number = 40) => {
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
      doc.setDrawColor(200);
      doc.setLineWidth(0.1);
      doc.line(x + labelWidth, currentY + 1, x + labelWidth + lineLength, currentY + 1);
    }
  };

  drawWatermark();

  // Header
  doc.setFontSize(18);
  doc.setTextColor(97, 121, 100);
  doc.setFont('helvetica', 'bold');
  doc.text('CR IMÓVEIS DE LUXO', pageWidth / 2, y, { align: 'center' });
  y += 7;
  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.text('IMOBILIÁRIA ESPECIALISTA EM MERCADO DE ALTO PADRÃO | CRECI/MG 9469', pageWidth / 2, y, { align: 'center' });
  y += 10;
  
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.text('FICHA DE CLIENTE (COMPRADOR / LOCATÁRIO)', pageWidth / 2, y, { align: 'center' });
  y += 3;
  doc.setDrawColor(97, 121, 100);
  doc.setLineWidth(0.8);
  doc.line(pageWidth/2 - 70, y, pageWidth/2 + 70, y);
  y += 12;

  // 1. DADOS PESSOAIS
  y = drawSectionHeader('DADOS PESSOAIS', '1', y);
  y = checkPageBreak(y, 10);
  addField('NOME', clientData.name, 25, y, 140);
  y += 6;
  y = checkPageBreak(y, 10);
  addField('CPF', clientData.cpf, 25, y, 50);
  addField('RG', clientData.rg, 90, y, 50);
  y += 6;
  y = checkPageBreak(y, 10);
  addField('TELEFONE', clientData.phone, 25, y, 50);
  addField('WHATSAPP', clientData.whatsapp, 90, y, 50);
  y += 6;
  y = checkPageBreak(y, 10);
  addField('E-MAIL', clientData.email, 25, y, 140);
  y += 6;
  y = checkPageBreak(y, 10);
  addField('ESTADO CIVIL', clientData.maritalStatus, 25, y, 50);
  addField('PROFISSÃO', clientData.profession, 90, y, 50);
  y += 6;
  y = checkPageBreak(y, 10);
  addField('RENDA MENSAL', clientData.monthlyIncome, 25, y, 50);
  y += 12;

  // 2. PERFIL DE BUSCA
  y = drawSectionHeader('PERFIL DE BUSCA', '2', y);
  
  y = checkPageBreak(y, 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(`TIPO:`, 25, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0);
  const isCompra = clientData.searchType === 'compra';
  const isLocacao = clientData.searchType === 'locacao';
  doc.text(`(${isCompra ? 'X' : ' '}) Compra    (${isLocacao ? 'X' : ' '}) Locação`, 38, y);
  y += 6;

  y = checkPageBreak(y, 10);
  addField('TIPO DE IMÓVEL', clientData.propertyType, 25, y, 140);
  y += 6;
  y = checkPageBreak(y, 10);
  addField('BAIRROS DE INTERESSE', clientData.neighborhoods, 25, y, 140);
  y += 6;
  y = checkPageBreak(y, 10);
  addField('VALOR PRETENDIDO', clientData.targetValue, 25, y, 50);
  y += 6;
  y = checkPageBreak(y, 10);
  addField('QUARTOS', clientData.bedrooms, 25, y, 20);
  addField('VAGAS', clientData.parkingSpots, 70, y, 20);
  addField('SUÍTES', clientData.suites, 120, y, 20);
  y += 8;

  y = checkPageBreak(y, 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(`DIFERENCIAIS DESEJADOS:`, 25, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0);

  const differentials = [
    { label: 'Piscina', key: 'piscina' },
    { label: 'Área gourmet', key: 'areaGourmet' },
    { label: 'Elevador', key: 'elevador' },
    { label: 'Portaria', key: 'portaria' },
    { label: 'Mobiliado', key: 'mobiliado' },
    { label: 'Varanda', key: 'varanda' },
  ];

  let diffX = 25;
  y = checkPageBreak(y, 15);
  differentials.forEach((diff, i) => {
    const hasDiff = clientData.differentials?.[diff.key];
    doc.text(`[${hasDiff ? 'X' : ' '}] ${diff.label}`, diffX, y);
    diffX += 30;
    if ((i + 1) % 4 === 0) {
      y += 5;
      diffX = 25;
      y = checkPageBreak(y, 5);
    }
  });
  if (diffX !== 25) y += 5;

  y = checkPageBreak(y, 10);
  addField('OUTRO', clientData.otherDifferentials, 25, y, 100);
  y += 12;

  // 3. CONDIÇÕES
  y = drawSectionHeader('CONDIÇÕES', '3', y);

  y = checkPageBreak(y, 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(`FORMA DE PAGAMENTO:`, 25, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0);

  const payments = [
    { label: 'Financiamento', key: 'financiamento' },
    { label: 'À vista', key: 'aVista' },
    { label: 'FGTS', key: 'fgts' },
    { label: 'Consórcio', key: 'consorcio' }
  ];

  let payX = 25;
  y = checkPageBreak(y, 10);
  payments.forEach((pay) => {
    const hasPay = clientData.paymentMethods?.[pay.key];
    doc.text(`[${hasPay ? 'X' : ' '}] ${pay.label}`, payX, y);
    payX += 35;
  });
  y += 8;

  y = checkPageBreak(y, 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(`POSSUI IMÓVEL PARA TROCA?`, 25, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0);
  const isExchangeYes = clientData.hasExchange === 'yes';
  const isExchangeNo = clientData.hasExchange === 'no';
  doc.text(`(${isExchangeYes ? 'X' : ' '}) Sim    (${isExchangeNo ? 'X' : ' '}) Não`, 80, y);
  y += 12;


  // 4. URGÊNCIA
  y = drawSectionHeader('URGÊNCIA', '4', y);

  const urgencies = [
    { label: 'Imediata', value: 'imediata' },
    { label: 'Até 30 dias', value: '30dias' },
    { label: 'Até 90 dias', value: '90dias' },
    { label: 'Sem prazo definido', value: 'sem_prazo' }
  ];

  y = checkPageBreak(y, 10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0);
  
  urgencies.forEach((urg, i) => {
    const isSelected = clientData.urgency === urg.value;
    doc.text(`[${isSelected ? 'X' : ' '}] ${urg.label}`, 25 + (i * 40), y);
  });
  y += 12;

  // 5. OBSERVAÇÕES
  y = drawSectionHeader('OBSERVAÇÕES', '5', y);
  if (clientData.observations && clientData.observations !== '---') {
    doc.setFont('helvetica', 'normal');
    const splitObs = doc.splitTextToSize(clientData.observations, pageWidth - 50);
    y = checkPageBreak(y, (splitObs.length * 4) + 6);
    doc.text(splitObs, 25, y);
    y += (splitObs.length * 4) + 6;
  } else {
    doc.setDrawColor(200);
    y = checkPageBreak(y, 20);
    for (let i = 0; i < 3; i++) {
      doc.line(25, y + 2, pageWidth - 25, y + 2);
      y += 6;
    }
  }

  // Final Footer Call
  drawFooter();

  if (options.returnUri) {
    return doc.output('datauristring');
  }

  doc.save(`FICHA_CLIENTE_${clientData.name?.replace(/\s+/g, '_') || 'DOC'}.pdf`);
};

export const generateVisitFichaPDF = (visitData: any, options: { returnUri?: boolean } = {}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 15;
  let pageNum = 1;

  const drawFooter = () => {
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`Página ${pageNum}`, pageWidth - 30, pageHeight - 10);
    doc.text(`Documento gerado eletronicamente em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, pageHeight - 10);
  };

  const drawWatermark = () => {
    const prevSize = doc.getFontSize();
    const prevFont = doc.getFont();
    const prevColor = doc.getTextColor();

    doc.setTextColor(220, 235, 222);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    doc.text("CR IMÓVEIS DE LUXO", pageWidth / 2, pageHeight / 2, { angle: 45, align: 'center', baseline: 'middle', renderingMode: 'fill' });
    
    doc.setTextColor(prevColor);
    doc.setFontSize(prevSize);
    doc.setFont(prevFont.fontName, prevFont.fontStyle);
  };

  const checkPageBreak = (currentY: number, requiredSpace: number = 10) => {
    if (currentY + requiredSpace > pageHeight - 20) {
      drawFooter();
      doc.addPage();
      pageNum++;
      drawWatermark();
      return 20; // New y
    }
    return currentY;
  };

  const drawSectionHeader = (title: string, currentY: number) => {
    currentY = checkPageBreak(currentY, 15);
    doc.setFillColor(245, 245, 245);
    doc.rect(20, currentY, pageWidth - 40, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(title.toUpperCase(), 25, currentY + 5.5);
    return currentY + 12;
  };

  const addField = (label: string, value: string | number | undefined, x: number, currentY: number, lineLength: number = 40) => {
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
      doc.setDrawColor(200);
      doc.setLineWidth(0.1);
      doc.line(x + labelWidth, currentY + 1, x + labelWidth + lineLength, currentY + 1);
    }
  };

  drawWatermark();

  // Header
  doc.setFontSize(18);
  doc.setTextColor(97, 121, 100);
  doc.setFont('helvetica', 'bold');
  doc.text('CR IMÓVEIS DE LUXO', pageWidth / 2, y, { align: 'center' });
  y += 7;
  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.text('IMOBILIÁRIA ESPECIALISTA EM MERCADO DE ALTO PADRÃO | CRECI/MG 9469', pageWidth / 2, y, { align: 'center' });
  y += 10;
  
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.text('FICHA DE VISITA (COM TERMO DE PROTEÇÃO DE COMISSÃO)', pageWidth / 2, y, { align: 'center' });
  y += 3;
  doc.setDrawColor(97, 121, 100);
  doc.setLineWidth(0.8);
  doc.line(pageWidth/2 - 70, y, pageWidth/2 + 70, y);
  y += 10;

  doc.setFontSize(9);
  addField('Data', visitData.date || '___/___/____', 25, y, 30);
  addField('Hora', visitData.time || '__:__', 90, y, 30);
  y += 12;

  // 1. DADOS DO IMÓVEL
  y = drawSectionHeader('DADOS DO IMÓVEL', y);
  y = checkPageBreak(y, 10);
  addField('Endereço', visitData.propertyAddress, 25, y, 110);
  addField('Código', visitData.propertyCode, 150, y, 30);
  y += 12;

  // 2. DADOS DO VISITANTE
  y = drawSectionHeader('DADOS DO VISITANTE', y);
  y = checkPageBreak(y, 10);
  addField('Nome', visitData.visitorName, 25, y, 140);
  y += 8;
  addField('CPF', visitData.visitorCpf, 25, y, 50);
  addField('RG', visitData.visitorRg, 90, y, 50);
  y += 8;
  addField('Telefone', visitData.visitorPhone, 25, y, 50);
  addField('WhatsApp', visitData.visitorWhatsapp, 90, y, 50);
  y += 8;
  addField('E-mail', visitData.visitorEmail, 25, y, 140);
  y += 12;

  // 3. AVALIAÇÃO DO CLIENTE
  y = drawSectionHeader('AVALIAÇÃO DO CLIENTE', y);
  y = checkPageBreak(y, 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text('Gostou do imóvel?', 25, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0);
  doc.text(`( ${visitData.liked === 'yes' ? 'X' : ' '} ) Sim    ( ${visitData.liked === 'no' ? 'X' : ' '} ) Não`, 55, y);
  
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Interesse:', 25, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`( ${visitData.interest === 'high' ? 'X' : ' '} ) Alto    ( ${visitData.interest === 'medium' ? 'X' : ' '} ) Médio    ( ${visitData.interest === 'low' ? 'X' : ' '} ) Baixo`, 55, y);
  
  y += 10;
  addField('Pontos positivos', visitData.positivePoints, 25, y, 140);
  y += 10;
  addField('Pontos negativos', visitData.negativePoints, 25, y, 140);
  y += 15;

  // 4. TERMO DE PROTEÇÃO
  y = drawSectionHeader('🔒 TERMO DE VISITA E PROTEÇÃO DE COMISSÃO', y);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const termText = [
    "Declaro que este imóvel me foi apresentado pela imobiliária/corretor responsável, e comprometo-me a não realizar negociação direta com o proprietário, terceiros ou qualquer outro intermediador sem a participação do corretor.",
    "Caso venha a adquirir, alugar ou realizar qualquer tipo de negociação referente a este imóvel, direta ou indiretamente, no prazo de 180 (cento e oitenta) dias, reconheço que será devida a comissão integral à imobiliária/corretor responsável pela intermediação.",
    "Declaro estar ciente de que a atividade de intermediação imobiliária é regulamentada, sendo garantido ao corretor o direito à remuneração pela apresentação do imóvel."
  ];

  termText.forEach(text => {
    const splitText = doc.splitTextToSize(text, pageWidth - 45);
    y = checkPageBreak(y, (splitText.length * 4) + 4);
    doc.text(splitText, 25, y);
    y += (splitText.length * 4) + 4;
  });

  y += 10;
  // DECLARAÇÃO FINAL
  doc.setFont('helvetica', 'bold');
  doc.text('DECLARAÇÃO FINAL', 25, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.text('Confirmo que realizei a visita ao imóvel acima descrito nesta data.', 25, y);
  
  y += 25;
  doc.setLineWidth(0.2);
  doc.line(25, y, 90, y);
  doc.line(120, y, 185, y);
  y += 5;
  doc.setFontSize(7);
  doc.text('ASSINATURA DO CLIENTE', 57.5, y, { align: 'center' });
  doc.text('ASSINATURA DO CORRETOR', 152.5, y, { align: 'center' });

  // Final Footer Call
  drawFooter();

  if (options.returnUri) {
    return doc.output('datauristring');
  }

  doc.save(`FICHA_VISITA_${visitData.visitorName?.replace(/\s+/g, '_') || 'DOC'}.pdf`);
};

export const generateProposalFichaPDF = (proposalData: any, options: { returnUri?: boolean } = {}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 15;
  let pageNum = 1;

  const drawFooter = () => {
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`Página ${pageNum}`, pageWidth - 30, pageHeight - 10);
    doc.text(`Documento gerado eletronicamente em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, pageHeight - 10);
  };

  const drawWatermark = () => {
    const prevSize = doc.getFontSize();
    const prevFont = doc.getFont();
    const prevColor = doc.getTextColor();

    doc.setTextColor(220, 235, 222);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    doc.text("CR IMÓVEIS DE LUXO", pageWidth / 2, pageHeight / 2, { angle: 45, align: 'center', baseline: 'middle', renderingMode: 'fill' });
    
    doc.setTextColor(prevColor);
    doc.setFontSize(prevSize);
    doc.setFont(prevFont.fontName, prevFont.fontStyle);
  };

  const checkPageBreak = (currentY: number, requiredSpace: number = 10) => {
    if (currentY + requiredSpace > pageHeight - 20) {
      drawFooter();
      doc.addPage();
      pageNum++;
      drawWatermark();
      return 20; // New y
    }
    return currentY;
  };

  const drawSectionHeader = (title: string, currentY: number) => {
    currentY = checkPageBreak(currentY, 15);
    doc.setFillColor(245, 245, 245);
    doc.rect(20, currentY, pageWidth - 40, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(title.toUpperCase(), 25, currentY + 5.5);
    return currentY + 12;
  };

  const addField = (label: string, value: string | number | undefined, x: number, currentY: number, lineLength: number = 40) => {
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
      doc.setDrawColor(200);
      doc.setLineWidth(0.1);
      doc.line(x + labelWidth, currentY + 1, x + labelWidth + lineLength, currentY + 1);
    }
  };

  drawWatermark();

  // Header
  doc.setFontSize(18);
  doc.setTextColor(97, 121, 100);
  doc.setFont('helvetica', 'bold');
  doc.text('CR IMÓVEIS DE LUXO', pageWidth / 2, y, { align: 'center' });
  y += 7;
  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.text('IMOBILIÁRIA ESPECIALISTA EM MERCADO DE ALTO PADRÃO | CRECI/MG 9469', pageWidth / 2, y, { align: 'center' });
  y += 10;
  
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.text('FICHA DE PROPOSTA DE COMPRA / LOCAÇÃO', pageWidth / 2, y, { align: 'center' });
  y += 3;
  doc.setDrawColor(97, 121, 100);
  doc.setLineWidth(0.8);
  doc.line(pageWidth/2 - 70, y, pageWidth/2 + 70, y);
  y += 10;

  // 1. DADOS DO PROPONENTE
  y = drawSectionHeader('DADOS DO PROPONENTE', y);
  y = checkPageBreak(y, 10);
  addField('Nome', proposalData.proponentName, 25, y, 140);
  y += 8;
  addField('CPF', proposalData.proponentCpf, 25, y, 50);
  addField('RG', proposalData.proponentRg, 90, y, 50);
  y += 8;
  addField('E-mail', proposalData.proponentEmail, 25, y, 140);
  y += 8;
  addField('Telefone', proposalData.proponentPhone, 25, y, 50);
  addField('WhatsApp', proposalData.proponentWhatsapp, 90, y, 50);
  y += 12;

  // 2. DADOS DO IMÓVEL
  y = drawSectionHeader('DADOS DO IMÓVEL', y);
  y = checkPageBreak(y, 10);
  addField('Endereço', proposalData.propertyAddress, 25, y, 110);
  addField('Código', proposalData.propertyCode, 150, y, 30);
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text('Tipo:', 25, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0);
  doc.text(`( ${proposalData.proposalType === 'venda' ? 'X' : ' '} ) Venda    ( ${proposalData.proposalType === 'locacao' ? 'X' : ' '} ) Locação`, 40, y);
  y += 12;

  // 3. CONDIÇÕES DA PROPOSTA
  y = drawSectionHeader('CONDIÇÕES DA PROPOSTA', y);
  y = checkPageBreak(y, 10);
  addField('Valor ofertado', proposalData.offeredValue ? `R$ ${proposalData.offeredValue}` : 'R$ ___', 25, y, 50);
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text('Forma de pagamento:', 25, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0);
  doc.text(`( ${proposalData.paymentMethod === 'cash' ? 'X' : ' '} ) À vista`, 30, y);
  doc.text(`( ${proposalData.paymentMethod === 'bank' ? 'X' : ' '} ) Financiamento bancário`, 70, y);
  doc.text(`( ${proposalData.paymentMethod === 'fgts' ? 'X' : ' '} ) FGTS`, 130, y);
  y += 6;
  doc.text(`( ${proposalData.paymentMethod === 'consortium' ? 'X' : ' '} ) Consórcio`, 30, y);
  doc.text(`( ${proposalData.paymentMethod === 'other' ? 'X' : ' '} ) Outro: ${proposalData.otherPayment || '___________________'}`, 70, y);
  
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Utilizará FGTS?', 25, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`( ${proposalData.useFgts === 'yes' ? 'X' : ' '} ) Sim    ( ${proposalData.useFgts === 'no' ? 'X' : ' '} ) Não`, 55, y);
  
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Oferece permuta?', 25, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`( ${proposalData.hasPermuta === 'yes' ? 'X' : ' '} ) Sim    ( ${proposalData.hasPermuta === 'no' ? 'X' : ' '} ) Não`, 55, y);
  
  if (proposalData.hasPermuta === 'yes' && proposalData.permutaDescription) {
    y += 8;
    doc.text(`Se sim, descrever: ${proposalData.permutaDescription}`, 25, y);
  }
  y += 12;

  // 4. CONDIÇÕES FINANCEIRAS
  y = drawSectionHeader('CONDIÇÕES FINANCEIRAS', y);
  y = checkPageBreak(y, 10);
  addField('Valor de entrada', proposalData.entryValue ? `R$ ${proposalData.entryValue}` : 'R$ ___', 25, y, 50);
  y += 8;
  addField('Prazo para pagamento / financiamento', proposalData.paymentTerm, 25, y, 140);
  y += 8;
  addField('Instituição financeira (se houver)', proposalData.bankName, 25, y, 140);
  y += 12;

  // 5. PRAZO E VALIDADE
  y = drawSectionHeader('PRAZO E VALIDADE', y);
  y = checkPageBreak(y, 10);
  addField('Esta proposta é válida até', proposalData.validUntil, 25, y, 40);
  y += 12;

  // 6. OBSERVAÇÕES
  y = drawSectionHeader('OBSERVAÇÕES DA PROPOSTA', y);
  if (proposalData.observations) {
    const splitObs = doc.splitTextToSize(proposalData.observations, pageWidth - 50);
    y = checkPageBreak(y, splitObs.length * 5);
    doc.setFont('helvetica', 'normal');
    doc.text(splitObs, 25, y);
    y += (splitObs.length * 5) + 10;
  } else {
    y += 15;
  }

  // 7. TERMO DE RESPONSABILIDADE
  y = drawSectionHeader('TERMO DE RESPONSABILIDADE E INTERMEDIAÇÃO', y);
  doc.setFontSize(8);
  const terms = [
    "Declaro que esta proposta foi realizada por intermédio da imobiliária/corretor responsável pela apresentação do imóvel.",
    "Reconheço que, em caso de aceitação da presente proposta pelo proprietário, comprometo-me a dar prosseguimento à negociação de boa-fé, respeitando as condições aqui estabelecidas.",
    "Declaro ainda que:",
    "- A presente proposta possui caráter formal e vinculativo durante seu prazo de validade, podendo sua desistência injustificada, após aceite do proprietário, gerar responsabilidade por eventuais perdas e danos, conforme legislação civil vigente;",
    "- Caso a negociação seja concluída, direta ou indiretamente, com o proprietário ou terceiros, a partir desta intermediação, será devida a comissão à imobiliária/corretor responsável;",
    "- Estou ciente de que a intermediação imobiliária é atividade regulamentada, nos termos da Lei nº 6.530/1978."
  ];

  doc.setFont('helvetica', 'normal');
  terms.forEach(text => {
    const splitText = doc.splitTextToSize(text, pageWidth - 45);
    y = checkPageBreak(y, splitText.length * 4);
    doc.text(splitText, 25, y);
    y += (splitText.length * 4) + 2;
  });

  y += 20;
  // ASSINATURAS
  doc.setLineWidth(0.2);
  doc.line(25, y, 75, y);
  doc.line(82, y, 132, y);
  doc.line(139, y, 189, y);
  y += 5;
  doc.setFontSize(7);
  doc.text('PROPONENTE', 50, y, { align: 'center' });
  doc.text('CORRETOR', 107, y, { align: 'center' });
  doc.text('IMOBILIÁRIA', 164, y, { align: 'center' });
  
  y += 15;
  addField('DATA', proposalData.currentDate || '___/___/____', 25, y, 40);

  // Final Footer Call
  drawFooter();

  if (options.returnUri) {
    return doc.output('datauristring');
  }

  doc.save(`PROPOSTA_${proposalData.proponentName?.replace(/\s+/g, '_') || 'DOC'}.pdf`);
};

export const generateReserveFichaPDF = (reserveData: any, options: { returnUri?: boolean } = {}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 15;
  let pageNum = 1;

  const drawFooter = () => {
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`Página ${pageNum}`, pageWidth - 30, pageHeight - 10);
    doc.text(`Documento gerado eletronicamente em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, pageHeight - 10);
  };

  const drawWatermark = () => {
    const prevSize = doc.getFontSize();
    const prevFont = doc.getFont();
    const prevColor = doc.getTextColor();

    doc.setTextColor(220, 235, 222);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    doc.text("CR IMÓVEIS DE LUXO", pageWidth / 2, pageHeight / 2, { angle: 45, align: 'center', baseline: 'middle', renderingMode: 'fill' });
    
    doc.setTextColor(prevColor);
    doc.setFontSize(prevSize);
    doc.setFont(prevFont.fontName, prevFont.fontStyle);
  };

  const checkPageBreak = (currentY: number, requiredSpace: number = 10) => {
    if (currentY + requiredSpace > pageHeight - 20) {
      drawFooter();
      doc.addPage();
      pageNum++;
      drawWatermark();
      return 20; // New y
    }
    return currentY;
  };

  const drawSectionHeader = (title: string, currentY: number) => {
    currentY = checkPageBreak(currentY, 15);
    doc.setFillColor(245, 245, 245);
    doc.rect(20, currentY, pageWidth - 40, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(title.toUpperCase(), 25, currentY + 5.5);
    return currentY + 12;
  };

  const addField = (label: string, value: string | number | undefined, x: number, currentY: number, lineLength: number = 40) => {
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
      doc.setDrawColor(200);
      doc.setLineWidth(0.1);
      doc.line(x + labelWidth, currentY + 1, x + labelWidth + lineLength, currentY + 1);
    }
  };

  drawWatermark();

  // Header
  doc.setFontSize(18);
  doc.setTextColor(97, 121, 100);
  doc.setFont('helvetica', 'bold');
  doc.text('CR IMÓVEIS DE LUXO', pageWidth / 2, y, { align: 'center' });
  y += 7;
  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.text('IMOBILIÁRIA ESPECIALISTA EM MERCADO DE ALTO PADRÃO | CRECI/MG 9469', pageWidth / 2, y, { align: 'center' });
  y += 10;
  
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.text('FICHA DE RESERVA DE IMÓVEL (COM SINAL – ARRAS)', pageWidth / 2, y, { align: 'center' });
  y += 3;
  doc.setDrawColor(97, 121, 100);
  doc.setLineWidth(0.8);
  doc.line(pageWidth/2 - 70, y, pageWidth/2 + 70, y);
  y += 10;

  // 1. DADOS DO IMÓVEL
  y = drawSectionHeader('DADOS DO IMÓVEL', y);
  y = checkPageBreak(y, 10);
  addField('Endereço', reserveData.propertyAddress, 25, y, 110);
  addField('Código', reserveData.propertyCode, 150, y, 30);
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text('Tipo:', 25, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0);
  doc.text(`( ${reserveData.propertyType === 'venda' ? 'X' : ' '} ) Venda    ( ${reserveData.propertyType === 'locacao' ? 'X' : ' '} ) Locação`, 40, y);
  y += 12;

  // 2. DADOS DO PROPONENTE
  y = drawSectionHeader('DADOS DO PROPONENTE', y);
  y = checkPageBreak(y, 10);
  addField('Nome', reserveData.proponentName, 25, y, 140);
  y += 8;
  addField('CPF', reserveData.proponentCpf, 25, y, 50);
  addField('RG', reserveData.proponentRg, 90, y, 50);
  y += 8;
  addField('E-mail', reserveData.proponentEmail, 25, y, 140);
  y += 8;
  addField('Telefone', reserveData.proponentPhone, 25, y, 50);
  y += 12;

  // 3. DADOS DO PROPRIETÁRIO
  y = drawSectionHeader('DADOS DO PROPRIETÁRIO', y);
  y = checkPageBreak(y, 10);
  addField('Nome', reserveData.ownerName, 25, y, 140);
  y += 8;
  addField('CPF/CNPJ', reserveData.ownerDoc, 25, y, 140);
  y += 12;

  // 4. VALOR E RESERVA
  y = drawSectionHeader('VALOR E RESERVA', y);
  y = checkPageBreak(y, 10);
  addField('Valor da proposta', reserveData.proposalValue ? `R$ ${reserveData.proposalValue}` : 'R$ ___', 25, y, 50);
  y += 8;
  addField('Valor do sinal (arras)', reserveData.signalValue ? `R$ ${reserveData.signalValue}` : 'R$ ___', 25, y, 50);
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Forma de pagamento do sinal:', 25, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(`( ${reserveData.paymentMethod === 'pix' ? 'X' : ' '} ) Pix    ( ${reserveData.paymentMethod === 'transfer' ? 'X' : ' '} ) Transferência    ( ${reserveData.paymentMethod === 'cash' ? 'X' : ' '} ) Dinheiro`, 30, y);
  y += 6;
  doc.text(`( ${reserveData.paymentMethod === 'other' ? 'X' : ' '} ) Outro: ${reserveData.otherPayment || '___________________'}`, 30, y);
  y += 10;
  addField('Data do pagamento', reserveData.paymentDate, 25, y, 40);
  y += 12;

  // 5. PRAZO DE RESERVA
  y = drawSectionHeader('PRAZO DE RESERVA', y);
  y = checkPageBreak(y, 10);
  addField('O imóvel permanecerá reservado até', reserveData.reserveUntil, 25, y, 40);
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Durante este período, o proprietário compromete-se a não negociar com terceiros.', 25, y);
  y += 12;

  // 6. CONDIÇÕES DO SINAL
  y = drawSectionHeader('CONDIÇÕES DO SINAL (ARRAS)', y);
  doc.setFontSize(8);
  const conditions = [
    "O valor pago a título de sinal possui natureza de arras confirmatórias, nos termos dos artigos 417 a 420 do Código Civil.",
    "Em caso de conclusão do negócio, o valor será abatido do total da negociação.",
    "Em caso de desistência injustificada por parte do proponente, o valor pago será retido pelo proprietário a título de compensação.",
    "Em caso de desistência por parte do proprietário, este deverá devolver o valor recebido em dobro ao proponente.",
    "Caso a negociação não se concretize por motivos alheios à vontade das partes, como reprovação de crédito ou impedimento jurídico comprovado, o valor poderá ser devolvido mediante acordo entre as partes."
  ];

  doc.setFont('helvetica', 'normal');
  conditions.forEach(text => {
    const splitText = doc.splitTextToSize(text, pageWidth - 45);
    y = checkPageBreak(y, splitText.length * 4);
    doc.text(splitText, 25, y);
    y += (splitText.length * 4) + 2;
  });
  y += 10;

  // 7. INTERMEDIAÇÃO
  doc.setFont('helvetica', 'bold');
  doc.text('INTERMEDIAÇÃO E COMISSÃO', 25, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  const mediationText = [
    "As partes reconhecem que a negociação foi intermediada por corretor/imobiliária, sendo devida a comissão conforme prática de mercado em caso de concretização do negócio.",
    "Caso a negociação seja concluída diretamente entre as partes, sem a participação do corretor, ainda assim será devida a comissão, desde que comprovado o vínculo da intermediação."
  ];
  mediationText.forEach(text => {
    const splitText = doc.splitTextToSize(text, pageWidth - 45);
    y = checkPageBreak(y, splitText.length * 4);
    doc.text(splitText, 25, y);
    y += (splitText.length * 4) + 1;
  });
  y += 10;

  // 8. DECLARAÇÕES
  doc.setFont('helvetica', 'bold');
  doc.text('DECLARAÇÕES', 25, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  const declText = [
    "O proponente declara que tem ciência das condições do imóvel e da negociação, e compromete-me a dar andamento à formalização dentro do prazo acordado.",
    "O proprietário declara que o imóvel encontra-se apto à negociação e que respeitará o prazo de reserva estabelecido.",
    "Este instrumento possui caráter preliminar e não substitui o contrato definitivo."
  ];
  declText.forEach(text => {
    const splitText = doc.splitTextToSize(text, pageWidth - 45);
    y = checkPageBreak(y, splitText.length * 4);
    doc.text(splitText, 25, y);
    y += (splitText.length * 4) + 1;
  });
  y += 12;

  // FORO
  addField('Fica eleito o foro da comarca de', reserveData.cityForo, 25, y, 80);
  y += 25;

  // ASSINATURAS
  doc.setLineWidth(0.2);
  doc.line(25, y, 90, y);
  doc.line(120, y, 185, y);
  y += 5;
  doc.setFontSize(7);
  doc.text('PROPONENTE', 57.5, y, { align: 'center' });
  doc.text('PROPRIETÁRIO', 152.5, y, { align: 'center' });
  y += 15;
  doc.line(25, y, 90, y);
  doc.line(120, y, 185, y);
  y += 5;
  doc.text('CORRETOR', 57.5, y, { align: 'center' });
  doc.text('IMOBILIÁRIA', 152.5, y, { align: 'center' });

  y += 15;
  addField('DATA', reserveData.currentDate || '___/___/____', 25, y, 40);

  // Final Footer Call
  drawFooter();

  if (options.returnUri) {
    return doc.output('datauristring');
  }

  doc.save(`RESERVA_${reserveData.proponentName?.replace(/\s+/g, '_') || 'DOC'}.pdf`);
};

export const generateCreditAnalysisPDF = (analysisData: any, options: { returnUri?: boolean } = {}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 15;
  let pageNum = 1;

  const drawFooter = () => {
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`Página ${pageNum}`, pageWidth - 30, pageHeight - 10);
    doc.text(`Documento gerado eletronicamente em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, pageHeight - 10);
  };

  const drawWatermark = () => {
    const prevSize = doc.getFontSize();
    const prevFont = doc.getFont();
    const prevColor = doc.getTextColor();

    doc.setTextColor(220, 235, 222);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    doc.text("CR IMÓVEIS DE LUXO", pageWidth / 2, pageHeight / 2, { angle: 45, align: 'center', baseline: 'middle', renderingMode: 'fill' });
    
    doc.setTextColor(prevColor);
    doc.setFontSize(prevSize);
    doc.setFont(prevFont.fontName, prevFont.fontStyle);
  };

  const checkPageBreak = (currentY: number, requiredSpace: number = 10) => {
    if (currentY + requiredSpace > pageHeight - 20) {
      drawFooter();
      doc.addPage();
      pageNum++;
      drawWatermark();
      return 20; // New y
    }
    return currentY;
  };

  const drawSectionHeader = (title: string, currentY: number) => {
    currentY = checkPageBreak(currentY, 15);
    doc.setFillColor(245, 245, 245);
    doc.rect(20, currentY, pageWidth - 40, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(title.toUpperCase(), 25, currentY + 5.5);
    return currentY + 12;
  };

  const addField = (label: string, value: string | number | undefined, x: number, currentY: number, lineLength: number = 40) => {
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
      doc.setDrawColor(200);
      doc.setLineWidth(0.1);
      doc.line(x + labelWidth, currentY + 1, x + labelWidth + lineLength, currentY + 1);
    }
  };

  drawWatermark();

  // Header
  doc.setFontSize(18);
  doc.setTextColor(97, 121, 100);
  doc.setFont('helvetica', 'bold');
  doc.text('CR IMÓVEIS DE LUXO', pageWidth / 2, y, { align: 'center' });
  y += 7;
  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.text('IMOBILIÁRIA ESPECIALISTA EM MERCADO DE ALTO PADRÃO | CRECI/MG 9469', pageWidth / 2, y, { align: 'center' });
  y += 10;
  
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.text('FICHA DE ANÁLISE DE CRÉDITO PARA LOCAÇÃO', pageWidth / 2, y, { align: 'center' });
  y += 3;
  doc.setDrawColor(97, 121, 100);
  doc.setLineWidth(0.8);
  doc.line(pageWidth/2 - 70, y, pageWidth/2 + 70, y);
  y += 10;

  // 1. DADOS DO PRETENDENTE
  y = drawSectionHeader('DADOS DO PRETENDENTE', y);
  addField('Nome completo', analysisData.name, 25, y, 140);
  y += 8;
  addField('CPF', analysisData.cpf, 25, y, 50);
  addField('RG', analysisData.rg, 90, y, 50);
  y += 8;
  addField('Data de nascimento', analysisData.birthDate, 25, y, 50);
  addField('Estado civil', analysisData.maritalStatus, 90, y, 50);
  y += 8;
  addField('Telefone', analysisData.phone, 25, y, 50);
  addField('E-mail', analysisData.email, 90, y, 80);
  y += 8;
  addField('Endereço atual', analysisData.currentAddress, 25, y, 140);
  y += 8;
  addField('Tempo de residência', analysisData.residenceTime, 25, y, 40);
  y += 12;

  // 2. DADOS PROFISSIONAIS
  y = drawSectionHeader('DADOS PROFISSIONAIS', y);
  addField('Profissão', analysisData.profession, 25, y, 60);
  addField('Empresa', analysisData.company, 100, y, 70);
  y += 8;
  addField('CNPJ', analysisData.cnpj, 25, y, 50);
  addField('Telefone empresa', analysisData.companyPhone, 90, y, 50);
  y += 8;
  addField('Endereço empresa', analysisData.companyAddress, 25, y, 140);
  y += 8;
  addField('Tempo de vínculo', analysisData.bondTime, 25, y, 50);
  addField('Tipo de vínculo', analysisData.bondType, 90, y, 50);
  y += 12;

  // 3. RENDA E CAPACIDADE FINANCEIRA
  y = drawSectionHeader('RENDA E CAPACIDADE FINANCEIRA', y);
  addField('Renda mensal principal', analysisData.mainIncome, 25, y, 50);
  y += 8;
  addField('Outras rendas', analysisData.otherIncomes, 25, y, 140);
  y += 8;
  addField('Renda total familiar', analysisData.totalIncome, 25, y, 50);
  addField('Comprometimento de renda (%)', analysisData.incomeCommitment, 90, y, 30);
  y += 12;

  // 4. DADOS DO IMÓVEL PRETENDIDO
  y = drawSectionHeader('DADOS DO IMÓVEL PRETENDIDO', y);
  addField('Endereço', analysisData.propertyAddress, 25, y, 140);
  y += 8;
  addField('Valor do aluguel', analysisData.rentValue, 25, y, 50);
  addField('Encargos totais (estimado)', analysisData.totalCharges, 100, y, 50);
  y += 12;

  // 5. MODALIDADE DE GARANTIA
  y = drawSectionHeader('MODALIDADE DE GARANTIA', y);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`( ${analysisData.guaranteeType === 'fiador' ? 'X' : ' '} ) Fiador    ( ${analysisData.guaranteeType === 'seguro' ? 'X' : ' '} ) Seguro fiança    ( ${analysisData.guaranteeType === 'caucao' ? 'X' : ' '} ) Caução    ( ${analysisData.guaranteeType === 'titulo' ? 'X' : ' '} ) Título`, 25, y);
  y += 8;
  addField('Descrição da garantia', analysisData.guaranteeDescription, 25, y, 140);
  y += 12;

  // 6. DADOS DO FIADOR
  y = drawSectionHeader('DADOS DO FIADOR (SE APLICÁVEL)', y);
  addField('Nome', analysisData.guarantorName, 25, y, 140);
  y += 8;
  addField('CPF', analysisData.guarantorCpf, 25, y, 50);
  addField('Profissão', analysisData.guarantorProfession, 90, y, 70);
  y += 8;
  addField('Renda mensal', analysisData.guarantorIncome, 25, y, 50);
  y += 8;
  addField('Endereço', analysisData.guarantorAddress, 25, y, 140);
  y += 8;
  doc.text(`Possui imóvel próprio: ( ${analysisData.guarantorHasProperty === 'yes' ? 'X' : ' '} ) Sim    ( ${analysisData.guarantorHasProperty === 'no' ? 'X' : ' '} ) Não`, 25, y);
  y += 12;

  // 7. CONSULTAS E ANÁLISES
  y = drawSectionHeader('CONSULTAS E ANÁLISES', y);
  doc.text(`Autoriza consulta órgãos de proteção: ( ${analysisData.authorizeConsult === 'yes' ? 'X' : ' '} ) Sim    ( ${analysisData.authorizeConsult === 'no' ? 'X' : ' '} ) Não`, 25, y);
  y += 8;
  addField('Resultado da análise', analysisData.analysisResult, 25, y, 140);
  y += 8;
  doc.text(`Possui restrições financeiras: ( ${analysisData.hasRestrictions === 'yes' ? 'X' : ' '} ) Sim    ( ${analysisData.hasRestrictions === 'no' ? 'X' : ' '} ) Não`, 25, y);
  y += 8;
  addField('Score (se aplicável)', analysisData.creditScore, 25, y, 40);
  y += 12;

  // 10. DOCUMENTOS APRESENTADOS
  y = drawSectionHeader('DOCUMENTOS APRESENTADOS', y);
  const docs = analysisData.docsPresented || [];
  doc.setFontSize(7);
  doc.text(`( ${docs.includes('id') ? 'X' : ' '} ) RG e CPF`, 25, y);
  doc.text(`( ${docs.includes('income') ? 'X' : ' '} ) Comprovante de renda`, 60, y);
  doc.text(`( ${docs.includes('address') ? 'X' : ' '} ) Comprovante de residência`, 110, y);
  y += 5;
  doc.text(`( ${docs.includes('ir') ? 'X' : ' '} ) Imposto de Renda`, 25, y);
  doc.text(`( ${docs.includes('work') ? 'X' : ' '} ) CTPS / Contrato Social`, 60, y);
  doc.text(`( ${docs.includes('guarantor') ? 'X' : ' '} ) Docs Fiador`, 110, y);
  y += 12;

  // 11. PARECER FINAL
  y = drawSectionHeader('PARECER FINAL DA IMOBILIÁRIA', y);
  doc.setFontSize(8);
  doc.text(`Resultado: ( ${analysisData.finalResult === 'approved' ? 'X' : ' '} ) Aprovado    ( ${analysisData.finalResult === 'restricted' ? 'X' : ' '} ) c/ restrições    ( ${analysisData.finalResult === 'denied' ? 'X' : ' '} ) Reprovado`, 25, y);
  y += 8;
  addField('Observações internas', analysisData.internalObs, 25, y, 140);
  y += 15;

  // TERMO
  y = checkPageBreak(y, 30);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  const term = "Declaro que as informações prestadas são verdadeiras e autorizo a imobiliária a realizar consultas... reprovação da análise e/ou cancelamento da locação... aprovação cadastral não obriga a imobiliária ou o proprietário à efetivação da locação...";
  const splitTerm = doc.splitTextToSize(term, pageWidth - 50);
  doc.text(splitTerm, 25, y);
  
  y += 30;
  doc.line(25, y, 75, y);
  doc.line(82, y, 132, y);
  doc.line(139, y, 189, y);
  y += 5;
  doc.text('PRETENDENTE', 50, y, { align: 'center' });
  doc.text('FIADOR', 107, y, { align: 'center' });
  doc.text('RESPONSÁVEL ANÁLISE', 164, y, { align: 'center' });
  
  y += 15;
  addField('DATA', analysisData.date || '___/___/____', 25, y, 40);

  drawFooter();

  if (options.returnUri) {
    return doc.output('datauristring');
  }

  doc.save(`ANALISE_CREDITO_${analysisData.name?.replace(/\s+/g, '_') || 'DOC'}.pdf`);
};

export const generateRentalFichaPDF = (data: any, options: { returnUri?: boolean } = {}) => {
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 15;
  let pageNum = 1;

  const drawFooter = () => {
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`Página ${pageNum}`, pageWidth - 30, pageHeight - 10);
    doc.text(`Documento gerado eletronicamente em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, pageHeight - 10);
  };

  const drawWatermark = () => {
    const prevSize = doc.getFontSize();
    const prevFont = doc.getFont();
    const prevColor = doc.getTextColor();

    doc.setTextColor(220, 235, 222);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    doc.text("CR IMÓVEIS DE LUXO", pageWidth / 2, pageHeight / 2, { angle: 45, align: 'center', baseline: 'middle', renderingMode: 'fill' });
    
    doc.setTextColor(prevColor);
    doc.setFontSize(prevSize);
    doc.setFont(prevFont.fontName, prevFont.fontStyle);
  };

  const checkPageBreak = (currentY: number, requiredSpace: number = 10) => {
    if (currentY + requiredSpace > pageHeight - 20) {
      drawFooter();
      doc.addPage();
      pageNum++;
      drawWatermark();
      return 20; // New y
    }
    return currentY;
  };

  const drawHeader = (title: string) => {
    doc.setFontSize(18);
    doc.setTextColor(97, 121, 100);
    doc.setFont('helvetica', 'bold');
    doc.text('CR IMÓVEIS DE LUXO', pageWidth / 2, y, { align: 'center' });
    y += 7;
    doc.setFontSize(7);
    doc.setTextColor(120);
    doc.text('IMOBILIÁRIA ESPECIALISTA EM MERCADO DE ALTO PADRÃO', pageWidth / 2, y, { align: 'center' });
    y += 10;
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.text(title, pageWidth / 2, y, { align: 'center' });
    y += 12;
  };

  const drawSectionHeader = (title: string, currentY: number) => {
    currentY = checkPageBreak(currentY, 15);
    doc.setFillColor(245, 245, 245);
    doc.rect(20, currentY, pageWidth - 40, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(title.toUpperCase(), 25, currentY + 5.5);
    return currentY + 12;
  };

  const addField = (label: string, value: string | undefined, x: number, currentY: number, lineLength: number = 40) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`${label}:`, x, currentY);
    const labelWidth = doc.getTextWidth(`${label}: `);
    
    if (value && value !== '---' && value !== '') {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0);
      doc.text(`${value}`, x + labelWidth, currentY);
    } else {
      doc.setDrawColor(200);
      doc.setLineWidth(0.1);
      doc.line(x + labelWidth, currentY + 1, x + labelWidth + lineLength, currentY + 1);
    }
  };

  drawWatermark();
  drawHeader('FICHA DE LOCAÇÃO RESIDENCIAL / COMERCIAL');

  // DADOS DO LOCATÁRIO
  y = drawSectionHeader('DADOS DO LOCATÁRIO', y);
  addField('Nome completo', data.tenantName, 25, y, 140);
  y += 8;
  addField('CPF', data.tenantCpf, 25, y);
  addField('RG', data.tenantRg, 90, y);
  addField('Data de nascimento', data.tenantBirthDate, 140, y);
  y += 8;
  addField('Estado civil', data.tenantCivilStatus, 25, y);
  addField('Profissão', data.tenantProfession, 90, y);
  y += 8;
  addField('Telefone', data.tenantPhone, 25, y);
  addField('E-mail', data.tenantEmail, 90, y);
  y += 8;
  addField('Endereço atual', data.tenantAddress, 25, y, 140);
  y += 8;
  addField('Tempo de residência', data.tenantResidencyTime, 25, y);
  y += 12;

  // DADOS DO IMÓVEL LOCADO
  y = drawSectionHeader('DADOS DO IMÓVEL LOCADO', y);
  addField('Endereço', data.propertyAddress, 25, y, 140);
  y += 8;
  addField('Tipo', data.propertyType, 25, y);
  addField('Finalidade', data.propertyPurpose, 90, y);
  y += 8;
  addField('Valor do aluguel', `R$ ${data.rentAmount || '0,00'}`, 25, y);
  addField('Encargos', `R$ ${data.chargesAmount || '0,00'}`, 90, y);
  addField('Total mensal', `R$ ${data.totalAmount || '0,00'}`, 145, y);
  y += 8;
  addField('Início', data.startDate, 25, y);
  addField('Prazo', `${data.contractTerm || '___'} meses`, 90, y);
  addField('Término', data.endDate, 145, y);
  y += 12;

  // FORMA DE PAGAMENTO E GARANTIA
  y = drawSectionHeader('PAGAMENTO E GARANTIA', y);
  addField('Forma de Pagamento', data.paymentMethod, 25, y);
  addField('Vencimento', `dia ${data.dueDate}`, 90, y);
  y += 8;
  addField('Garantia', data.guaranteeType, 25, y);
  y += 8;
  doc.setFontSize(8);
  doc.text('Descrição detalhada:', 25, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.guaranteeDescription || '', 25, y + 4, { maxWidth: 160 });
  y += 15;

  // DADOS DO FIADOR
  if (data.guarantorName) {
    y = drawSectionHeader('DADOS DO FIADOR', y);
    addField('Nome', data.guarantorName, 25, y);
    y += 8;
    addField('CPF', data.guarantorCpf, 25, y);
    addField('RG', data.guarantorRg, 90, y);
    y += 8;
    addField('Profissão', data.guarantorProfession, 25, y);
    addField('Renda mensal', `R$ ${data.guarantorIncome || '0,00'}`, 90, y);
    y += 8;
    addField('Endereço', data.guarantorAddress, 25, y);
    y += 8;
    addField('Telefone', data.guarantorPhone, 25, y);
    y += 12;
  }

  // OBRIGAÇÕES (Resumo)
  if (y > 230) { doc.addPage(); y = 20; }
  y = drawSectionHeader('RESUMO DE OBRIGAÇÕES', y);
  doc.setFontSize(7);
  const obs = [
    "• Pagar pontualmente aluguel e encargos nas datas acordadas.",
    "• Responsável pela conservação e devolução nas mesmas condições recebidas.",
    "• Vedada a sublocação ou cessão sem autorização formal.",
    "• Multas e juros por atraso conforme contrato definitivo.",
    "• Declaração de veracidade das informações prestadas."
  ];
  obs.forEach(text => {
    doc.text(text, 25, y);
    y += 4;
  });
  y += 10;

  doc.setFontSize(10);
  doc.text('__________________________', 25, y);
  doc.text('__________________________', 115, y);
  y += 5;
  doc.setFontSize(8);
  doc.text('Locatário', 45, y);
  doc.text('Fiador', 135, y);
  y += 15;
  doc.text('__________________________', 25, y);
  doc.text('__________________________', 115, y);
  y += 5;
  doc.text('Corretor/Imobiliária', 40, y);
  doc.text('Data', 140, y);
  y += 10;
  doc.setFontSize(9);
  doc.text(`Local: ${data.city || '___________'} - Data: ${data.date || '___/___/____'}`, pageWidth / 2, y, { align: 'center' });

  if (options.returnUri) {
    return doc.output('datauristring');
  }
  doc.save(`FICHA_LOCACAO_${data.tenantName?.replace(/\s+/g, '_') || 'DOC'}.pdf`);
};

export const generateInspectionPDF = (data: any, options: { returnUri?: boolean } = {}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 15;
  let pageNum = 1;

  const drawFooter = () => {
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`Página ${pageNum}`, pageWidth - 30, pageHeight - 10);
    doc.text(`Documento gerado eletronicamente em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, pageHeight - 10);
  };

  const drawWatermark = () => {
    const prevSize = doc.getFontSize();
    const prevFont = doc.getFont();
    const prevColor = doc.getTextColor();

    doc.setTextColor(220, 235, 222);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    doc.text("CR IMÓVEIS DE LUXO", pageWidth / 2, pageHeight / 2, { angle: 45, align: 'center', baseline: 'middle', renderingMode: 'fill' });
    
    doc.setTextColor(prevColor);
    doc.setFontSize(prevSize);
    doc.setFont(prevFont.fontName, prevFont.fontStyle);
  };

  const checkPageBreak = (currentY: number, requiredSpace: number = 10) => {
    if (currentY + requiredSpace > pageHeight - 20) {
      drawFooter();
      doc.addPage();
      pageNum++;
      drawWatermark();
      return 20; // New y
    }
    return currentY;
  };

  const drawHeader = (title: string) => {
    doc.setFontSize(18);
    doc.setTextColor(97, 121, 100);
    doc.setFont('helvetica', 'bold');
    doc.text('CR IMÓVEIS DE LUXO', pageWidth / 2, y, { align: 'center' });
    y += 7;
    doc.setFontSize(7);
    doc.setTextColor(120);
    doc.text('IMOBILIÁRIA ESPECIALISTA EM MERCADO DE ALTO PADRÃO', pageWidth / 2, y, { align: 'center' });
    y += 10;
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.text(title, pageWidth / 2, y, { align: 'center' });
    y += 12;
  };

  const drawSectionHeader = (title: string, currentY: number) => {
    currentY = checkPageBreak(currentY, 15);
    doc.setFillColor(245, 245, 245);
    doc.rect(20, currentY, pageWidth - 40, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(title.toUpperCase(), 25, currentY + 5.5);
    return currentY + 12;
  };

  const addField = (label: string, value: string | undefined, x: number, currentY: number, lineLength: number = 40) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`${label}:`, x, currentY);
    const labelWidth = doc.getTextWidth(`${label}: `);
    
    if (value && value !== '---' && value !== '') {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0);
      doc.text(`${value}`, x + labelWidth, currentY);
    } else {
      doc.setDrawColor(200);
      doc.setLineWidth(0.1);
      doc.line(x + labelWidth, currentY + 1, x + labelWidth + lineLength, currentY + 1);
    }
  };

  drawWatermark();
  drawHeader(`FICHA DE VISTORIA DE IMÓVEL (${data.type?.toUpperCase() || 'ENTRADA / SAÍDA'})`);

  y = drawSectionHeader('Dados Gerais', y);
  addField('Tipo', data.type, 25, y);
  addField('Data', data.date, 80, y, 40);
  addField('Hora', data.time, 140, y);
  y += 8;
  addField('Endereço', data.address, 25, y);
  y += 8;
  addField('Tipo de Imóvel', data.propertyType, 25, y);
  y += 8;
  addField('Locatário', data.tenantName, 25, y);
  y += 8;
  addField('Proprietário', data.ownerName, 25, y);
  y += 8;
  addField('Responsável', data.inspectorName, 25, y);
  y += 12;

  const sections = [
    { title: 'Área Externa / Fachada', fields: [
      { l: 'Portão', v: data.gate }, { l: 'Muros', v: data.walls }, { l: 'Pintura', v: data.exteriorPainting }, { l: 'Calçadas', v: data.sidewalks }, { l: 'Garagem', v: data.garage }
    ]},
    { title: 'Sala', fields: [
      { l: 'Porta', v: data.livingRoomDoor }, { l: 'Fechadura', v: data.livingRoomLock }, { l: 'Paredes', v: data.livingRoomWalls }, { l: 'Teto', v: data.livingRoomCeiling }, { l: 'Piso', v: data.livingRoomFloor }, { l: 'Rodapés', v: data.livingRoomBaseboards }, { l: 'Janelas', v: data.livingRoomWindows }, { l: 'Elétrica', v: data.livingRoomOutlets }, { l: 'Iluminação', v: data.livingRoomLighting }
    ]},
    { title: 'Quartos', fields: [
      { l: 'Portas', v: data.bedroomDoors }, { l: 'Paredes', v: data.bedroomWalls }, { l: 'Teto', v: data.bedroomCeiling }, { l: 'Piso', v: data.bedroomFloor }, { l: 'Armários', v: data.bedroomClosets }, { l: 'Janelas', v: data.bedroomWindows }, { l: 'Elétrica', v: data.bedroomOutlets }
    ]},
    { title: 'Cozinha', fields: [
      { l: 'Paredes', v: data.kitchenWalls }, { l: 'Teto', v: data.kitchenCeiling }, { l: 'Piso', v: data.kitchenFloor }, { l: 'Pia', v: data.kitchenSink }, { l: 'Torneira', v: data.kitchenFaucet }, { l: 'Gabinetes', v: data.kitchenCabinets }, { l: 'Bancadas', v: data.kitchenCounters }, { l: 'Fogão', v: data.kitchenStove }, { l: 'Exaustor', v: data.kitchenHood }, { l: 'Elétrica', v: data.kitchenElec }
    ]},
    { title: 'Banheiros', fields: [
      { l: 'Paredes', v: data.bathWalls }, { l: 'Teto', v: data.bathCeiling }, { l: 'Piso', v: data.bathFloor }, { l: 'Vaso', v: data.bathToilet }, { l: 'Descarga', v: data.bathFlush }, { l: 'Pia', v: data.bathSink }, { l: 'Torneira', v: data.bathFaucet }, { l: 'Chuveiro', v: data.bathShower }, { l: 'Box', v: data.bathGlass }, { l: 'Ralos', v: data.bathDrains }, { l: 'Acessórios', v: data.bathAccessories }
    ]},
    { title: 'Área de Serviço', fields: [
      { l: 'Tanque', v: data.serviceTank }, { l: 'Torneiras', v: data.serviceFaucets }, { l: 'Máquina', v: data.serviceWashMachine }, { l: 'Piso/Paredes', v: data.serviceFloor }
    ]},
    { title: 'Instalações Gerais', fields: [
      { l: 'Elétrica', v: data.elecInstall }, { l: 'Disjuntores', v: data.breakerPanel }, { l: 'Hidráulica', v: data.hydroInstall }, { l: 'Pressão Água', v: data.waterPressure }, { l: 'Gás', v: data.gasSystem }, { l: 'Interfone', v: data.intercom }
    ]},
    { title: 'Complementares', fields: [
      { l: 'Ar-cond.', v: data.ac }, { l: 'Planejados', v: data.customFurniture }, { l: 'Eletrodomest.', v: data.appliances }, { l: 'Cortinas', v: data.curtains }
    ]}
  ];

  sections.forEach(section => {
    y = drawSectionHeader(section.title, y);
    let col = 0;
    section.fields.forEach(field => {
      addField(field.l, field.v, 25 + (col % 2 * 80), y);
      if (col % 2 === 1) y += 6;
      col++;
      if (y > 275) { doc.addPage(); y = 20; }
    });
    if (col % 2 !== 0) y += 6;
    y += 4;
  });

  y = drawSectionHeader('Observações e Mídia', y);
  addField('Fotos', data.photosAttached ? 'SIM' : 'NÃO', 25, y);
  addField('Vídeo', data.videoAttached ? 'SIM' : 'NÃO', 80, y);
  y += 8;
  addField('Descrição Mídia', data.mediaDescription, 25, y);
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Observações Gerais:', 25, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.generalObservations || '', 25, y + 4, { maxWidth: 160 });
  y += 20;

  if (y > 230) { doc.addPage(); y = 20; }
  doc.setFontSize(7);
  doc.text('O LOCATÁRIO declara que recebeu o imóvel nas condições descritas nesta vistoria, comprometendo-se a devolvê-lo no mesmo estado.', pageWidth / 2, y, { align: 'center' });
  y += 20;

  doc.setFontSize(10);
  doc.text('__________________________', 25, y);
  doc.text('__________________________', 115, y);
  y += 5;
  doc.setFontSize(8);
  doc.text('Locatário', 45, y);
  doc.text('Proprietário', 135, y);
  y += 15;
  doc.text('__________________________', 25, y);
  y += 5;
  doc.text('Responsável pela Vistoria', 40, y);

  if (options.returnUri) {
    return doc.output('datauristring');
  }
  doc.save(`VISTORIA_${data.tenantName?.replace(/\s+/g, '_') || 'DOC'}.pdf`);
};

export const generateLegalDocPDF = (data: any, options: { returnUri?: boolean } = {}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 15;
  let pageNum = 1;

  const drawFooter = () => {
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`Página ${pageNum}`, pageWidth - 30, pageHeight - 10);
    doc.text(`Documento gerado eletronicamente em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, pageHeight - 10);
  };

  const drawWatermark = () => {
    const prevSize = doc.getFontSize();
    const prevFont = doc.getFont();
    const prevColor = doc.getTextColor();

    doc.setTextColor(220, 235, 222);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    doc.text("CR IMÓVEIS DE LUXO", pageWidth / 2, pageHeight / 2, { angle: 45, align: 'center', baseline: 'middle', renderingMode: 'fill' });
    
    doc.setTextColor(prevColor);
    doc.setFontSize(prevSize);
    doc.setFont(prevFont.fontName, prevFont.fontStyle);
  };

  const checkPageBreak = (currentY: number, requiredSpace: number = 10) => {
    if (currentY + requiredSpace > pageHeight - 20) {
      drawFooter();
      doc.addPage();
      pageNum++;
      drawWatermark();
      return 20; // New y
    }
    return currentY;
  };

  const drawHeader = (title: string) => {
    doc.setFontSize(18);
    doc.setTextColor(97, 121, 100);
    doc.setFont('helvetica', 'bold');
    doc.text('CR IMÓVEIS DE LUXO', pageWidth / 2, y, { align: 'center' });
    y += 7;
    doc.setFontSize(7);
    doc.setTextColor(120);
    doc.text('IMOBILIÁRIA ESPECIALISTA EM MERCADO DE ALTO PADRÃO', pageWidth / 2, y, { align: 'center' });
    y += 10;
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.text(title, pageWidth / 2, y, { align: 'center' });
    y += 12;
  };

  const drawSectionHeader = (title: string, currentY: number) => {
    currentY = checkPageBreak(currentY, 15);
    doc.setFillColor(245, 245, 245);
    doc.rect(20, currentY, pageWidth - 40, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(title.toUpperCase(), 25, currentY + 5.5);
    return currentY + 12;
  };

  const addField = (label: string, value: string | undefined, x: number, currentY: number, lineLength: number = 40) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`${label}:`, x, currentY);
    const labelWidth = doc.getTextWidth(`${label}: `);
    
    if (value && value !== '---' && value !== '') {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0);
      doc.text(`${value}`, x + labelWidth, currentY);
    } else {
      doc.setDrawColor(200);
      doc.setLineWidth(0.1);
      doc.line(x + labelWidth, currentY + 1, x + labelWidth + lineLength, currentY + 1);
    }
  };

  drawWatermark();
  drawHeader('FICHA DE DOCUMENTAÇÃO JURÍDICA DO IMÓVEL');

  y = drawSectionHeader('Dados do Imóvel', y);
  addField('Endereço', data.address, 25, y);
  y += 7;
  addField('Tipo', data.propertyType, 25, y);
  addField('Finalidade', data.purpose, 110, y);
  y += 7;
  addField('Matrícula nº', data.registrationNumber, 25, y);
  y += 7;
  addField('CRI', data.registryOffice, 25, y);
  y += 7;
  addField('Inscrição IPTU', data.iptuNumber, 25, y);
  y += 12;

  y = drawSectionHeader('Dados do Proprietário', y);
  addField('Nome', data.ownerName, 25, y);
  y += 7;
  addField('CPF/CNPJ', data.ownerCpfCnpj, 25, y);
  addField('Estado Civil', data.civilStatus, 110, y);
  y += 7;
  addField('Regime Bens', data.assetsRegime, 25, y);
  y += 7;
  addField('Telefone', data.phone, 25, y);
  addField('E-mail', data.email, 110, y);
  y += 12;

  const docSections = [
    { title: 'Documentação do Imóvel', fields: [
      { l: 'Matrícula Atu.', v: data.registrationUpdated }, { l: 'Ônus Reais', v: data.lienCert }, { l: 'Inteiro Teor', v: data.fullContentCert }, { l: 'Habite-se', v: data.habitese }, { l: 'Planta Aprov.', v: data.approvedPlan }, { l: 'Averbação Cons.', v: data.constructionRegistration }, { l: 'Regularid. Área', v: data.areaRegularity }
    ]},
    { title: 'Tributos e Encargos', fields: [
      { l: 'IPTU Quitado', v: data.iptuPaid }, { l: 'CND Munic.', v: data.municipalDebtsCert }, { l: 'Condomínio', v: data.condoPaid }, { l: 'Taxas Adic.', v: data.additionalTaxes }
    ]},
    { title: 'Certidões Proprietário (PF)', fields: [
      { l: 'Déb. Federais', v: data.federalDebtsCertPF }, { l: 'Estadual', v: data.stateCertPF }, { l: 'Municipal', v: data.municipalCertPF }, { l: 'Ações Cíveis', v: data.civilActionsCertPF }, { l: 'Ações Trab.', v: data.laborActionsCertPF }, { l: 'Protestos', v: data.protestsCertPF }, { l: 'Federal Just.', v: data.federalJusticeCertPF }, { l: 'Trab. Just.', v: data.laborJusticeCertPF }
    ]}
  ];

  docSections.forEach(section => {
    y = drawSectionHeader(section.title, y);
    let col = 0;
    section.fields.forEach(field => {
      addField(field.l, field.v, 25 + (col % 2 * 90), y);
      if (col % 2 === 1) y += 6;
      col++;
      if (y > 275) { doc.addPage(); y = 20; }
    });
    if (col % 2 !== 0) y += 6;
    y += 4;
  });

  y = drawSectionHeader('Situação Jurídica', y);
  let col = 0;
  const sitFields = [
    { l: 'Livre/Desemb.', v: data.freeAndClear }, { l: 'Financiamento', v: data.activeFinancing }, { l: 'Alienação Fid.', v: data.fiduciaryAlienation }, { l: 'Hipoteca', v: data.mortgage }, { l: 'Penhora', v: data.seizure }, { l: 'Usufruto', v: data.usufruct }, { l: 'Inventário', v: data.inventory }, { l: 'Divórcio/Part.', v: data.divorcePending }
  ];
  sitFields.forEach(f => {
    addField(f.l, f.v, 25 + (col % 2 * 90), y);
    if (col % 2 === 1) y += 6;
    col++;
  });
  if (data.otherRestrictions) {
    y += 4;
    addField('Outras Restrições', data.otherRestrictions, 25, y);
    y += 6;
  }
  y += 10;

  y = drawSectionHeader('Parecer e Responsabilidade', y);
  addField('Status Final', data.finalStatus, 25, y);
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Observações:', 25, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.observations || '', 25, y + 4, { maxWidth: 160 });
  y += 30;

  if (y > 230) { doc.addPage(); y = 20; }
  doc.setFontSize(10);
  doc.text('__________________________', 25, y);
  doc.text('__________________________', 115, y);
  y += 5;
  doc.setFontSize(8);
  doc.text('Proprietário', 45, y);
  doc.text('Responsável Análise', 130, y);
  y += 15;
  doc.setFontSize(9);
  doc.text(`Data: ${data.date || '___/___/____'}`, pageWidth / 2, y, { align: 'center' });

  if (options.returnUri) {
    return doc.output('datauristring');
  }
  doc.save(`DOC_JURIDICA_${data.ownerName?.replace(/\s+/g, '_') || 'DOC'}.pdf`);
};

export const generateAfterSalesPDF = (data: any, options: { returnUri?: boolean } = {}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 15;
  let pageNum = 1;

  const drawFooter = () => {
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`Página ${pageNum}`, pageWidth - 30, pageHeight - 10);
    doc.text(`Documento gerado eletronicamente em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, pageHeight - 10);
  };

  const drawWatermark = () => {
    const prevSize = doc.getFontSize();
    const prevFont = doc.getFont();
    const prevColor = doc.getTextColor();

    doc.setTextColor(220, 235, 222);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    doc.text("CR IMÓVEIS DE LUXO", pageWidth / 2, pageHeight / 2, { angle: 45, align: 'center', baseline: 'middle', renderingMode: 'fill' });
    
    doc.setTextColor(prevColor);
    doc.setFontSize(prevSize);
    doc.setFont(prevFont.fontName, prevFont.fontStyle);
  };

  const checkPageBreak = (currentY: number, requiredSpace: number = 10) => {
    if (currentY + requiredSpace > pageHeight - 20) {
      drawFooter();
      doc.addPage();
      pageNum++;
      drawWatermark();
      return 20; // New y
    }
    return currentY;
  };

  const drawHeader = (title: string) => {
    doc.setFontSize(18);
    doc.setTextColor(97, 121, 100);
    doc.setFont('helvetica', 'bold');
    doc.text('CR IMÓVEIS DE LUXO', pageWidth / 2, y, { align: 'center' });
    y += 7;
    doc.setFontSize(7);
    doc.setTextColor(120);
    doc.text('IMOBILIÁRIA ESPECIALISTA EM MERCADO DE ALTO PADRÃO', pageWidth / 2, y, { align: 'center' });
    y += 10;
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.text(title, pageWidth / 2, y, { align: 'center' });
    y += 12;
  };

  const drawSectionHeader = (title: string, currentY: number) => {
    currentY = checkPageBreak(currentY, 15);
    doc.setFillColor(245, 245, 245);
    doc.rect(20, currentY, pageWidth - 40, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(title.toUpperCase(), 25, currentY + 5.5);
    return currentY + 12;
  };

  const addField = (label: string, value: string | undefined, x: number, currentY: number, lineLength: number = 40) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`${label}:`, x, currentY);
    const labelWidth = doc.getTextWidth(`${label}: `);
    
    if (value && value !== '---' && value !== '') {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0);
      doc.text(`${value}`, x + labelWidth, currentY);
    } else {
      doc.setDrawColor(200);
      doc.setLineWidth(0.1);
      doc.line(x + labelWidth, currentY + 1, x + labelWidth + lineLength, currentY + 1);
    }
  };

  drawWatermark();
  drawHeader('FICHA DE PÓS-VENDA / PÓS-LOCAÇÃO');

  y = drawSectionHeader('Dados do Cliente', y);
  addField('Nome', data.clientName, 25, y);
  y += 7;
  addField('CPF', data.clientCpf, 25, y);
  addField('Telefone', data.clientPhone, 110, y);
  y += 7;
  addField('E-mail', data.clientEmail, 25, y);
  y += 12;

  y = drawSectionHeader('Dados do Negócio', y);
  addField('Tipo', data.dealType, 25, y);
  addField('Data Conclusão', data.completionDate, 110, y);
  y += 7;
  addField('Imóvel', data.propertyAddress, 25, y);
  y += 7;
  addField('Corretor', data.responsibleAgent, 25, y);
  y += 12;

  y = drawSectionHeader('Avaliação e Satisfação', y);
  addField('Recebeu como esperado?', data.receivedAsExpected, 25, y);
  addField('Nível Satisfação', data.satisfactionLevel, 110, y);
  y += 7;
  addField('Clareza Info.', data.infoClarity, 25, y);
  addField('Atend. Corretor', data.agentService, 110, y);
  y += 7;
  addField('Agilidade Proc.', data.processAgility, 25, y);
  addField('Suporte Negoc.', data.negotiationSupport, 110, y);
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Comentário Geral:', 25, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.generalComment || '', 25, y + 4, { maxWidth: 160 });
  y += 15;

  y = drawSectionHeader('Indicações e Oportunidades', y);
  addField('Indicaria?', data.wouldRecommend, 25, y);
  addField('Deseja Indicar?', data.hasIndication, 110, y);
  if (data.hasIndication === 'Sim') {
    y += 7;
    addField('Nome Indicado', data.indicatedName, 25, y);
    addField('Tel. Indicado', data.indicatedPhone, 110, y);
  }
  y += 7;
  addField('Pretendência', data.futureIntent, 25, y);
  y += 12;

  if (y > 230) { doc.addPage(); y = 20; }
  doc.setFontSize(8);
  doc.text('TERMO DE REGISTRO', 25, y);
  y += 5;
  doc.setFontSize(7);
  doc.text('Autorizo o uso dos dados e comentários para fins de melhoria interna e estatísticas.', 25, y);
  y += 20;

  doc.setFontSize(10);
  doc.text('__________________________', 25, y);
  doc.text('__________________________', 115, y);
  y += 5;
  doc.setFontSize(8);
  doc.text('Cliente', 45, y);
  doc.text('Corretor', 135, y);
  y += 15;
  doc.setFontSize(9);
  doc.text(`Local: ${data.city || '___________'} - Data: ${data.date || '___/___/____'}`, pageWidth / 2, y, { align: 'center' });

  if (options.returnUri) {
    return doc.output('datauristring');
  }
  doc.save(`POS_VENDA_${data.clientName?.replace(/\s+/g, '_') || 'DOC'}.pdf`);
};


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
  const locationDate = `Juiz de Fora/MG, ${new Date(property.signatureDate || new Date()).toLocaleDateString('pt-BR')}`;
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
  const locationDate = `Juiz de Fora/MG, ${new Date(property.signatureDate || new Date()).toLocaleDateString('pt-BR')}`;
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

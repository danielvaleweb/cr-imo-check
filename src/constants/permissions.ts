export interface Permissions {
  canViewReports: boolean;
  canViewFinance: boolean;
  canViewTeam: boolean;
  canApproveUsers: boolean;
  canDeleteProperties: boolean;
  canEditProperties: boolean;
  canDeleteCondos: boolean;
  canEditCondos: boolean;
  canDeleteBrokers: boolean;
  canEditBrokers: boolean;
  canHandleProposals: boolean;
  canManageSystem: boolean;
  canManageAgenda: boolean;
  canDeleteAgenda: boolean;
  canUsePhotoEditor: boolean;
}

export const ROLE_PERMISSIONS: Record<string, Permissions> = {
  // Diretoria
  "CEO Diretor criativo": {
    canViewReports: true,
    canViewFinance: true,
    canViewTeam: true,
    canApproveUsers: true,
    canDeleteProperties: true,
    canEditProperties: true,
    canDeleteCondos: true,
    canEditCondos: true,
    canDeleteBrokers: true,
    canEditBrokers: true,
    canHandleProposals: true,
    canManageSystem: true,
    canManageAgenda: true,
    canDeleteAgenda: true,
    canUsePhotoEditor: true,
  },
  "CEO (Diretor Executivo)": {
    canViewReports: true,
    canViewFinance: true,
    canViewTeam: true,
    canApproveUsers: true,
    canDeleteProperties: true,
    canEditProperties: true,
    canDeleteCondos: true,
    canEditCondos: true,
    canDeleteBrokers: true,
    canEditBrokers: true,
    canHandleProposals: true,
    canManageSystem: true,
    canManageAgenda: true,
    canDeleteAgenda: true,
    canUsePhotoEditor: true,
  },
  "Diretor de Operações": {
    canViewReports: true,
    canViewFinance: true,
    canViewTeam: true,
    canApproveUsers: true,
    canDeleteProperties: true,
    canEditProperties: true,
    canDeleteCondos: true,
    canEditCondos: true,
    canDeleteBrokers: true,
    canEditBrokers: true,
    canHandleProposals: true,
    canManageSystem: false,
    canManageAgenda: true,
    canDeleteAgenda: true,
    canUsePhotoEditor: true,
  },
  "Diretor Comercial": {
    canViewReports: true,
    canViewFinance: true,
    canViewTeam: true,
    canApproveUsers: true,
    canDeleteProperties: true,
    canEditProperties: true,
    canDeleteCondos: true,
    canEditCondos: true,
    canDeleteBrokers: false,
    canEditBrokers: true,
    canHandleProposals: true,
    canManageSystem: false,
    canManageAgenda: true,
    canDeleteAgenda: true,
    canUsePhotoEditor: true,
  },
  // Commercial
  "Corretor de Imóveis": {
    canViewReports: false,
    canViewFinance: false,
    canViewTeam: false,
    canApproveUsers: false,
    canDeleteProperties: false,
    canEditProperties: true, 
    canDeleteCondos: false,
    canEditCondos: false,
    canDeleteBrokers: false,
    canEditBrokers: false,
    canHandleProposals: true,
    canManageSystem: false,
    canManageAgenda: true,
    canDeleteAgenda: false,
    canUsePhotoEditor: false,
  },
  // Finance
  "Diretor Financeiro (CFO)": {
    canViewReports: true,
    canViewFinance: true,
    canViewTeam: true,
    canApproveUsers: false,
    canDeleteProperties: false,
    canEditProperties: false,
    canDeleteCondos: false,
    canEditCondos: false,
    canDeleteBrokers: false,
    canEditBrokers: false,
    canHandleProposals: false,
    canManageSystem: false,
    canManageAgenda: true,
    canDeleteAgenda: false,
    canUsePhotoEditor: false,
  },
  // Juridico
  "Advogado Imobiliário": {
    canViewReports: true,
    canViewFinance: false,
    canViewTeam: false,
    canApproveUsers: false,
    canDeleteProperties: false,
    canEditProperties: true,
    canDeleteCondos: false,
    canEditCondos: true,
    canDeleteBrokers: false,
    canEditBrokers: false,
    canHandleProposals: true,
    canManageSystem: false,
    canManageAgenda: true,
    canDeleteAgenda: false,
    canUsePhotoEditor: false,
  },
  // Management group
  "Gerente Geral": {
    canViewReports: true,
    canViewFinance: true,
    canViewTeam: true,
    canApproveUsers: true,
    canDeleteProperties: true,
    canEditProperties: true,
    canDeleteCondos: true,
    canEditCondos: true,
    canDeleteBrokers: false,
    canEditBrokers: true,
    canHandleProposals: true,
    canManageSystem: false,
    canManageAgenda: true,
    canDeleteAgenda: true,
    canUsePhotoEditor: true,
  },
  "Gerente Comercial": {
    canViewReports: true,
    canViewFinance: false,
    canViewTeam: true,
    canApproveUsers: true,
    canDeleteProperties: true,
    canEditProperties: true,
    canDeleteCondos: true,
    canEditCondos: true,
    canDeleteBrokers: false,
    canEditBrokers: true,
    canHandleProposals: true,
    canManageSystem: false,
    canManageAgenda: true,
    canDeleteAgenda: true,
    canUsePhotoEditor: true,
  },
  // Marketing group
  "Gestor de Marketing": {
    canViewReports: true,
    canViewFinance: false,
    canViewTeam: false,
    canApproveUsers: false,
    canDeleteProperties: false,
    canEditProperties: true,
    canDeleteCondos: false,
    canEditCondos: true,
    canDeleteBrokers: false,
    canEditBrokers: false,
    canHandleProposals: false,
    canManageSystem: false,
    canManageAgenda: true,
    canDeleteAgenda: false,
    canUsePhotoEditor: true,
  },
  "Membro": {
    canViewReports: false,
    canViewFinance: false,
    canViewTeam: false,
    canApproveUsers: false,
    canDeleteProperties: false,
    canEditProperties: false,
    canDeleteCondos: false,
    canEditCondos: false,
    canDeleteBrokers: false,
    canEditBrokers: false,
    canHandleProposals: false,
    canManageSystem: false,
    canManageAgenda: false,
    canDeleteAgenda: false,
    canUsePhotoEditor: false,
  },
};

// Add default values for all other roles based on their group category if needed
// For now, most specific roles will fall into DEFAULT_PERMISSIONS or one of these

// Default permissions for roles not explicitly defined
export const DEFAULT_PERMISSIONS: Permissions = {
  canViewReports: false,
  canViewFinance: false,
  canViewTeam: false,
  canApproveUsers: false,
  canDeleteProperties: false,
  canEditProperties: false,
  canDeleteCondos: false,
  canEditCondos: false,
  canDeleteBrokers: false,
  canEditBrokers: false,
  canHandleProposals: false,
  canManageSystem: false,
  canManageAgenda: false,
  canDeleteAgenda: false,
  canUsePhotoEditor: false,
};

export function getPermissions(role: string): Permissions {
  return ROLE_PERMISSIONS[role] || DEFAULT_PERMISSIONS;
}

export const PERMISSION_LABELS: Record<keyof Permissions, string> = {
  canViewReports: "Ver Relatórios",
  canViewFinance: "Ver Financeiro",
  canViewTeam: "Ver Equipe/Corretores",
  canApproveUsers: "Aprovar Novos Logins",
  canDeleteProperties: "Excluir Imóveis/Captações",
  canEditProperties: "Criar/Editar Imóveis",
  canDeleteCondos: "Excluir Condomínios",
  canEditCondos: "Criar/Editar Condomínios",
  canDeleteBrokers: "Excluir Membros da Equipe",
  canEditBrokers: "Editar Membros da Equipe",
  canHandleProposals: "Gerenciar Propostas",
  canManageSystem: "Configurações do Sistema",
  canManageAgenda: "Agendar / Editar Agenda",
  canDeleteAgenda: "Excluir/Cancelar Agenda",
  canUsePhotoEditor: "Usar Editor de Fotos",
};

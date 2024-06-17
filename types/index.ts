import { Merge } from 'type-fest';
import { Tables } from './supabase.types';

export * from './supabase.types';

/* ----------------------------------- ORG ---------------------------------- */

export type OrgType = Tables<'tbl_org'> & {
  user: Tables<'tbl_org_members'>;
  members: Tables<'tbl_org_members'>[];
};

/* -------------------------------- DOCUMENT -------------------------------- */

export type DocumentType = Merge<
  Tables<'view_documents'>,
  {
    is_enabled: boolean;
    document_id: string;
    org_id: string;
    updated_at: string;
    document_name: string;
  }
>;

export type DocumentDetailType = Merge<
  {
    links: Tables<'tbl_links'>[];
    views: Tables<'view_logs'>[];
    versions: Tables<'tbl_document_versions'>[];
  },
  DocumentType
>;

/* ---------------------------------- LINK ---------------------------------- */

export type LinkViewType = Merge<Tables<'tbl_links'>, DocumentType>;


/* --------------------------------- COLORS --------------------------------- */

export const enum_colors = [
  "#B4876E",
  "#A5B337",
  "#06CF9C",
  "#25D366",
  "#02A698",
  "#7D9EF1",
  "#007BFC",
  "#5E47DE",
  "#7F66FF",
  "#9333EA",
  "#FA6533",
  "#C4532D",
  "#DC2626",
  "#FF2E74",
  "#DB2777",
];
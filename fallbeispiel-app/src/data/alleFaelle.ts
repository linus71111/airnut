import type { Fallbeispiel } from '../lib/types';
import { STANDARD_FAELLE } from './faelle';
import { ALLTAGS_FAELLE } from './faelleAlltag';
import { RETTUNGSDIENST_FAELLE } from './faelleRettungsdienst';
import { WITZIGE_FAELLE } from './faelleWitzig';

/** Alle mitgelieferten Fallbeispiele (ohne eigene Fälle) */
export const ALLE_STANDARD_FAELLE: Fallbeispiel[] = [...STANDARD_FAELLE, ...RETTUNGSDIENST_FAELLE, ...ALLTAGS_FAELLE, ...WITZIGE_FAELLE];

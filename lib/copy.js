/* Copy that is still moving.

   Lines here can be changed in the interface rather than in the source, so a
   positioning shift does not mean editing Python and rebuilding. Overrides
   live in this browser under one key and are shared by every page on the same
   origin — set the descriptor on the hub or on any cut and all seven follow.

   The defaults below are what ships. Change a default only when the wording is
   settled; until then use the field in the UI. */

const COPY_KEY = 'kai-copy-v1';

export const DEFAULTS = {
  descriptor: 'The Kai Autonomous Defense Platform',
};

export const FIELDS = [
  { key:'descriptor', label:'Descriptor',
    hint:'The line under the mark, on all seven cuts.' },
];

function stored(){
  try { return JSON.parse(localStorage.getItem(COPY_KEY)) || {}; } catch { return {}; }
}

/* A live object: mutate it through set() and every render picks it up on the
   next frame, so edits show immediately and exports use the edited value. */
export const COPY = { ...DEFAULTS, ...stored() };

export function set(key, value){
  COPY[key] = value;
  const next = stored(); next[key] = value;
  try { localStorage.setItem(COPY_KEY, JSON.stringify(next)); } catch {}
}

export function reset(key){
  if (key){ COPY[key] = DEFAULTS[key];
    const next = stored(); delete next[key];
    try { localStorage.setItem(COPY_KEY, JSON.stringify(next)); } catch {}
    return;
  }
  Object.assign(COPY, DEFAULTS);
  try { localStorage.removeItem(COPY_KEY); } catch {}
}

export const isOverridden = key => COPY[key] !== DEFAULTS[key];

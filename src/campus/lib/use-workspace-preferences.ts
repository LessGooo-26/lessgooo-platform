import { useEffect, useState } from "react";
import type { Persona } from "./model";
import {
  cleanPreferences,
  loadPreferences,
  workspaceKey,
  type WorkspacePreferences,
} from "./campus-navigation";
export function useWorkspacePreferences(persona: Persona, page: string) {
  const [stored, setStored] = useState(() => ({
    persona,
    data: loadPreferences(persona),
  }));
  const data =
    stored.persona === persona ? stored.data : loadPreferences(persona);
  useEffect(() => {
    setStored((previous) => {
      const data =
        previous.persona === persona ? previous.data : loadPreferences(persona);
      const next = cleanPreferences(
        { ...data, recent: [page, ...data.recent.filter((id) => id !== page)] },
        persona,
      );
      if (
        previous.persona === persona &&
        JSON.stringify(next) === JSON.stringify(data)
      )
        return previous;
      return { persona, data: next };
    });
  }, [persona, page]);
  useEffect(() => {
    if (stored.persona !== persona) return;
    try {
      localStorage.setItem(workspaceKey(persona), JSON.stringify(stored.data));
    } catch {
      /* Preferences remain available for this visit. */
    }
  }, [stored, persona]);
  const update = (
    change: (value: WorkspacePreferences) => WorkspacePreferences,
  ) =>
    setStored((previous) => ({
      persona,
      data: cleanPreferences(
        change(
          previous.persona === persona
            ? previous.data
            : loadPreferences(persona),
        ),
        persona,
      ),
    }));
  return {
    data,
    toggle: (id: string) =>
      update((p) => ({
        ...p,
        pinned: p.pinned.includes(id)
          ? p.pinned.filter((item) => item !== id)
          : p.pinned.length < 6
            ? [...p.pinned, id]
            : p.pinned,
      })),
    clearRecent: () => update((p) => ({ ...p, recent: [] })),
  };
}

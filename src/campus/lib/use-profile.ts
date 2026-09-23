import { useEffect, useState } from "react";
import type { Persona } from "./model";
import type { Profile } from "./workspace";
import { workspaceRequest } from "./workspace-api";
export function useProfile(persona: Persona) {
  const [value, setValue] = useState<{
    persona: Persona;
    profile: Profile;
  } | null>(null);
  useEffect(() => {
    let active = true;
    const load = () =>
      workspaceRequest<{ profile: Profile }>("/api/workspace", persona)
        .then((data) => {
          if (active) setValue({ persona, profile: data.profile });
        })
        .catch(() => {});
    void load();
    window.addEventListener("campus-profile-updated", load);
    return () => {
      active = false;
      window.removeEventListener("campus-profile-updated", load);
    };
  }, [persona]);
  return value?.persona === persona ? value.profile : null;
}

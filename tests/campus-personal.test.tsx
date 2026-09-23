import { afterEach, expect, test, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { LanguageSwitch } from "../src/campus/LanguageSwitch";
import { setLanguage, tx } from "../src/campus/lib/language";
import {
  MediaLibrary,
  ProfileEditor,
  type PersonalData,
} from "../src/campus/PersonalSpace";
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  setLanguage("en");
});
const data: PersonalData = {
  galleries: [],
  media: [],
  profile: {
    id: "profile:parent",
    owner: "parent",
    name: "Camille",
    email: "",
    phone: "",
    bio: "My own words",
    avatar: "",
  },
};
test("English is the default, French switch works and profile drafts keep their contents", () => {
  render(
    <>
      <LanguageSwitch />
      <ProfileEditor persona="parent" data={data} reload={async () => {}} />
    </>,
  );
  expect(screen.getByRole("button", { name: "Save profile" })).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Your name"), {
    target: { value: "Aide" },
  });
  fireEvent.change(
    screen.getByRole("combobox", { name: "Language / Langue" }),
    { target: { value: "fr" } },
  );
  expect(document.documentElement.lang).toBe("fr");
  expect(screen.getByLabelText("Votre nom")).toHaveValue("Aide");
  expect(
    screen.getByRole("button", { name: "Enregistrer le profil" }),
  ).toBeEnabled();
  fireEvent.change(
    screen.getByRole("combobox", { name: "Language / Langue" }),
    { target: { value: "en" } },
  );
  expect(screen.getByLabelText("Your name")).toHaveValue("Aide");
  expect(tx("Explorer les composants de l’unité centrale")).toBe(
    "Explore the parts inside a computer",
  );
});
test("profile submits the edited details using the current persona", async () => {
  const fetch = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(Response.json(data));
  const reload = vi.fn().mockResolvedValue(undefined);
  render(<ProfileEditor persona="parent" data={data} reload={reload} />);
  fireEvent.change(screen.getByLabelText("Contact email"), {
    target: { value: "parent@example.test" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save profile" }));
  await waitFor(() => expect(reload).toHaveBeenCalledOnce());
  const request = fetch.mock.calls[0][1]!;
  expect(request.headers).toMatchObject({ "x-campus-persona": "parent" });
  expect(JSON.parse(String(request.body))).toMatchObject({
    action: "profile",
    data: {
      email: "parent@example.test",
      name: "Camille",
      bio: "My own words",
    },
  });
});
test("video player and download link carry the same file and persona without buffering the full download", () => {
  render(
    <MediaLibrary
      persona="parent"
      reload={async () => {}}
      data={{
        ...data,
        media: [
          {
            id: "video-1",
            owner: "teacher",
            name: "Class video.mp4",
            type: "video/mp4",
            preview: "video/mp4",
            size: 100,
            received: 100,
            complete: 1,
            created: "2026-09-17",
            submission: "",
            gallery: "",
            shared: 1,
          },
        ],
      }}
    />,
  );
  const video = screen.getByLabelText("Class video.mp4");
  expect(video).toHaveAttribute("controls");
  expect(video).toHaveAttribute("preload", "metadata");
  expect(video).toHaveAttribute(
    "src",
    "/api/media?id=video-1&persona=parent&inline=1",
  );
  expect(screen.getByRole("link", { name: "Download" })).toHaveAttribute(
    "href",
    "/api/media?id=video-1&persona=parent",
  );
  expect(screen.getByLabelText("Choose files")).not.toBeDisabled();
});

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
  Galleries,
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
  expect(tx("100 % en direct")).toBe("100% live");
  expect(tx("Écris ici…")).toBe("Write here…");
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

const galleryData: PersonalData = {
  ...data,
  galleries: [
    {
      id: "gallery-1",
      owner: "parent",
      name: "My memories",
      purpose: "",
      color: "blue",
      shared: false,
    },
  ],
  media: [
    {
      id: "photo-1",
      owner: "parent",
      name: "photo.png",
      type: "image/png",
      preview: "image/png",
      size: 100,
      received: 100,
      complete: 1,
      created: "2026-09-20T12:00:00Z",
      submission: "",
      shared: 0,
      gallery: "gallery-1",
      label: "First project",
      photoDate: "2026-09-19",
    },
  ],
};
test("gallery photos show a label and date, and save details and both background choices", async () => {
  const fetch = vi
    .spyOn(globalThis, "fetch")
    .mockImplementation(async () => Response.json(galleryData));
  const reload = vi.fn().mockResolvedValue(undefined);
  render(<Galleries persona="parent" data={galleryData} reload={reload} />);
  fireEvent.click(screen.getByRole("button", { name: /My memories/ }));
  expect(screen.getByRole("heading", { name: "First project" })).toBeVisible();
  expect(screen.getByText("19 Sept 2026")).toHaveAttribute(
    "dateTime",
    "2026-09-19",
  );
  fireEvent.click(screen.getByText("Photo options"));
  fireEvent.change(screen.getByLabelText("Photo label"), {
    target: { value: "Our first project" },
  });
  fireEvent.change(screen.getByLabelText("Photo date (optional)"), {
    target: { value: "2026-09-18" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save details" }));
  await waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
  expect(JSON.parse(String(fetch.mock.calls[0][1]?.body))).toEqual({
    action: "photoDetails",
    data: {
      id: "photo-1",
      label: "Our first project",
      photoDate: "2026-09-18",
    },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Gallery background", exact: true }),
  );
  await waitFor(() => expect(reload).toHaveBeenCalledTimes(2));
  expect(JSON.parse(String(fetch.mock.calls[1][1]?.body))).toMatchObject({
    action: "gallery",
    data: { id: "gallery-1", cover: "photo-1" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "My campus background", exact: true }),
  );
  await waitFor(() => expect(reload).toHaveBeenCalledTimes(3));
  expect(JSON.parse(String(fetch.mock.calls[2][1]?.body))).toEqual({
    action: "background",
    data: { id: "photo-1" },
  });
});

test("French gallery controls retain labels verbatim and viewers cannot edit another owner's photos", () => {
  setLanguage("fr");
  render(
    <Galleries
      persona="child"
      data={{
        ...galleryData,
        galleries: [{ ...galleryData.galleries[0], shared: true }],
      }}
      reload={async () => {}}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: /My memories/ }));
  fireEvent.click(screen.getByText("Options de la photo"));
  expect(screen.getByRole("heading", { name: "First project" })).toBeVisible();
  expect(screen.getByText("19 sept. 2026")).toBeVisible();
  expect(
    screen.queryByLabelText("Légende de la photo"),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Fond de la galerie", exact: true }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Retirer de la galerie" }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Fond de mon campus" }),
  ).toBeVisible();
});

test("a failed photo save keeps the draft and its error follows the selected language", async () => {
  setLanguage("fr");
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    Response.json({ error: "Choose a valid photo date." }, { status: 400 }),
  );
  const reload = vi.fn();
  render(
    <>
      <LanguageSwitch />
      <Galleries persona="parent" data={galleryData} reload={reload} />
    </>,
  );
  fireEvent.click(screen.getByRole("button", { name: /My memories/ }));
  fireEvent.click(screen.getByText("Options de la photo"));
  fireEvent.change(screen.getByLabelText("Légende de la photo"), {
    target: { value: "Keep my draft" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Enregistrer les détails" }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Choisissez une date de photo valide.",
  );
  fireEvent.change(
    screen.getByRole("combobox", { name: "Language / Langue" }),
    { target: { value: "en" } },
  );
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Choose a valid photo date.",
  );
  expect(screen.getByLabelText("Photo label")).toHaveValue("Keep my draft");
  expect(reload).not.toHaveBeenCalled();
});

test("the file library finds a photo by its saved label as well as its filename", () => {
  render(
    <MediaLibrary
      persona="parent"
      data={galleryData}
      reload={async () => {}}
    />,
  );
  fireEvent.change(screen.getByLabelText("Find a file"), {
    target: { value: "first project" },
  });
  expect(screen.getByRole("heading", { name: "First project" })).toBeVisible();
  fireEvent.change(screen.getByLabelText("Find a file"), {
    target: { value: "photo.png" },
  });
  expect(screen.getByRole("heading", { name: "First project" })).toBeVisible();
});

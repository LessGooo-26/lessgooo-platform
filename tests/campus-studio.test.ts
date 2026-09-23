// @vitest-environment node
import { test, expect } from "vitest";
import { CampusStore } from "../server/store";
import { WorkspaceStore } from "../server/workspace-store";
import { Studio } from "../server/studio";
import { publicAddress, downloadUrl } from "../server/safe-download";
import { safeUrl } from "../src/campus/lib/domain";
import { transcriptVtt, type Transcript } from "../src/campus/lib/studio";

test("meeting links allow Meet participants and reject hosts and lookalikes", () => {
  expect(safeUrl("https://meet.google.com/abc-defg-hij", true)).toContain(
    "meet.google.com",
  );
  expect(safeUrl("https://example.zoom.us/j/123456789", true)).toContain("/j/");
  for (const url of [
    "https://meet.google.com.evil.test/abc-defg-hij",
    "https://meet.google.com/new",
    "https://zoom.us/s/12345",
    "https://meet.google.com:8443/abc-defg-hij",
    "http://meet.google.com/abc-defg-hij",
  ])
    expect(() => safeUrl(url, true)).toThrow();
});
test("imports reject private networks, metadata addresses and encoded loopback", () => {
  for (const ip of [
    "0.0.0.0",
    "127.1.1.1",
    "10.0.0.1",
    "172.16.0.1",
    "192.168.1.1",
    "169.254.169.254",
    "100.100.100.200",
    "198.18.1.1",
    "224.0.0.1",
    "::1",
    "::ffff:8.8.8.8",
    "2001:4860:4860::8888",
  ])
    expect(publicAddress(ip)).toBe(false);
  expect(publicAddress("8.8.8.8")).toBe(true);
  for (const url of [
    "file:///etc/passwd",
    "http://example.com/file.mp4",
    "https://2130706433/video.mp4",
    "https://0x7f000001/a",
    "https://user:pass@example.com/a",
    "https://example.com:8080/a",
  ])
    expect(() => downloadUrl(url)).toThrow();
});
test("service requests require consent, stay private and cannot be paid without confirmed terms", () => {
  const c = new CampusStore(":memory:"),
    ws = new WorkspaceStore(c),
    s = new Studio(ws);
  try {
    const input = {
      service: "consultation",
      name: "Test client",
      email: "test@example.test",
      phone: "",
      message: "Practice an interview with me",
      language: "en",
      consent: true,
      country: "CM",
      city: "Douala",
      timezone: "Africa/Douala",
      contact: "email",
      timeframe: "flexible",
      answers: {
        context: "A local demo",
        environment: "Docker on Linux",
        attempts: "Read startup logs",
        decision: "A diagnosis plan",
      },
    };
    expect(() => s.request("adult", { ...input, consent: false })).toThrow();
    expect(() => s.request("child", input)).toThrow();
    const { id } = s.request("adult", input);
    expect(s.snapshot("teacher").requests).toHaveLength(1);
    expect(s.snapshot("teacher").requests[0]).toMatchObject({
      country: "CM",
      timezone: "Africa/Douala",
      answers: input.answers,
    });
    expect(s.snapshot("parent").requests).toHaveLength(0);
    expect(s.snapshot("adult").requests[0]).not.toHaveProperty("amount");
    expect(() => s.request("adult", input)).toThrow(/already/);
    expect(() =>
      s.updateRequest("adult", { id, status: "closed", notes: "" }),
    ).toThrow();
    s.updateRequest("teacher", {
      id,
      status: "contacted",
      notes: "Awaiting agreed price",
    });
    expect(s.snapshot("teacher").requests[0].status).toBe("contacted");
  } finally {
    s.close();
    c.close();
  }
});
test("transcripts inherit current file visibility and retry requires ownership", () => {
  const c = new CampusStore(":memory:"),
    ws = new WorkspaceStore(c),
    studio = new Studio(ws);
  try {
    const bytes = Buffer.from([
      0, 0, 0, 24, 102, 116, 121, 112, 105, 115, 111, 109, 0, 0, 0, 0,
    ]);
    const file = ws.start("adult", {
      name: "private.mp4",
      type: "video/mp4",
      size: bytes.length,
    });
    ws.chunk("adult", file.id, 0, bytes);
    ws.finish("adult", file.id);
    const tr: Transcript = {
      id: `transcript:${file.id}`,
      owner: "alex",
      status: "done",
      language: "en",
      error: "",
      segments: [{ start: 0.2, end: 3.1, text: "Learn Docker <b>today</b>" }],
    };
    ws.put("transcript", "alex", tr);
    expect(studio.transcript("adult", file.id)?.segments[0].text).toContain(
      "Docker",
    );
    expect(() => studio.transcript("parent", file.id)).toThrow();
    expect(studio.searchableTranscripts("parent")).toHaveLength(0);
    expect(studio.searchableTranscripts("adult")[0].text).toContain("Docker");
    expect(() => studio.retry("teacher", file.id)).toThrow();
    expect(transcriptVtt(tr)).toContain("00:00:00.200 --> 00:00:03.100");
    expect(transcriptVtt(tr)).not.toContain("<b>");
  } finally {
    studio.close();
    c.close();
  }
});
test("only the old demo owner profile is migrated to Carles", () => {
  const c = new CampusStore(":memory:"),
    ws = new WorkspaceStore(c);
  try {
    const profile = {
      id: "profile:teacher",
      owner: "teacher",
      name: "Eddy",
      email: "",
      phone: "",
      bio: "Saved biography",
      avatar: "",
    };
    ws.put("profile", "teacher", profile);
    const migrated = new WorkspaceStore(c).snapshot("teacher").profile;
    expect(migrated.name).toBe("Carles");
    expect(migrated.bio).toBe("Saved biography");
    ws.put("profile", "teacher", {
      ...profile,
      name: "My chosen display name",
    });
    expect(new WorkspaceStore(c).snapshot("teacher").profile.name).toBe(
      "My chosen display name",
    );
  } finally {
    c.close();
  }
});

test("company requests retain their area, stay private and deduplicate by area", () => {
  const campus = new CampusStore(":memory:");
  const studio = new Studio(new WorkspaceStore(campus));
  const input = {
    service: "company",
    course: "linux",
    name: "Company Test",
    email: "company@example.test",
    phone: "",
    message: "Maintain a fictional test server",
    language: "en",
    consent: true,
    country: "CM",
    city: "",
    timezone: "Africa/Douala",
    contact: "email",
    timeframe: "flexible",
    answers: {
      organisation: "Test company",
      businessContext: "Test systems",
      linuxEstate: "One local test server",
      maintenance: "Test window",
    },
  };
  try {
    expect(() => studio.request("child", input)).toThrow();
    const first = studio.request("adult", input);
    expect(studio.snapshot("teacher").requests[0]).toMatchObject({
      id: first.id,
      course: "linux",
      answers: input.answers,
    });
    expect(studio.snapshot("parent").requests).toHaveLength(0);
    expect(() => studio.request("adult", input)).toThrow(/already/);
    studio.request("adult", {
      ...input,
      course: "ai-design",
      answers: {
        organisation: "Test company",
        businessContext: "Test campaign",
        designBrief: "Test poster",
        designAssets: "Test assets",
      },
    });
    expect(
      studio
        .snapshot("adult")
        .requests.map((r) => r.course)
        .sort(),
    ).toEqual(["ai-design", "linux"]);
    expect(() =>
      studio.updateRequest("adult", {
        id: first.id,
        status: "closed",
        notes: "",
      }),
    ).toThrow();
  } finally {
    studio.close();
    campus.close();
  }
});

import { describe, expect, it } from "vitest";
import { parseDomesticHtml } from "@/lib/live-tracking.server";

const html = `<div id="divDisplayTrackResult"><table>
<tr><td>Origin</td><td>Addis Ababa</td></tr>
<tr><td>Destination</td><td>Hawassa</td></tr>
<tr><td>Item Events</td></tr>
<tr><td>August 25, 2025</td></tr>
<tr><td>Posted at counter</td><td>Addis Ababa</td><td>08:19</td></tr>
<tr><td>Dispatched to Hawassa</td><td>Addis Ababa</td><td>14:02</td></tr>
</table></div>`;

describe("Ethiopian Post page parsing", () => {
  it("reads origin, destination and events newest first", () => {
    const r = parseDomesticHtml(html, "EG123456789ET")!;
    expect(r.origin).toBe("Addis Ababa");
    expect(r.destination).toBe("Hawassa");
    expect(r.events).toHaveLength(2);
    expect(r.status).toBe("Dispatched to Hawassa");
    expect(r.events[1]).toMatchObject({ date: "August 25, 2025", location: "Addis Ababa", time: "08:19" });
  });
  it("returns null when the page has no results", () => {
    expect(parseDomesticHtml("<html></html>", "EG123456789ET")).toBeNull();
  });
});

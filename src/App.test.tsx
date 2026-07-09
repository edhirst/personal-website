import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

const makePublication = (id: string, citationCount: number, category: string) => ({
  id,
  links: {
    bibtex: `https://inspirehep.net/api/literature/${id}?format=bibtex`,
  },
  metadata: {
    titles: [{ title: `Publication ${id}` }],
    authors: [
      { full_name: "Hirst, Edward" },
      { full_name: "Collaborator, Example" },
    ],
    abstracts: [{ value: `Abstract ${id}` }],
    arxiv_eprints: [{ value: `2601.0000${id}`, categories: [category] }],
    primary_arxiv_category: [category],
    citation_count: citationCount,
  },
});

const mockJsonResponse = (data: unknown) =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(data),
  } as Response);

describe("publication section", () => {
  beforeEach(() => {
    const publications = [
      makePublication("1", 12, "hep-th"),
      makePublication("2", 7, "math.DG"),
      makePublication("3", 1, "cs.LG"),
      makePublication("4", 0, "gr-qc"),
    ];

    global.fetch = jest.fn((input: RequestInfo | URL) => {
      const url = input.toString();

      if (url.includes("/literature/facets")) {
        return mockJsonResponse({
          hits: { total: { value: 4 } },
          aggregations: {
            citation_summary: {
              "h-index": { value: { all: 3 } },
              citations: {
                buckets: {
                  all: { citations_count: { value: 20 } },
                },
              },
            },
          },
        });
      }

      if (url.includes("/literature?")) {
        return mockJsonResponse({
          hits: {
            total: 4,
            hits: publications,
          },
        });
      }

      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve("@article{example}"),
      } as Response);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("toggles recent and full publication views with INSPIRE metadata", async () => {
    render(<App />);

    const showAllButton = await screen.findByRole("button", {
      name: "Show All",
    });
    const research = document.getElementById("research") as HTMLElement;

    expect(within(research).getByText("Recent Publications")).toBeInTheDocument();
    expect(
      within(research).getByText("Papers: 4, Citations: 20, h-index: 3")
    ).toBeInTheDocument();
    expect(within(research).getAllByText(/\d+ citations?/i)).toHaveLength(3);
    expect(
      within(research).getByText(/Hirst, E\., Collaborator, E\. \[hep-th\]/)
    ).toBeInTheDocument();
    expect(
      within(research).queryByText("View Full Publication List on Inspire")
    ).not.toBeInTheDocument();

    userEvent.click(showAllButton);

    await waitFor(() => {
      expect(within(research).getByText("Publications")).toBeInTheDocument();
      expect(within(research).queryByText("Recent Publications")).not.toBeInTheDocument();
      expect(within(research).getAllByText(/\d+ citations?/i)).toHaveLength(4);
      expect(
        within(research).getByRole("button", { name: "Show Recent" })
      ).toBeInTheDocument();
    });

    userEvent.click(within(research).getByRole("button", { name: "Show Recent" }));

    await waitFor(() => {
      expect(within(research).getByText("Recent Publications")).toBeInTheDocument();
      expect(within(research).getAllByText(/\d+ citations?/i)).toHaveLength(3);
      expect(
        within(research).getByRole("button", { name: "Show All" })
      ).toBeInTheDocument();
    });

    userEvent.click(screen.getByRole("button", { name: "Toggle dark mode" }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Toggle light mode" })
      ).toBeInTheDocument();
    });

    userEvent.click(within(research).getByRole("button", { name: "Show All" }));

    await waitFor(() => {
      expect(within(research).getByText("Publications")).toBeInTheDocument();
      expect(within(research).getAllByText(/\d+ citations?/i)).toHaveLength(4);
      expect(
        within(research).getByRole("button", { name: "Show Recent" })
      ).toBeInTheDocument();
    });
  });
});

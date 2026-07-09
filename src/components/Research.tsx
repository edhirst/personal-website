import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Link,
  Paper,
  Grid,
  IconButton,
  Button,
  Tooltip,
  CircularProgress,
  useTheme,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import ArticleIcon from "@mui/icons-material/Article";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

declare global {
  interface Window {
    MathJax?: {
      typesetPromise?: () => Promise<void>;
    };
    __mathJaxLoadPromise?: Promise<void>;
  }
}

interface Publication {
  id: string;
  title: string;
  authors: string[];
  abstract?: string;
  link: string;
  arxivId?: string;
  bibtexUrl?: string;
  citationCount: number;
  primaryArchive?: string;
}

interface CitationSummary {
  papers: number;
  citations: number;
  hIndex: number;
}

const researchAreas = [
  {
    title: "AI Modelling of Geometries",
    description:
      "Finding and approximating metrics and forms on various geometries, often related to string-compactification.",
  },
  {
    title: "Information Geometry for AI",
    description: "Generalising ML methods to account for model space geometry.",
  },
  {
    title: "Cluster Algebras",
    description:
      "Computational analysis of the combinatorial process of cluster algebra mutation.",
  },
];

const formatAuthorName = (fullName: string) => {
  const parts = fullName.split(", ");
  if (parts.length !== 2) return fullName;
  const lastName = parts[0];
  const firstNames = parts[1].split(" ");
  const initials = firstNames.map((name) => name.charAt(0)).join(".");
  return `${lastName}, ${initials}.`;
};

const INSPIRE_AUTHOR_QUERY = "a Edward.Hirst.1";
const INSPIRE_API_BASE = "https://inspirehep.net/api";
const defaultPublicationCount = 3;
const publicationPageSize = 100;

const getTotalHits = (total: number | { value?: number }) => {
  if (typeof total === "number") return total;
  return total?.value ?? 0;
};

const formatAuthorList = (authorList: string[]) => {
  if (authorList.length <= 8) {
    return authorList.map(formatAuthorName).join(", ");
  }
  return authorList.slice(0, 8).map(formatAuthorName).join(", ") + " et al.";
};

const getPrimaryArchive = (metadata: any) =>
  metadata.primary_arxiv_category?.[0] ??
  metadata.arxiv_eprints?.[0]?.categories?.[0];

const mapPublication = (hit: any): Publication => {
  const metadata = hit.metadata;
  const arxivId = metadata.arxiv_eprints?.[0]?.value;

  return {
    id: hit.id,
    title: metadata.titles?.[0]?.title ?? "Untitled publication",
    authors: (metadata.authors ?? []).map((author: any) => author.full_name),
    abstract: metadata.abstracts?.[0]?.value,
    link: arxivId
      ? `https://arxiv.org/pdf/${arxivId}`
      : `https://inspirehep.net/literature/${hit.id}`,
    arxivId,
    bibtexUrl:
      hit.links?.bibtex ??
      `${INSPIRE_API_BASE}/literature/${hit.id}?format=bibtex`,
    citationCount: metadata.citation_count ?? 0,
    primaryArchive: getPrimaryArchive(metadata),
  };
};

const fetchPublicationPage = async (page: number) => {
  const params = new URLSearchParams({
    sort: "mostrecent",
    size: String(publicationPageSize),
    page: String(page),
    q: INSPIRE_AUTHOR_QUERY,
  });

  const response = await fetch(`${INSPIRE_API_BASE}/literature?${params}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

const fetchAllPublications = async () => {
  const firstPage = await fetchPublicationPage(1);
  const total = getTotalHits(firstPage.hits.total);
  const totalPages = Math.ceil(total / publicationPageSize);
  const remainingPages = Array.from(
    { length: Math.max(totalPages - 1, 0) },
    (_, index) => fetchPublicationPage(index + 2)
  );
  const remainingResults = await Promise.all(remainingPages);
  const hits = [
    ...firstPage.hits.hits,
    ...remainingResults.flatMap((result) => result.hits.hits),
  ];

  return {
    publications: hits.map(mapPublication),
    total,
  };
};

const fetchCitationSummary = async () => {
  const params = new URLSearchParams({
    q: INSPIRE_AUTHOR_QUERY,
    facet_name: "citation-summary",
  });

  const response = await fetch(`${INSPIRE_API_BASE}/literature/facets?${params}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  const summary = data.aggregations?.citation_summary;

  return {
    papers: getTotalHits(data.hits.total),
    citations:
      summary?.citations?.buckets?.all?.citations_count?.value ?? 0,
    hIndex: summary?.["h-index"]?.value?.all ?? 0,
  };
};

const loadMathJax = () => {
  if (window.__mathJaxLoadPromise) {
    return window.__mathJaxLoadPromise;
  }

  window.__mathJaxLoadPromise = new Promise<void>((resolve, reject) => {
    if (!document.getElementById("MathJax-config")) {
      const config = document.createElement("script");
      config.id = "MathJax-config";
      config.text = `
        window.MathJax = {
          startup: {
            typeset: false
          },
          tex: {
            inlineMath: [['\\\\(', '\\\\)']],
            displayMath: [['\\\\[', '\\\\]']],
            processEscapes: true
          },
          options: {
            skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']
          }
        };
      `;
      document.head.appendChild(config);
    }

    const existingScript = document.getElementById("MathJax-script");
    if (existingScript) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
    script.async = true;
    script.id = "MathJax-script";
    script.crossOrigin = "anonymous";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load MathJax"));
    document.head.appendChild(script);
  });

  return window.__mathJaxLoadPromise;
};

const renderLatex = (text: string) => {
  // First handle MathML by removing it temporarily
  const mathmlPlaceholders: string[] = [];
  let textWithoutMathml = text.replace(/<math.*?<\/math>/g, (match) => {
    mathmlPlaceholders.push(match);
    return `__MATHML_${mathmlPlaceholders.length - 1}__`;
  });

  // Replace standalone $ with inline math mode
  textWithoutMathml = textWithoutMathml.replace(/\$([^$]+)\$/g, "\\($1\\)");
  // Replace double $$ with display math mode
  textWithoutMathml = textWithoutMathml.replace(/\$\$([^$]+)\$\$/g, "\\[$1\\]");

  // Put MathML back
  return textWithoutMathml.replace(
    /__MATHML_(\d+)__/g,
    (_, index) => mathmlPlaceholders[parseInt(index)]
  );
};

const Research: React.FC = () => {
  const theme = useTheme();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [citationSummary, setCitationSummary] =
    useState<CitationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedAbstracts, setExpandedAbstracts] = useState<{
    [key: string]: boolean;
  }>({});
  const [showAllPublications, setShowAllPublications] = useState(false);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const [publicationResult, summary] = await Promise.all([
          fetchAllPublications(),
          fetchCitationSummary(),
        ]);

        setPublications(publicationResult.publications);
        setCitationSummary({
          ...summary,
          papers: publicationResult.total || summary.papers,
        });
        setError(null);
      } catch (error) {
        console.error("Error fetching publications:", error);
        setError("Failed to load publications. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, []);

  useEffect(() => {
    loadMathJax().catch((error) => {
      console.error("Error loading MathJax:", error);
    });
  }, []);

  // Separate effect for handling MathJax rendering
  useEffect(() => {
    const renderMath = async () => {
      if (window.MathJax?.typesetPromise) {
        try {
          await window.MathJax.typesetPromise();
        } catch (error) {
          console.error("Error rendering MathJax:", error);
        }
      }
    };

    renderMath();
  }, [expandedAbstracts, publications, showAllPublications]);

  const toggleAbstract = (id: string) => {
    setExpandedAbstracts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const copyBibtex = async (publication: Publication) => {
    try {
      if (!publication.bibtexUrl) return;
      const response = await fetch(publication.bibtexUrl, {
        headers: { Accept: "text/plain" },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch BibTeX for ${publication.id}`);
      }

      const bibtex = await response.text();
      await navigator.clipboard.writeText(bibtex);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const displayedPublications = showAllPublications
    ? publications
    : publications.slice(0, defaultPublicationCount);
  const sectionTitle = showAllPublications ? "Publications" : "Recent Publications";

  return (
    <Box
      id="research"
      sx={{
        minHeight: "100vh",
        py: 8,
        backgroundColor:
          theme.palette.mode === "light"
            ? theme.palette.background.default
            : theme.palette.background.paper,
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="h4" component="h2" gutterBottom textAlign="center">
          Research
        </Typography>

        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center" }}
          >
            <SchoolIcon sx={{ mr: 1 }} /> Research Areas
          </Typography>
          <Grid container spacing={3}>
            {researchAreas.map((area, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    height: "100%",
                    transition: "transform 0.2s, background-color 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      backgroundColor:
                        theme.palette.mode === "light"
                          ? "rgba(0, 0, 0, 0.02)"
                          : "rgba(255, 255, 255, 0.05)",
                    },
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    {area.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {area.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1,
              mb: 1,
              pr: showAllPublications ? { xs: 0.5, sm: 1 } : 0,
            }}
          >
            <Typography
              variant="h6"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <ArticleIcon sx={{ mr: 1 }} /> {sectionTitle}
            </Typography>
            {citationSummary && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                Papers: {citationSummary.papers}, Citations:{" "}
                {citationSummary.citations}, h-index: {citationSummary.hIndex}
              </Typography>
            )}
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" textAlign="center" my={4}>
              {error}
            </Typography>
          ) : (
            <>
              <Box
                sx={{
                  maxHeight: showAllPublications
                    ? { xs: "70vh", md: 680 }
                    : "none",
                  overflowY: showAllPublications ? "auto" : "visible",
                  pr: showAllPublications ? { xs: 0.5, sm: 1 } : 0,
                }}
              >
                {displayedPublications.map((pub) => (
                  <Paper
                    key={pub.id}
                    elevation={1}
                    sx={{
                      p: 2,
                      mb: 2,
                      transition: "box-shadow 0.2s, background-color 0.2s",
                      "&:hover": {
                        boxShadow: 3,
                        backgroundColor:
                          theme.palette.mode === "light"
                            ? "rgba(0, 0, 0, 0.02)"
                            : "rgba(255, 255, 255, 0.05)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "stretch",
                        gap: 2,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ mb: 1 }}>
                          <Link
                            href={pub.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              color: "primary.main",
                              textDecoration: "none",
                              "&:hover": { textDecoration: "underline" },
                            }}
                          >
                            <Typography
                              variant="h6"
                              component="h3"
                              dangerouslySetInnerHTML={{
                                __html: renderLatex(pub.title),
                              }}
                            />
                          </Link>
                          <Typography variant="body2" color="text.secondary">
                            {formatAuthorList(pub.authors)}
                            {pub.primaryArchive && ` [${pub.primaryArchive}]`}
                          </Typography>
                        </Box>

                        {pub.abstract && (
                          <Button
                            onClick={() => toggleAbstract(pub.id)}
                            startIcon={
                              expandedAbstracts[pub.id] ? (
                                <ExpandLessIcon />
                              ) : (
                                <ExpandMoreIcon />
                              )
                            }
                            sx={{ textTransform: "none" }}
                          >
                            {expandedAbstracts[pub.id] ? "Hide" : "Show"}{" "}
                            Abstract
                          </Button>
                        )}
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          justifyContent: "space-between",
                          flexShrink: 0,
                          minWidth: { xs: 58, sm: 84 },
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ textAlign: "right" }}
                        >
                          {pub.citationCount}{" "}
                          {pub.citationCount === 1 ? "citation" : "citations"}
                        </Typography>

                        {pub.bibtexUrl && (
                          <Tooltip title="Copy BibTeX">
                            <IconButton
                              onClick={() => copyBibtex(pub)}
                              size="small"
                              sx={{ mr: -0.5 }}
                            >
                              <ContentCopyIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>

                    {expandedAbstracts[pub.id] && pub.abstract && (
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 1,
                          p: 1,
                          backgroundColor:
                            theme.palette.mode === "light"
                              ? "rgba(0, 0, 0, 0.02)"
                              : "rgba(255, 255, 255, 0.05)",
                          borderRadius: 1,
                        }}
                        dangerouslySetInnerHTML={{
                          __html: renderLatex(pub.abstract),
                        }}
                      />
                    )}
                  </Paper>
                ))}
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  mt: 4,
                }}
              >
                {publications.length > defaultPublicationCount && (
                  <Button
                    variant="outlined"
                    onClick={() => setShowAllPublications(!showAllPublications)}
                  >
                    {showAllPublications ? "Show Recent" : "Show All"}
                  </Button>
                )}
              </Box>
            </>
          )}
        </Box>
        <Box
          sx={{
            mt: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="body1" sx={{ mb: 0 }}>
            I'm always open to enquiries for supervision from prospective
            students, or for more general research collaboration.
          </Typography>
          <Link
            href="mailto:ehirst@unicamp.br"
            variant="body1"
            sx={{
              display: "inline-block",
              "&:hover": { color: "primary.main" },
            }}
          >
            Please get in touch!
          </Link>
        </Box>
      </Container>
    </Box>
  );
};

export default Research;

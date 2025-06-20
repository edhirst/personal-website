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
  }
}

interface Publication {
  title: string;
  authors: string;
  abstract?: string;
  link: string;
  arxivId?: string;
  bibtex?: string;
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

const formatAuthorList = (authors: string) => {
  const authorList = authors.split(", ");
  if (authorList.length <= 8) {
    return authorList.map(formatAuthorName).join(", ");
  }
  return authorList.slice(0, 8).map(formatAuthorName).join(", ") + " et al.";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedAbstracts, setExpandedAbstracts] = useState<{
    [key: number]: boolean;
  }>({});
  const [showAllPublications, setShowAllPublications] = useState(false);
  const defaultPublicationCount = 3;
  const maxPublications = 6;

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const response = await fetch(
          `https://inspirehep.net/api/literature?sort=mostrecent&size=${maxPublications}&q=a%20Edward.Hirst.1`,
          {
            headers: {
              Accept: "application/json",
              "User-Agent": "Mozilla/5.0 (compatible; AcademicWebsite/1.0)",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const pubs = await Promise.all(
          data.hits.hits.map(async (hit: any) => {
            try {
              const bibtexResponse = await fetch(
                `https://inspirehep.net/api/literature/${hit.id}?format=bibtex`,
                {
                  headers: {
                    Accept: "text/plain",
                    "User-Agent":
                      "Mozilla/5.0 (compatible; AcademicWebsite/1.0)",
                  },
                }
              );

              if (!bibtexResponse.ok) {
                throw new Error(`Failed to fetch BibTeX for ${hit.id}`);
              }

              const bibtex = await bibtexResponse.text();
              const arxivId = hit.metadata.arxiv_eprints?.[0]?.value;

              // Format the authors as a list of last names, first initials
              const authors = hit.metadata.authors.map((a: any) => {
                const parts = a.full_name.split(", ");
                const lastName = parts[0];
                const firstNames = parts[1].split(" ");
                const initials = firstNames
                  .map((name: string) => name.charAt(0))
                  .join(".");
                return `${lastName}, ${initials}.`;
              });

              return {
                title: hit.metadata.titles[0].title,
                authors: authors.join(", "),
                abstract: hit.metadata.abstracts?.[0]?.value,
                link: arxivId
                  ? `https://arxiv.org/pdf/${arxivId}`
                  : `https://inspirehep.net/literature/${hit.id}`,
                arxivId,
                bibtex,
              };
            } catch (error) {
              console.error(`Error fetching BibTeX for ${hit.id}:`, error);
              return {
                title: hit.metadata.titles[0].title,
                authors: hit.metadata.authors
                  .map((a: any) => a.full_name)
                  .join(", "),
                abstract: hit.metadata.abstracts?.[0]?.value,
                link: `https://inspirehep.net/literature/${hit.id}`,
              };
            }
          })
        );

        setPublications(pubs);
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
    // Add MathJax configuration first
    const config = document.createElement("script");
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

    // Then load MathJax
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
    script.async = true;
    script.id = "MathJax-script";

    script.onerror = (e) => {
      console.error("Error loading MathJax:", e);
    };

    document.head.appendChild(script);

    return () => {
      if (config.parentNode) {
        config.parentNode.removeChild(config);
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
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
  }, [expandedAbstracts]);

  const toggleAbstract = (index: number) => {
    setExpandedAbstracts((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const copyBibtex = async (bibtex: string) => {
    try {
      await navigator.clipboard.writeText(bibtex);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const displayedPublications = showAllPublications
    ? publications
    : publications.slice(0, defaultPublicationCount);

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
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center" }}
          >
            <ArticleIcon sx={{ mr: 1 }} /> Recent Publications
          </Typography>

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
              {displayedPublications.map((pub, index) => (
                <Paper
                  key={index}
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
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mt: 1,
                    }}
                  >
                    {pub.abstract && (
                      <Button
                        onClick={() => toggleAbstract(index)}
                        startIcon={
                          expandedAbstracts[index] ? (
                            <ExpandLessIcon />
                          ) : (
                            <ExpandMoreIcon />
                          )
                        }
                        sx={{ textTransform: "none" }}
                      >
                        {expandedAbstracts[index] ? "Hide" : "Show"} Abstract
                      </Button>
                    )}

                    {pub.bibtex && (
                      <Tooltip title="Copy BibTeX">
                        <IconButton
                          onClick={() => copyBibtex(pub.bibtex!)}
                          size="small"
                          sx={{ ml: "auto" }}
                        >
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>

                  {expandedAbstracts[index] && pub.abstract && (
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
                    {showAllPublications
                      ? "Show Less"
                      : "Show More Publications"}
                  </Button>
                )}

                <Button
                  variant="outlined"
                  component="a"
                  href="https://inspirehep.net/authors/1791403"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{textAlign: "center"}}
                >
                  View Full Publication List on Inspire
                </Button>
              </Box>
            </>
          )}
        </Box>
        <Typography
          variant="body1"
          paragraph
          sx={{
            mt: 2,
            textAlign: "center",
          }}
        >
          I'm always open to enquiries for supervision from prospective
          students, or for more general research collaboration.
          <Link
            href="mailto:e.hirst@qmul.ac.uk"
            sx={{
              mt: 1,
              "&:hover": { color: "primary.main" },
            }}
          >
            <Typography variant="body1">Please get in touch!</Typography>
          </Link>
        </Typography>
      </Container>
    </Box>
  );
};

export default Research;

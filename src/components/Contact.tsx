import React from "react";
import {
  Box,
  Container,
  Link,
  Stack,
  Typography,
  Divider,
  useTheme,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { OrcidIcon, InspireIcon } from "./icons/CustomIcons";

const Contact: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      id="contact"
      component="footer"
      sx={{
        py: 4,
        backgroundColor: theme.palette.background.default,
        borderTop: "1px solid",
        borderColor: theme.palette.divider,
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 2, sm: 4 }}
          justifyContent="center"
          alignItems="center"
          divider={
            <Divider
              orientation="vertical"
              flexItem
              sx={{
                display: { xs: "none", sm: "block" },
              }}
            />
          }
        >
          <Link
            href="mailto:e.hirst@qmul.ac.uk"
            sx={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              color: "text.primary",
              "&:hover": { color: "primary.main" },
            }}
          >
            <EmailIcon sx={{ mr: 1, fontSize: "1.2rem" }} />
            <Typography variant="body2">e.hirst@qmul.ac.uk</Typography>
          </Link>

          <Stack
            direction="row"
            spacing={2}
            sx={{
              "& a": {
                color: "text.secondary",
                "&:hover": {
                  color: "primary.main",
                },
              },
            }}
          >
            <Link
              href="https://orcid.org/0000-0003-1699-4399"
              target="_blank"
              rel="noopener noreferrer"
              title="ORCID"
            >
              <OrcidIcon sx={{ fontSize: "1.2rem" }} />
            </Link>
            <Link
              href="https://inspirehep.net/authors/1791403"
              target="_blank"
              rel="noopener noreferrer"
              title="InspireHEP"
            >
              <InspireIcon sx={{ fontSize: "1.2rem" }} />
            </Link>
            <Link
              href="https://github.com/edhirst"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
            >
              <GitHubIcon sx={{ fontSize: "1.2rem" }} />
            </Link>
            <Link
              href="https://www.linkedin.com/in/edward-hirst"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn"
            >
              <LinkedInIcon sx={{ fontSize: "1.2rem" }} />
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Contact;

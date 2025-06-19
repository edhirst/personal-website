import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  useTheme,
} from "@mui/material";
import TerrainIcon from "@mui/icons-material/Terrain";
import TsunamiIcon from "@mui/icons-material/Tsunami";
import PhishingIcon from "@mui/icons-material/Phishing";
import ForestIcon from "@mui/icons-material/Forest";

const interests = [
  {
    title: "Skiing",
    description: "Freestyle and backcountry",
    icon: <TerrainIcon fontSize="large" />,
  },
  {
    title: "Surfing",
    description: "Aspiring kook",
    icon: <TsunamiIcon fontSize="large" />,
  },
  {
    title: "Sharks",
    description: "Marine life and conservation",
    icon: <PhishingIcon fontSize="large" />,
  },
  {
    title: "Travel",
    description: "Exploring new cultures and cuisines",
    icon: <ForestIcon fontSize="large" />,
  },
];

const PersonalInterests: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      id="interests"
      sx={{
        minHeight: "80vh",
        py: 8,
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h4" component="h2" gutterBottom textAlign="center">
          Personal Interests
        </Typography>

        <Typography variant="body1" paragraph textAlign="center" sx={{ mb: 6 }}>
          Beyond research, my interests include...
        </Typography>

        <Grid container spacing={4}>
          {interests.map((interest, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  transition: "transform 0.2s, background-color 0.2s",
                  backgroundColor: theme.palette.background.paper,
                  "&:hover": {
                    transform: "translateY(-5px)",
                    backgroundColor:
                      theme.palette.mode === "light"
                        ? "rgba(0, 0, 0, 0.01)"
                        : "rgba(255, 255, 255, 0.01)",
                  },
                }}
              >
                <Box sx={{ color: "primary.main", mb: 2 }}>{interest.icon}</Box>
                <Typography variant="h6" gutterBottom>
                  {interest.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {interest.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default PersonalInterests;

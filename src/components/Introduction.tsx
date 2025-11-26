import React from "react";
import { Box, Container, Typography, Avatar } from "@mui/material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from "@mui/lab";
import { styled, useTheme } from "@mui/material/styles";
import WorkIcon from "@mui/icons-material/Work";
import personalImage from "../assets/personal.jpg";

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(25),
  height: theme.spacing(25),
  margin: "0 auto",
  marginBottom: theme.spacing(3),
  border: `3px solid ${theme.palette.primary.main}`,
  "& .MuiAvatar-img": {
    objectFit: "cover",
    objectPosition: "50% 40%",
  },
}));

const StyledTimeline = styled(Timeline)(({ theme }) => ({
  padding: theme.spacing(2, 0),
  maxWidth: "800px",
  margin: "0 auto",
  marginTop: theme.spacing(4),
  "& .MuiTimelineItem-root": {
    width: "100%",
    "&::before": {
      display: "none",
    },
  },
  "& .MuiTimelineContent-root": {
    textAlign: "left",
    flex: 1,
  },
}));

const positions = [
  {
    title: "RESEARCH FELLOW",
    institution: "IMECC, University of Campinas",
    dates: "2025-present",
    link: "https://www.ime.unicamp.br/",
  },
  {
    title: "POSTDOC",
    institution: "Queen Mary, University of London",
    dates: "2023-2025",
    link: "https://www.qmul.ac.uk/maths/",
  },
  {
    title: "VISITOR",
    institution: "London Institute for Mathematical Sciences",
    dates: "2021-2023",
    link: "https://lims.ac.uk/",
  },
  {
    title: "PHD",
    institution: "City St George's, University of London.",
    dates: "2019-2023",
    link: "https://www.city.ac.uk/about/schools/science-technology/mathematics",
  },
  {
    title: "MASTER",
    institution: "Imperial College London",
    dates: "2015-2019",
    link: "https://www.imperial.ac.uk/mathematics",
  },
];

const Introduction: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      id="intro"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        pt: { xs: 12, sm: 14 },
        pb: 8,
        background:
          theme.palette.mode === "light"
            ? "linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9))"
            : "linear-gradient(rgba(18, 18, 18, 0.9), rgba(18, 18, 18, 0.9))",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Container maxWidth="md">
        <Box
          textAlign="center"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "80vh",
            width: "100%",
          }}
        >
          <ProfileAvatar
            alt="Profile Picture"
            src={personalImage}
            sx={{
              width: { xs: theme.spacing(20), sm: theme.spacing(25) },
              height: { xs: theme.spacing(20), sm: theme.spacing(25) },
            }}
          />
          <Typography variant="h3" component="h1" gutterBottom>
            Dr. Edward Hirst
          </Typography>
          <Typography variant="h5" color="primary" gutterBottom>
            FAPESP Research Fellow
          </Typography>
          <Typography variant="body1" paragraph sx={{ mt: 3 }}>
            My research centres on application of machine learning methods to
            problems in mathematical and theoretical physics, with a recent
            focus on the related differential geometry.
          </Typography>

          <StyledTimeline>
            {positions.map((position, index) => (
              <TimelineItem key={index}>
                <TimelineSeparator>
                  <TimelineDot color="primary">
                    <WorkIcon />
                  </TimelineDot>
                  {index < positions.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="h6" component="span">
                    {position.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {position.institution}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {position.dates}
                  </Typography>
                </TimelineContent>
              </TimelineItem>
            ))}
          </StyledTimeline>
        </Box>
      </Container>
    </Box>
  );
};

export default Introduction;

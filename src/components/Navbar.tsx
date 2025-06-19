import React, { useState } from "react";
import {
  AppBar,
  Box,
  Container,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Toolbar,
  useTheme,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useColorMode } from "../App";

const navItems = [
  { name: "Introduction", id: "intro" },
  { name: "Research", id: "research" },
  { name: "Interests", id: "interests" },
  { name: "Contact", id: "contact" },
];

const Navbar: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { mode, toggleColorMode } = useColorMode();

  React.useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsScrolled(offset > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      handleClose();
    }
  };

  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={isScrolled ? 4 : 0}
      sx={{
        backgroundColor: isScrolled
          ? theme.palette.mode === "light"
            ? "rgba(255, 255, 255, 0.95)"
            : "rgba(18, 18, 18, 0.95)"
          : "transparent",
        backdropFilter: isScrolled ? "blur(20px)" : "none",
        transition: theme.transitions.create(
          ["background-color", "box-shadow", "backdrop-filter"],
          {
            duration: theme.transitions.duration.standard,
          }
        ),
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Button
            onClick={() => scrollToSection("intro")}
            sx={{
              color: "text.primary",
              fontWeight: 600,
              fontSize: "1.2rem",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "transparent",
              },
            }}
          >
            Dr Edward Hirst
          </Button>

          <Box sx={{ flexGrow: 1 }} />

          <Tooltip title={`Toggle ${mode === "light" ? "dark" : "light"} mode`}>
            <IconButton
              onClick={toggleColorMode}
              color="inherit"
              sx={{ mr: isMobile ? 1 : 2 }}
            >
              {mode === "light" ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>
          </Tooltip>

          {isMobile ? (
            <>
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMenu}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                {navItems.map((item) => (
                  <MenuItem
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                  >
                    {item.name}
                  </MenuItem>
                ))}
              </Menu>
            </>
          ) : (
            <Box sx={{ display: "flex", gap: 2 }}>
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  sx={{
                    color: "text.primary",
                    textTransform: "none",
                    position: "relative",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      width: "0%",
                      height: "2px",
                      bottom: 0,
                      left: "50%",
                      transform: "translateX(-50%)",
                      backgroundColor: "primary.main",
                      transition: "width 0.3s ease-in-out",
                    },
                    "&:hover::after": {
                      width: "100%",
                    },
                  }}
                >
                  {item.name}
                </Button>
              ))}
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;

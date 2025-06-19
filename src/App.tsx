import React, { useState, useMemo, createContext, useContext } from "react";
import { ThemeProvider, CssBaseline, PaletteMode } from "@mui/material";
import { getTheme } from "./theme";
import Navbar from "./components/Navbar";
import Introduction from "./components/Introduction";
import Research from "./components/Research";
import PersonalInterests from "./components/PersonalInterests";
import Contact from "./components/Contact";

// Create a context for color mode
export const ColorModeContext = createContext({
  toggleColorMode: () => {},
  mode: "light" as PaletteMode,
});

// Custom hook to use the color mode
export const useColorMode = () => useContext(ColorModeContext);

function App() {
  const [mode, setMode] = useState<PaletteMode>("light");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
      mode,
    }),
    [mode]
  );

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Navbar />
        <main>
          <Introduction />
          <Research />
          <PersonalInterests />
          <Contact />
        </main>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;

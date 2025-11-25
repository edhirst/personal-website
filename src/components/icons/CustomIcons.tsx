import React from "react";
import { SvgIcon, SvgIconProps, useTheme } from "@mui/material";

// Official ORCID icon
export const OrcidIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path
      d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947-.947-.431-.947-.947.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.025-5.325 5.025h-3.919V7.416zm1.444 1.303v7.444h2.297c3.272 0 4.022-2.484 4.022-3.722 0-2.016-1.284-3.722-4.003-3.722h-2.316z"
      fill="currentColor"
    />
  </SvgIcon>
);

// InspireHEP icon
export const InspireIcon: React.FC<SvgIconProps> = (props) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path
        d="M2 6C2 3.79086 3.79086 2 6 2H18C20.2091 2 22 3.79086 22 6V18C22 20.2091 20.2091 22 18 22H6C3.79086 22 2 20.2091 2 18V6Z"
        fill="currentColor"
      />
      <path
        d="M11 6H13V8H11V6ZM11 10V18H13V10H11Z"
        fill={isDarkMode ? "#000" : "#fff"}
      />
    </SvgIcon>
  );
};

// Google Scholar icon
export const GoogleScholarIcon: React.FC<SvgIconProps> = (props) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      {/* Official Google Scholar logo - combined path with nonzero fill rule */}
      <path
        d="M12 0L2.5 6.5v4L12 17l9.5-6.5v-4L12 0z M12 10c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5 6.5-2.91 6.5-6.5-2.91-6.5-6.5-6.5z"
        fill="currentColor"
        fillRule="nonzero"
      />
    </SvgIcon>
  );
};

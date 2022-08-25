import { ContentCopy } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  Link,
  TextareaAutosize,
  Toolbar,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Unstable_Grid2";
import { SnackbarProvider } from "notistack";
import * as React from "react";
import { useState, useEffect } from "react";

import BorderLinearProgress from "../components/BorderLinearProgress";
import Emoji from "../components/Emoji";
import SearchBar from "../components/SearchBar";
import { fetchRepoMetaData } from "../utils/supabaseClient";

const ListItem = styled("li")(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [packages, setPackages] = useState([]);
  const [chipData, setChipData] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const providerRef = React.useRef();

  useEffect(() => {
    if (inputText.trim().length) {
      // Debounce
      const timeout = setTimeout(async () => {
        await fetchRepoMetaData({
          ...{ setIsLoading, setPackages, inputText },
        }).catch(console.error);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [inputText]);

  const handleDelete = (chipToDelete) => () => {
    setChipData(
      (chips) => new Set([...chips].filter((x) => x !== chipToDelete))
    );
  };

  return (
    <SnackbarProvider
      maxSnack={1}
      ref={providerRef}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      autoHideDuration={1000}
    >
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" sx={{ alignItems: "center" }}>
          <Toolbar>
            <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
              <Emoji symbol="🪶" /> Volery
            </Typography>
          </Toolbar>
        </AppBar>
      </Box>
      <Box sx={{ width: "100%", flexGrow: 1 }}>
        <BorderLinearProgress
          variant={isLoading ? "query" : "determinate"}
          value={isLoading ? undefined : 0}
        />
      </Box>
      <Container className="container" sx={{ p: 3 }} maxWidth="xl">
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={2}>
            <Grid xs={12} justifyContent="center" display="flex">
              <Typography component="div" sx={{ flexGrow: 1 }} align="center">
                Volery is a time-saving package batch installation script
                generator for Arch Linux or Arch-Based distro users. Package
                lists from the{" "}
                <Link href="https://archlinux.org/packages/" underline="hover">
                  Arch Linux Official Repository
                </Link>{" "}
                and the{" "}
                <Link href="https://aur.archlinux.org/" underline="hover">
                  Arch User Repository (AUR)
                </Link>{" "}
                are updated once per hour.
              </Typography>
            </Grid>
            <Grid xs={12} justifyContent="center" display="flex">
              <ol>
                <li>
                  <Emoji symbol="🔍" /> Search for your favourite packages.
                </li>
                <li>
                  <Emoji symbol="📋" /> Copy the batch installation script to
                  your clipboard.
                </li>
                <li>
                  <Emoji symbol="💻" /> Voilà! Now paste it into your terminal
                  and install your packages!
                </li>
              </ol>
            </Grid>
            <Grid xs={12} justifyContent="center" display="flex">
              <SearchBar
                {...{ packages, chipData, setChipData, setInputText }}
              />
            </Grid>
            <Grid xs={12} justifyContent="center" display="flex">
              <Grid
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  listStyle: "none",
                  p: 0.5,
                  m: 0,
                  width: "80%",
                }}
                component="ul"
              >
                {[...chipData]
                  .sort(function (a, b) {
                    return a.localeCompare(b);
                  })
                  .map((pkgname) => {
                    return (
                      <ListItem key={pkgname}>
                        <Chip
                          color="success"
                          variant="outlined"
                          label={pkgname}
                          onDelete={handleDelete(pkgname)}
                        />
                      </ListItem>
                    );
                  })}
              </Grid>
            </Grid>
            <Grid xs={12} justifyContent="center" display="flex">
              <TextareaAutosize
                style={{ width: "90%" }}
                minRows={3}
                id="install-script"
                name="install-script"
                rows="4"
                cols="50"
                readOnly
                value={
                  chipData.size
                    ? `yay -S ${[...chipData]
                        .sort(function (a, b) {
                          return a.localeCompare(b);
                        })
                        .join(" ")}`
                    : "No packages added yet; use the search bar to add packages."
                }
              />
            </Grid>
            <Grid xs={12} justifyContent="center" display="flex">
              <Button
                disabled={!chipData.size}
                sx={{ width: "90%" }}
                variant="contained"
                startIcon={<ContentCopy />}
                onClick={() => {
                  navigator.clipboard.writeText(
                    document.getElementById("install-script").value
                  );
                  providerRef.current.enqueueSnackbar("Copied to clipboard!", {
                    variant: "success",
                  });
                }}
              >
                Copy to clipboard
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </SnackbarProvider>
  );
}

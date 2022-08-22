import {
  Computer,
  ContentCopy,
  Description,
  FolderOpenRounded,
  FolderSpecial,
  Search,
} from "@mui/icons-material";
import {
  AppBar,
  Autocomplete,
  Box,
  Button,
  Chip,
  Container,
  InputAdornment,
  LinearProgress,
  linearProgressClasses,
  Link,
  Stack,
  TextareaAutosize,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Unstable_Grid2";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
import * as React from "react";
import { useState, useEffect } from "react";

import { supabase } from "../utils/supabaseClient";

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 0,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: "#ffffff",
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 0,
    backgroundColor: theme.palette.mode === "light" ? "#1a90ff" : "#308fe8",
  },
}));

const Emoji = (props) => (
  <span
    className="emoji"
    role="img"
    aria-label={props.label ? props.label : ""}
    aria-hidden={props.label ? "false" : "true"}
  >
    {props.symbol}
  </span>
);

const ListItem = styled("li")(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [packages, setPackages] = useState([]);
  const [chipData, setChipData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const fetchRepoMetaData = async () => {
      setIsLoading(true);
      const archOfficial = await supabase
        .from("arch_official")
        .select("pkgname,repo,arch,pkgdesc")
        .like("pkgname", `%${inputText}%`)
        .order("pkgname", { ascending: true })
        .order("repo", { ascending: true })
        .order("arch", { ascending: true })
        .limit(15)
        .then(({ data, error }) => {
          if (!error) {
            return data.map((e) => {
              return {
                pkgname: e["pkgname"],
                repo: e["repo"],
                arch: e["arch"],
                description: e["pkgdesc"],
                isAUR: false,
              };
            });
          }
          return [];
        });
      const aur = await supabase
        .from("aur")
        .select("ID,Name,Description")
        .like("Name", `%${inputText}%`)
        .order("Name", { ascending: true })
        .order("ID", { ascending: true })
        .limit(15)
        .then(({ data, error }) => {
          if (!error) {
            return data.map((e) => {
              return {
                pkgname: e["Name"],
                ID: e["ID"],
                description: e["Description"],
                isAUR: true,
              };
            });
          }
          return [];
        });
      const chipPkgNames = chipData.map((e) => e.pkgname);
      const data = archOfficial
        .concat(aur)
        .filter((d) => !chipPkgNames.find((e) => d.pkgname === e));
      setPackages(data);
      setIsLoading(false);
    };
    if (inputText.trim().length) {
      // Debounce
      const timeout = setTimeout(async () => {
        await fetchRepoMetaData().catch(console.error);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [inputText, chipData]);

  const handleAdd = (newValue) => {
    setChipData((chips) => {
      if (
        newValue !== null &&
        !chips.find((e) => e.pkgname === newValue.pkgname)
      ) {
        const newChips = chips.concat([newValue]);
        newChips.sort(function (a, b) {
          return a.pkgname.localeCompare(b.pkgname);
        });
        return newChips;
      }
      return chips;
    });
  };

  const handleDelete = (chipToDelete) => () => {
    setChipData((chips) =>
      chips.filter((chip) => chip.pkgname !== chipToDelete.pkgname)
    );
  };

  return (
    <>
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
                Volery is a package batch installation script generator for Arch
                Linux or Arch-Like distro users. Package lists from the{" "}
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
                  <Emoji symbol="💻" /> Paste it into your terminal and install
                  your packages!
                </li>
              </ol>
            </Grid>
            <Grid xs={12} justifyContent="center" display="flex">
              <Autocomplete
                disablePortal
                id="package-combo-box"
                options={packages}
                sx={{ width: "100%" }}
                getOptionLabel={(e) => e.pkgname}
                onChange={(_, newValue) => {
                  if (newValue !== null) {
                    handleAdd(newValue);
                  }
                }}
                onInputChange={(_, newInputValue) => {
                  setInputText(newInputValue);
                }}
                isOptionEqualToValue={(option, value) =>
                  option.value === value.value
                }
                renderOption={(props, option, { inputValue }) => {
                  const matches = match(option.pkgname, inputValue, {
                    insideWords: true,
                  });
                  const parts = parse(option.pkgname, matches);

                  return (
                    <li
                      {...props}
                      key={
                        option.pkgname + option.repo + option.arch + option.ID
                      }
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="space-between"
                        width="100%"
                      >
                        <span style={{ alignSelf: "center" }}>
                          {parts.map((part, index) => (
                            <font
                              key={index}
                              style={{
                                fontWeight: part.highlight ? 700 : 400,
                              }}
                            >
                              {part.text}
                            </font>
                          ))}
                        </span>
                        <Stack direction="row" spacing={1}>
                          <Chip
                            color="info"
                            variant="outlined"
                            label={
                              option.description.length > 140
                                ? option.description.slice(0, 140 - 1) + "..."
                                : option.description
                            }
                            icon={<Description />}
                          />
                          {option.isAUR ? (
                            <Chip
                              color="secondary"
                              variant="outlined"
                              label={"AUR"}
                              icon={<FolderSpecial />}
                            />
                          ) : (
                            <>
                              <Chip
                                color="secondary"
                                variant="outlined"
                                label={option.repo}
                                icon={<FolderOpenRounded />}
                              />
                              <Chip
                                color="primary"
                                variant="outlined"
                                label={option.arch}
                                icon={<Computer />}
                              />
                            </>
                          )}
                        </Stack>
                      </Stack>
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label=""
                    placeholder="Search Package Name (Example: firefox)"
                    aria-placeholder="Search Package Name"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
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
                {chipData.map((data) => {
                  let icon;

                  return (
                    <ListItem key={data.pkgname}>
                      <Chip
                        color="success"
                        variant="outlined"
                        icon={icon}
                        label={data.pkgname}
                        onDelete={handleDelete(data)}
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
                  chipData.length
                    ? `yay -S ${chipData
                        .map((e) => e.pkgname)
                        .filter(function (item, pos, ary) {
                          return !pos || item !== ary[pos - 1];
                        })
                        .join(" ")}`
                    : "No packages added yet; use the search bar to add packages."
                }
              />
            </Grid>
            <Grid xs={12} justifyContent="center" display="flex">
              <Button
                sx={{ width: "90%" }}
                variant="contained"
                startIcon={<ContentCopy />}
                onClick={() => {
                  navigator.clipboard.writeText(
                    document.getElementById("install-script").value
                  );
                }}
              >
                Copy to clipboard
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
}

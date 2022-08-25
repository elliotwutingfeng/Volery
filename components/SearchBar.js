import {
  Computer,
  Description,
  FolderOpenRounded,
  FolderSpecial,
  Search,
} from "@mui/icons-material";
import {
  Autocomplete,
  Chip,
  InputAdornment,
  Stack,
  TextField,
} from "@mui/material";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";

const SearchBar = ({ packages, chipData, setChipData, setInputText }) => {
  const handleAdd = (newValue) => {
    setChipData((chips) => {
      if (newValue !== null && !chips.has(newValue.pkgname)) {
        return new Set(chips.add(newValue.pkgname));
      }
      return chips;
    });
  };
  return (
    <Autocomplete
      disablePortal
      id="package-combo-box"
      options={packages.filter((d) => !chipData.has(d.pkgname))}
      sx={{ width: "100%" }}
      getOptionLabel={(e) => e.pkgname}
      onChange={(_, newValue) => {
        if (newValue !== null) {
          handleAdd(newValue);
        }
      }}
      onInputChange={(_, newInputValue, reason) => {
        if (reason !== "reset") {
          setInputText(newInputValue);
        }
      }}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      renderOption={(props, option, { inputValue }) => {
        const matches = match(option?.pkgname, inputValue, {
          insideWords: true,
        });
        const parts = parse(option?.pkgname, matches);

        return (
          <li
            {...props}
            key={option?.pkgname + option?.repo + option?.arch + option?.ID}
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
                {option?.description && (
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
                )}
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
  );
};
export default SearchBar;

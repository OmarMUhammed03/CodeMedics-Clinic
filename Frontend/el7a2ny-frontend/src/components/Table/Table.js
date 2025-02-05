import { createContext } from "react";
import { Box, Container, Stack } from "@mui/material";
import Title from "./Body/Title";
import Header from "./Body/Header";
import Filters from "../Filters/Filters";
import Content from "./Body/Content";
import NoRecords from "../NoRecords";
import LoadingSpinner from "../Miscellaneous/LoadingSpinner";
const TableContext = createContext();

function Table({ value, title, filters }) {
  return (
    <TableContext.Provider value={value}>
      <Title title={title} />
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Header name={title} />
            <Filters filters={filters} />
            {value.loading ? (
              <LoadingSpinner />
            ) : value.data.length == 0 ? (
              <NoRecords message={value.noRecords} />
            ) : (
              <Content />
            )}
          </Stack>
        </Container>
      </Box>
      {popUpDisplay && popUpElement}
    </TableContext.Provider>
  );
}

export { Table, TableContext };

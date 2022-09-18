import * as React from "react";
import {
  ChakraProvider,
  Box,
  Text,
  Link,
  VStack,
  Code,
  Grid,
  theme,
} from "@chakra-ui/react";
import { ColorModeSwitcher } from "./ColorModeSwitcher";
import { Logo } from "./Logo";
import { Home } from "./components/Home/Home";

export const App = () => (
  <ChakraProvider theme={theme}>
    <Home />
  </ChakraProvider>
);
